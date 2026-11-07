import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createPaymentSession, getPaymentProvider, getStripePublishableKey, verifyWebhookSignature } from './payments.ts'
import { sendEmail, bookingConfirmationEmail, bookingStatusEmail, reminderEmail } from './emails.ts'

// Create a simple mock SQL implementation for development
const mockData = {
  users: [],
  bookings: [],
  rooms: [],
  facilities: [],
  menu_items: [],
  gallery_images: [],
  testimonials: [],
  settings: []
}

// Initialize mock database with seed data
async function initializeMockDatabase() {
  // Seed rooms if empty
  if (mockData.rooms.length === 0) {
    mockData.rooms.push(
      { id: 1, name: 'Standard Room', description: 'Comfortable coastal rooms', price: 'K450/night', features: 'Queen Bed, AC, Private Bathroom, WiFi', image: '/images/tuna-bay-waterfront.png' },
      { id: 2, name: 'Deluxe Room', description: 'Spacious rooms with garden views', price: 'K550/night', features: 'King Bed, AC, Private Bathroom, WiFi, Balcony', image: '/images/tuna-bay-hero.jpg' },
      { id: 3, name: 'Ocean View Suite', description: 'Stunning ocean views with separate living area', price: 'K750/night', features: 'King Bed, Living Area, Ocean View, AC, WiFi', image: '/images/tuna-bay-waterfront.png' },
      { id: 4, name: 'Family Room', description: 'Generous space for families', price: 'K650/night', features: '2 Queen Beds, Family Space, AC, Private Bathroom, WiFi', image: '/images/tuna-bay-hero.jpg' },
      { id: 5, name: 'Beachfront Villa', description: 'Ultimate luxury with direct beach access', price: 'K950/night', features: 'King Bed, Private Villa, Beach Access, AC, WiFi, Kitchenette', image: '/images/tuna-bay-waterfront.png' }
    )
  }

  // Seed facilities if empty
  if (mockData.facilities.length === 0) {
    mockData.facilities.push(
      { id: 1, title: 'Resort Rooms', text: 'Comfortable accommodation', image: '/images/tuna-bay-waterfront.png' },
      { id: 2, title: 'Resort Swimming Pool', text: 'A spacious outdoor pool', image: '/images/tuna-bay-hero.jpg' },
      { id: 3, title: 'Waterfront Jetty', text: 'Direct access to the bay', image: '/images/tuna-bay-waterfront.png' },
      { id: 4, title: 'Restaurant & Bar', text: 'Covered, open-air dining', image: '/images/tuna-bay-hero.jpg' },
      { id: 5, title: 'Function Spaces', text: 'Flexible indoor and outdoor areas', image: '/images/tuna-bay-waterfront.png' }
    )
  }

  // Seed menu if empty
  if (mockData.menu_items.length === 0) {
    mockData.menu_items.push(
      { id: 1, category: 'dining', name: 'Tuna Bay Seafood Basket', description: 'Crispy fish, prawns, calamari', price: 'K85' },
      { id: 2, category: 'dining', name: 'Chargrilled Reef Fish', description: 'Seasonal catch', price: 'K72' },
      { id: 3, category: 'dining', name: 'Coconut Prawn Curry', description: 'Local prawns, coconut curry', price: 'K65' },
      { id: 4, category: 'drinks', name: 'Tropical Fruit Cooler', description: 'Pineapple, passionfruit', price: 'K18' },
      { id: 5, category: 'hire', name: 'Family Day Pass', description: 'Weekend entry', price: 'K60' }
    )
  }

  // Create admin user
  if (mockData.users.length === 0) {
    const bcryptHash = (p: string) => bcrypt.hashSync(p, 10)
    mockData.users.push(
      { id: 1, email: 'admin@tunabay.com', password_hash: bcryptHash('admin123'), name: 'Admin', role: 'admin' },
      { id: 2, email: 'staff@tunabay.com', password_hash: bcryptHash('staff123'), name: 'Staff', role: 'staff' }
    )
  }
}

initializeMockDatabase().catch(console.error)

