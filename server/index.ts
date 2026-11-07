import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import { store, touch, nextId, flushStore } from './store.ts'
import { signToken, requireAdmin } from './auth.ts'
import { createPaymentSession, getPaymentProvider, getStripePublishableKey, verifyWebhookSignature } from './payments.ts'
import { sendEmail, bookingConfirmationEmail, bookingStatusEmail, reminderEmail } from './emails.ts'

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) || ['http://localhost:3004', 'http://localhost:8443'],
  credentials: true,
}))
// Stripe webhook needs raw body; mount before json
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = String(req.headers['stripe-signature'] || '')
  const raw = Buffer.isBuffer(req.body) ? req.body.toString() : String(req.body || '')
  const result = verifyWebhookSignature(raw, sig)
  if (!result.ok) return res.status(400).json({ error: result.error })
  if (result.event?.type === 'checkout.session.completed') {
    const meta = (result.event.data.object as any).metadata || {}
    const id = Number(meta.bookingId)
    const b = store.bookings.find((x: any) => x.id === id)
    if (b) { b.payment_status = 'paid'; b.payment_method = 'online'; b.payment_reference = (result.event.data.object as any).id; touch() }
  }
  res.json({ received: true, type: result.event?.type })
})
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests, please try again later.' }))
const bookingLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 8, message: 'Too many booking requests, please try again later.' })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 12, message: 'Too many login attempts, please try again later.' })

function overlaps(a1: string, a2: string | null, b1: string, b2: string | null) {
  const s1 = a1, e1 = a2 || a1, s2 = b1, e2 = b2 || b1
  return s1 < e2 && s2 < e1
}
function hasConflict(room: string, date: string, checkout: string | null, excludeId?: number) {
  const rn = String(room || '').toLowerCase()
  return store.bookings.some((b: any) => b.id !== excludeId && b.status !== 'cancelled' && String(b.room || '').toLowerCase() === rn && overlaps(date, checkout, b.date, b.checkout))
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// auth
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })
  const user = store.users.find((u: any) => String(u.email).toLowerCase() === String(email).toLowerCase()) as any
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) return res.status(401).json({ error: 'Invalid email or password' })
  const safe = { id: user.id, email: user.email, name: user.name, role: user.role }
  res.json({ token: signToken(safe), user: safe })
})
app.get('/api/auth/me', requireAdmin, (req, res) => res.json({ user: req.user }))

// public content
app.get('/api/rooms', (_req, res) => res.json(store.rooms))
app.get('/api/facilities', (_req, res) => res.json(store.facilities))
app.get('/api/menu', (_req, res) => res.json(store.menu_items))
app.get('/api/gallery', (_req, res) => res.json(store.gallery_images))
app.get('/api/settings', (_req, res) => res.json(store.settings))

app.get('/api/availability', (req, res) => {
  const room = String(req.query.room || '')
  const checkin = String(req.query.checkin || '')
  const checkout = String(req.query.checkout || req.query.checkin || '')
  if (!room || !checkin) return res.json({ available: true, conflicts: 0 })
  const conflict = hasConflict(room, checkin, checkout)
  res.json({ available: !conflict, conflicts: conflict ? 1 : 0 })
})