// Helper function to execute SQL queries
function executeQuery(sql: string, params?: any[]) {
  const sqlLower = sql.toLowerCase().trim()
  
  if (sqlLower.includes('create table')) {
    return []
  }
  
  if (sqlLower.includes('select')) {
    const tableMatch = sql.match(/from (\w+)/i)
    if (tableMatch && mockData[tableMatch[1] as keyof typeof mockData]) {
      return mockData[tableMatch[1] as keyof typeof mockData]
    }
    return []
  }
  
  if (sqlLower.includes('insert')) {
    const tableMatch = sql.match(/into (\w+)/i)
    if (tableMatch && params && params.length > 0) {
      const tableName = tableMatch[1]
      if (mockData[tableName as keyof typeof mockData]) {
        const id = mockData[tableName as keyof typeof mockData].length + 1
        mockData[tableName as keyof typeof mockData].push({ id, ...params[0] })
        return [{ id }]
      }
    }
    return []
  }
  
  if (sqlLower.includes('update')) {
    return []
  }
  
  if (sqlLower.includes('delete')) {
    return []
  }
  
  console.log('Mock SQL executed:', sql, params)
  return []
}

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3004', 'http://localhost:8443'],
  credentials: true
}))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many booking requests, please try again later.'
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later.'
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })
  const rows = executeQuery(`SELECT * FROM users WHERE email = ${String(email).trim()}`, [email])
  const user = rows[0] as { id: number; email: string; password_hash: string; name: string; role: string } | undefined
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '8h' })
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
})

app.post('/api/booking', bookingLimiter, async (req, res) => {
  const { name, phone, email, bookingType, date, checkout, party, room, rooms, message } = req.body
  if (!name || !phone || !bookingType || !date) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const id = mockData.bookings.length + 1
  const reference = `TB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const booking = {
    id, reference, name, phone, email: email || '', booking_type: bookingType,
    date, checkout: checkout || null, party: party || null, room: room || null,
    rooms: rooms || null, message: message || null, status: 'pending',
    payment_status: 'unpaid', payment_method: 'unpaid', payment_reference: null,
    created_at: new Date().toISOString()
  }
  mockData.bookings.push(booking)
  if (email) {
    const tpl = bookingConfirmationEmail({ name, reference, bookingType, date, checkout, party, room, message })
    await sendEmail({ to: email, ...tpl }).catch(() => {})
  }
  res.json({ success: true, id, reference, message: 'Booking request received', booking })
})

app.get('/api/rooms', async (req, res) => {
  const rows = executeQuery('SELECT * FROM rooms')
  res.json(rows)
})

app.get('/api/facilities', async (req, res) => {
  const rows = executeQuery('SELECT * FROM facilities')
  res.json(rows)
})

app.get('/api/menu', async (req, res) => {
  const rows = executeQuery('SELECT * FROM menu_items')
  res.json(rows)
})

function overlaps(a1: string, a2: string | null, b1: string, b2: string | null): boolean {
  const start1 = a1, end1 = a2 || a1
  const start2 = b1, end2 = b2 || b1
  return start1 < end2 && start2 < end1
}

app.get('/api/availability', (req, res) => {
  const room = String(req.query.room || '')
  const checkin = String(req.query.checkin || '')
  const checkout = String(req.query.checkout || req.query.checkin || '')
  if (!room || !checkin) return res.json({ available: true, conflicts: 0 })
  const roomName = room.toLowerCase()
  const conflicts = mockData.bookings.filter((b: any) => {
    if (b.status === 'cancelled') return false
    if (!b.room || String(b.room).toLowerCase() !== roomName) return false
    return overlaps(checkin, checkout, b.date, b.checkout)
  })
  res.json({ available: conflicts.length === 0, conflicts: conflicts.length })
})

app.get('/api/bookings', (req, res) => {
  res.json(mockData.bookings)
})

app.put('/api/bookings/:id', async (req, res) => {
  const id = Number(req.params.id)
  const idx = mockData.bookings.findIndex((b: any) => b.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  const allowed = ['name','email','phone','booking_type','date','checkout','party','room','rooms','message','status','payment_status','payment_method','payment_reference']
  for (const key of allowed) {
    if (req.body[key] !== undefined) mockData.bookings[idx][key] = req.body[key]
  }
  const booking = mockData.bookings[idx]
  if (booking.email && (req.body.status === 'confirmed' || req.body.status === 'cancelled')) {
    const email = bookingStatusEmail({ name: booking.name, reference: booking.reference, status: req.body.status })
    await sendEmail({ to: booking.email, ...email }).catch(() => {})
  }
  res.json({ success: true, booking })
})

app.delete('/api/bookings/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = mockData.bookings.findIndex((b: any) => b.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  mockData.bookings.splice(idx, 1)
  res.json({ success: true })
})

app.get('/api/testimonials', (req, res) => {
  const all = req.query.all === 'true'
  const rows = mockData.testimonials.filter((t: any) => all || t.approved)
  res.json(rows)
})

app.post('/api/testimonials', (req, res) => {
  const { name, text, rating, bookingReference } = req.body
  if (!name || !text) return res.status(400).json({ error: 'Name and text required' })
  if (bookingReference) {
    const booking = mockData.bookings.find((b: any) => b.reference === bookingReference)
    if (!booking) return res.status(400).json({ error: 'Invalid booking reference' })
    const checkout = booking.checkout || booking.date
    if (new Date(checkout) > new Date()) {
      return res.status(400).json({ error: 'Reviews can only be submitted after checkout' })
    }
  }
  const id = mockData.testimonials.length + 1
  mockData.testimonials.push({ id, name, text, rating: rating || 5, approved: false, created_at: new Date().toISOString() })
  res.json({ success: true, id })
})

app.put('/api/testimonials/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = mockData.testimonials.findIndex((t: any) => t.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  mockData.testimonials[idx] = { ...mockData.testimonials[idx], ...req.body }
  res.json({ success: true })
})

app.delete('/api/testimonials/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = mockData.testimonials.findIndex((t: any) => t.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  mockData.testimonials.splice(idx, 1)
  res.json({ success: true })
})

app.get('/api/gallery', (req, res) => {
  res.json(mockData.gallery_images)
})

app.post('/api/gallery', (req, res) => {
  const { src, alt, title } = req.body
  if (!src) return res.status(400).json({ error: 'src required' })
  const id = mockData.gallery_images.length + 1
  mockData.gallery_images.push({ id, src, alt: alt || null, title: title || null })
  res.json({ success: true, id })
})

app.delete('/api/gallery/:id', (req, res) => {
  const id = Number(req.params.id)
  const idx = mockData.gallery_images.findIndex((g: any) => g.id === id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  mockData.gallery_images.splice(idx, 1)
  res.json({ success: true })
})

app.get('/api/settings', (req, res) => {
  res.json(mockData.settings)
})

app.post('/api/settings', (req, res) => {
  const { key, value } = req.body
  if (!key) return res.status(400).json({ error: 'key required' })
  const idx = mockData.settings.findIndex((s: any) => s.key === key)
  if (idx === -1) mockData.settings.push({ key, value })
  else mockData.settings[idx].value = value
  res.json({ success: true })
})

app.post('/api/payments/create-session', async (req, res) => {
  const { bookingId, reference, amountK, currency = 'PGK', description, customerEmail, customerName, successUrl, cancelUrl } = req.body
  if (!bookingId || !amountK) return res.status(400).json({ error: 'Missing bookingId or amount' })
  const result = await createPaymentSession({
    bookingId, reference: reference || `TB-${bookingId}`, amountK: Number(amountK),
    currency, description: description || 'Tuna Bay Resort booking',
    customerEmail: customerEmail || '', customerName: customerName || '',
    successUrl: successUrl || 'http://localhost:8443/booking?paid=1',
    cancelUrl: cancelUrl || 'http://localhost:8443/booking?cancelled=1',
  })
  res.json(result)
})

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = String(req.headers['stripe-signature'] || '')
  const result = verifyWebhookSignature(req.body.toString(), sig)
  if (!result.ok) return res.status(400).json({ error: result.error })
  res.json({ received: true, type: result.event?.type })
})

app.get('/api/payments/config', (req, res) => {
  res.json({ provider: getPaymentProvider(), publishableKey: getStripePublishableKey() })
})

app.post('/api/emails/reminder', async (req, res) => {
  const { to, name, reference, date, checkout } = req.body
  if (!to) return res.status(400).json({ error: 'to required' })
  const email = reminderEmail({ name: name || 'Guest', reference: reference || '', date: date || '', checkout })
  const result = await sendEmail({ to, ...email })
  res.json(result)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app