// booking
app.post('/api/booking', bookingLimiter, async (req, res) => {
  const { name, phone, email, bookingType, date, checkout, party, room, rooms, message } = req.body || {}
  if (!name || !phone || !bookingType || !date) return res.status(400).json({ error: 'Missing required fields' })
  if (bookingType === 'room' && room && hasConflict(room, date, checkout || null)) return res.status(409).json({ error: 'Selected room is not available for those dates.' })
  const id = nextId('bookings')
  const reference = `TB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const booking = {
    id, reference, name, phone, email: email || '', booking_type: bookingType,
    date, checkout: checkout || null, party: party || null, room: room || null,
    rooms: rooms || null, message: message || null, status: 'pending',
    payment_status: 'unpaid', payment_method: 'unpaid', payment_reference: null,
    created_at: new Date().toISOString(),
  }
  store.bookings.push(booking); touch()
  if (email) { const tpl = bookingConfirmationEmail({ name, reference, bookingType, date, checkout, party, room, message }); await sendEmail({ to: email, ...tpl }).catch(() => {}) }
  res.json({ success: true, id, reference, message: 'Booking request received', booking })
})

// admin bookings
app.get('/api/bookings', requireAdmin, (_req, res) => res.json(store.bookings))
app.put('/api/bookings/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id)
  const idx = store.bookings.findIndex((b: any) => b.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const allowed = ['name','email','phone','booking_type','date','checkout','party','room','rooms','message','status','payment_status','payment_method','payment_reference']
  for (const k of allowed) if (req.body[k] !== undefined) store.bookings[idx][k] = req.body[k]
  const b = store.bookings[idx]
  if ((b.status === 'confirmed' || req.body.status === 'confirmed') && b.booking_type === 'room' && b.room && hasConflict(b.room, b.date, b.checkout, b.id)) {
    // allow save but flag in response? keep strict: reject confirmation conflict
    if (req.body.status === 'confirmed') return res.status(409).json({ error: 'Cannot confirm: room conflicts with another booking.' })
  }
  touch()
  if (b.email && (req.body.status === 'confirmed' || req.body.status === 'cancelled')) {
    const email = bookingStatusEmail({ name: b.name, reference: b.reference, status: req.body.status })
    await sendEmail({ to: b.email, ...email }).catch(() => {})
  }
  res.json({ success: true, booking: b })
})
app.delete('/api/bookings/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const idx = store.bookings.findIndex((b: any) => b.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  store.bookings.splice(idx, 1); touch()
  res.json({ success: true })
})

// testimonials (public approved; admin sees all)
app.get('/api/testimonials', (req, res) => {
  const all = req.query.all === 'true'
  if (all) {
    // require admin for all view
    const h = req.headers.authorization || ''
    if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' })
    try { require('jsonwebtoken').verify(h.slice(7), process.env.JWT_SECRET || 'dev-secret-change-me') } catch { return res.status(401).json({ error: 'Invalid or expired session' }) }
    return res.json(store.testimonials)
  }
  res.json(store.testimonials.filter((t: any) => t.approved))
})
app.post('/api/testimonials', (req, res) => {
  const { name, text, rating, bookingReference } = req.body || {}
  if (!name || !text) return res.status(400).json({ error: 'Name and text required' })
  if (bookingReference) {
    const booking = store.bookings.find((b: any) => b.reference === bookingReference)
    if (!booking) return res.status(400).json({ error: 'Invalid booking reference' })
    const checkout = booking.checkout || booking.date
    if (new Date(checkout) > new Date()) return res.status(400).json({ error: 'Reviews can only be submitted after checkout' })
  }
  const id = nextId('testimonials')
  store.testimonials.push({ id, name, text, rating: rating || 5, approved: false, created_at: new Date().toISOString() }); touch()
  res.json({ success: true, id })
})
app.put('/api/testimonials/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id); const idx = store.testimonials.findIndex((t: any) => t.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  store.testimonials[idx] = { ...store.testimonials[idx], ...req.body }; touch(); res.json({ success: true })
})
app.delete('/api/testimonials/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id); const idx = store.testimonials.findIndex((t: any) => t.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  store.testimonials.splice(idx, 1); touch(); res.json({ success: true })
})

// admin content CRUD
for (const table of ['rooms','facilities','menu_items','gallery_images','settings'] as const) {
  const route = table === 'menu_items' ? '/api/menu' : table === 'gallery_images' ? '/api/gallery' : table === 'settings' ? '/api/settings' : `/api/${table}`
  app.post(route, requireAdmin, (req, res) => {
    if (table === 'settings') {
      const { key, value } = req.body || {}; if (!key) return res.status(400).json({ error: 'key required' })
      const idx = store.settings.findIndex((s: any) => s.key === key)
      if (idx === -1) store.settings.push({ key, value }); else store.settings[idx].value = value
      touch(); return res.json({ success: true })
    }
    const id = nextId(table); store[table].push({ id, ...req.body }); touch(); res.json({ success: true, id })
  })
  app.put(route + '/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id); const idx = (store[table] as any[]).findIndex((r: any) => r.id === id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    ;(store[table] as any[])[idx] = { ...(store[table] as any[])[idx], ...req.body }; touch(); res.json({ success: true })
  })
  app.delete(route + '/:id', requireAdmin, (req, res) => {
    if (table === 'settings') return res.status(400).json({ error: 'not supported' })
    const id = Number(req.params.id); const idx = (store[table] as any[]).findIndex((r: any) => r.id === id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    ;(store[table] as any[]).splice(idx, 1); touch(); res.json({ success: true })
  })
}

// users (admin)
app.get('/api/users', requireAdmin, (_req, res) => res.json(store.users.map((u: any) => ({ id: u.id, email: u.email, name: u.name, role: u.role }))))
app.post('/api/users', requireAdmin, (req, res) => {
  const { email, password, name, role } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  if (store.users.some((u: any) => u.email === email)) return res.status(409).json({ error: 'Email already exists' })
  const id = nextId('users'); store.users.push({ id, email, password_hash: bcrypt.hashSync(String(password), 10), name: name || email, role: role || 'staff' }); touch()
  res.json({ success: true, id })
})

// payments
app.post('/api/payments/create-session', async (req, res) => {
  const { bookingId, reference, amountK, amount, currency = 'PGK', description, customerEmail, customerName, successUrl, cancelUrl } = req.body || {}
  const amt = Number(amountK ?? amount)
  if (!bookingId || !amt) return res.status(400).json({ error: 'Missing bookingId or amount' })
  const result = await createPaymentSession({
    bookingId, reference: reference || `TB-${bookingId}`, amountK: amt,
    currency: String(currency || 'PGK').toUpperCase(), description: description || 'Tuna Bay Resort booking',
    customerEmail: customerEmail || '', customerName: customerName || '',
    successUrl: successUrl || `${req.headers.origin || 'http://localhost:8443'}/booking?paid=1`,
    cancelUrl: cancelUrl || `${req.headers.origin || 'http://localhost:8443'}/booking?cancelled=1`,
  })
  if (result.status === 'paid') { // mock instant
    const b = store.bookings.find((x: any) => x.id === Number(bookingId))
    if (b) { b.payment_status = 'paid'; b.payment_method = 'online'; b.payment_reference = result.transactionId; touch() }
  }
  res.json(result)
})
app.get('/api/payments/config', (_req, res) => res.json({ provider: getPaymentProvider(), publishableKey: getStripePublishableKey(), currency: 'PGK' }))

// email reminder (manual trigger) + simple auto scheduler
app.post('/api/emails/reminder', requireAdmin, async (req, res) => {
  const { to, name, reference, date, checkout } = req.body || {}
  if (!to) return res.status(400).json({ error: 'to required' })
  const email = reminderEmail({ name: name || 'Guest', reference: reference || '', date: date || '', checkout })
  const result = await sendEmail({ to, ...email })
  res.json(result)
})

function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
function runReminders() {
  const t = today()
  for (const b of store.bookings as any[]) {
    if (b.status === 'confirmed' && b.email && b.date === t && !b.reminder_sent) {
      const email = reminderEmail({ name: b.name || 'Guest', reference: b.reference, date: b.date, checkout: b.checkout })
      sendEmail({ to: b.email, ...email }).then((r) => { if (r.ok) { b.reminder_sent = true; touch() } }).catch(() => {})
    }
  }
}
setInterval(runReminders, 60 * 60 * 1000) // hourly check; idempotent per booking
runReminders()

process.on('SIGINT', () => { flushStore(); process.exit(0) })
process.on('SIGTERM', () => { flushStore(); process.exit(0) })

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} (persistent store)`))
}

export default app
