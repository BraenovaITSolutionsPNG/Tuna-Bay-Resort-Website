import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import db from './db.ts'

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3004', 'http://localhost:8443'],
  credentials: true
}))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// Rate limiting
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

const BOOKING_TYPES = ['room', 'table', 'function', 'day-pass', 'general'] as const

const ROOM_SLUGS: Record<string, string> = {
  standard: 'Standard Room',
  deluxe: 'Deluxe Room',
  'ocean-view': 'Ocean View Suite',
  family: 'Family Room',
  beachfront: 'Beachfront Villa',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(value: unknown, maxLength = 100): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function makeBookingReference(): string {
  return `TB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

// Auth middleware
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { id: number; role: string }
    (req as express.Request & { user: { id: number; role: string } }).user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Login
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim()) as
    | { id: number; email: string; password_hash: string; name: string; role: string }
    | undefined

  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '8h' })
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
})

// Booking endpoint — creates a reservation request
app.post('/api/booking', bookingLimiter, (req, res) => {
  const body = req.body ?? {}
  const name = clean(body.name, 100)
  const email = clean(body.email, 120).toLowerCase()
  const phone = clean(body.phone, 30)
  const bookingType = clean(body.bookingType, 30)
  const date = clean(body.date, 10)
  const checkout = clean(body.checkout, 10)
  const party = clean(body.party, 30)
  const room = clean(body.room, 30)
  const rooms = clean(body.rooms, 10) || '1'
  const message = clean(body.message, 600)

  const errors: string[] = []
  if (!name) errors.push('Please enter your name.')
  if (!email) errors.push('Please enter your email address.')
  else if (!EMAIL_PATTERN.test(email)) errors.push('Please enter a valid email address.')
  if (!phone) errors.push('Please enter a phone number.')
  if (!BOOKING_TYPES.includes(bookingType as (typeof BOOKING_TYPES)[number])) {
    errors.push('Please choose a valid booking type.')
  }
  if (!date) errors.push('Please choose a date.')

  if (bookingType === 'room') {
    if (!ROOM_SLUGS[room]) errors.push('Please select a room.')
    if (!checkout) errors.push('Please choose a check-out date.')
    else if (date && checkout <= date) errors.push('Check-out must be after check-in.')
    if (!party || Number(party) < 1) errors.push('Please enter the number of guests.')
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors[0], errors })
  }

  const roomName = bookingType === 'room' ? ROOM_SLUGS[room] : null

  // Prevent double bookings for room stays.
  if (bookingType === 'room' && roomName && checkout) {
    const conflicts = db.prepare(`
      SELECT id, date, checkout FROM bookings
      WHERE booking_type = 'room'
        AND status IN ('pending', 'confirmed')
        AND room = ?
        AND date < ?
        AND (checkout IS NULL OR checkout > ?)
    `).all(roomName, checkout, date) as Array<{ id: number; date: string; checkout: string | null }>

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: 'This room is already reserved for the selected dates. Please choose different dates or another room.',
        conflicts,
      })
    }
  }

  const reference = makeBookingReference()
  const result = db.prepare(`
    INSERT INTO bookings (reference, name, email, phone, booking_type, date, checkout, party, room, rooms, message, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    reference,
    name,
    email,
    phone,
    bookingType,
    date,
    bookingType === 'room' ? checkout : null,
    party || null,
    roomName,
    bookingType === 'room' ? rooms : null,
    message || null,
  )

  res.status(201).json({
    success: true,
    booking: {
      id: Number(result.lastInsertRowid),
      reference,
      name,
      email,
      phone,
      booking_type: bookingType,
      date,
      checkout: bookingType === 'room' ? checkout : null,
      party: party || null,
      room: roomName,
      rooms: bookingType === 'room' ? rooms : null,
      message: message || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  })
})

// List bookings (admin/staff)
app.get('/api/bookings', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC, id DESC').all()
  res.json(rows)
})

// Update booking status
app.put('/api/bookings/:id', authMiddleware, (req, res) => {
  const { status } = req.body
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  const result = db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

// Delete booking
app.delete('/api/bookings/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

// Rooms
app.get('/api/rooms', (req, res) => {
  res.json(db.prepare('SELECT * FROM rooms').all())
})

app.post('/api/rooms', authMiddleware, (req, res) => {
  const { name, description, price, features, image } = req.body
  if (!name || !price) return res.status(400).json({ error: 'Missing name or price' })
  const result = db.prepare('INSERT INTO rooms (name, description, price, features, image) VALUES (?, ?, ?, ?, ?)').run(
    String(name).trim(),
    description ? String(description).trim() : null,
    String(price).trim(),
    features ? String(features).trim() : null,
    image ? String(image).trim() : null,
  )
  res.json({ success: true, id: result.lastInsertRowid })
})

app.put('/api/rooms/:id', authMiddleware, (req, res) => {
  const { name, description, price, features, image } = req.body
  const result = db.prepare('UPDATE rooms SET name=?, description=?, price=?, features=?, image=? WHERE id=?').run(
    String(name).trim(),
    description ? String(description).trim() : null,
    String(price).trim(),
    features ? String(features).trim() : null,
    image ? String(image).trim() : null,
    req.params.id,
  )
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.delete('/api/rooms/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM rooms WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

// Facilities
app.get('/api/facilities', (req, res) => {
  res.json(db.prepare('SELECT * FROM facilities').all())
})

app.post('/api/facilities', authMiddleware, (req, res) => {
  const { title, text, image } = req.body
  if (!title) return res.status(400).json({ error: 'Missing title' })
  const result = db.prepare('INSERT INTO facilities (title, text, image) VALUES (?, ?, ?)').run(
    String(title).trim(),
    text ? String(text).trim() : null,
    image ? String(image).trim() : null,
  )
  res.json({ success: true, id: result.lastInsertRowid })
})

app.put('/api/facilities/:id', authMiddleware, (req, res) => {
  const { title, text, image } = req.body
  const result = db.prepare('UPDATE facilities SET title=?, text=?, image=? WHERE id=?').run(
    String(title).trim(),
    text ? String(text).trim() : null,
    image ? String(image).trim() : null,
    req.params.id,
  )
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.delete('/api/facilities/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM facilities WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

// Menu
app.get('/api/menu', (req, res) => {
  res.json(db.prepare('SELECT * FROM menu_items').all())
})

app.post('/api/menu', authMiddleware, (req, res) => {
  const { category, name, description, price } = req.body
  if (!name || !price) return res.status(400).json({ error: 'Missing name or price' })
  const result = db.prepare('INSERT INTO menu_items (category, name, description, price) VALUES (?, ?, ?, ?)').run(
    String(category || 'dining').trim(),
    String(name).trim(),
    description ? String(description).trim() : null,
    String(price).trim(),
  )
  res.json({ success: true, id: result.lastInsertRowid })
})

app.put('/api/menu/:id', authMiddleware, (req, res) => {
  const { category, name, description, price } = req.body
  const result = db.prepare('UPDATE menu_items SET category=?, name=?, description=?, price=? WHERE id=?').run(
    String(category || 'dining').trim(),
    String(name).trim(),
    description ? String(description).trim() : null,
    String(price).trim(),
    req.params.id,
  )
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.delete('/api/menu/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

// Gallery
app.get('/api/gallery', (req, res) => {
  res.json(db.prepare('SELECT * FROM gallery_images').all())
})

app.post('/api/gallery', authMiddleware, (req, res) => {
  const { src, alt, title } = req.body
  if (!src) return res.status(400).json({ error: 'Missing src' })
  const result = db.prepare('INSERT INTO gallery_images (src, alt, title) VALUES (?, ?, ?)').run(
    String(src).trim(),
    alt ? String(alt).trim() : null,
    title ? String(title).trim() : null,
  )
  res.json({ success: true, id: result.lastInsertRowid })
})

app.delete('/api/gallery/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM gallery_images WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

// Testimonials
app.get('/api/testimonials', (req, res) => {
  res.json(db.prepare('SELECT * FROM testimonials').all())
})

app.post('/api/testimonials', authMiddleware, (req, res) => {
  const { name, text, rating } = req.body
  if (!name || !text) return res.status(400).json({ error: 'Missing name or text' })
  const result = db.prepare('INSERT INTO testimonials (name, text, rating) VALUES (?, ?, ?)').run(
    String(name).trim(),
    String(text).trim(),
    rating ? Number(rating) : 5,
  )
  res.json({ success: true, id: result.lastInsertRowid })
})

app.delete('/api/testimonials/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

// Users (admin only)
app.get('/api/users', authMiddleware, (req, res) => {
  const user = (req as express.Request & { user: { role: string } }).user
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  res.json(db.prepare('SELECT id, email, name, role, created_at FROM users').all())
})

app.post('/api/users', authMiddleware, (req, res) => {
  const user = (req as express.Request & { user: { role: string } }).user
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  const { email, password, name, role } = req.body
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' })
  const hash = bcrypt.hashSync(String(password), 10)
  const result = db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    String(email).trim(),
    hash,
    String(name).trim(),
    role === 'admin' ? 'admin' : 'staff',
  )
  res.json({ success: true, id: result.lastInsertRowid })
})

app.delete('/api/users/:id', authMiddleware, (req, res) => {
  const user = (req as express.Request & { user: { role: string; id: number } }).user
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  if (Number(req.params.id) === user.id) return res.status(400).json({ error: 'Cannot delete yourself' })
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

// Settings
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all() as { key: string; value: string }[]
  res.json(rows)
})

app.post('/api/settings', authMiddleware, (req, res) => {
  const { key, value } = req.body
  if (!key) return res.status(400).json({ error: 'Missing key' })
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(String(key).trim(), String(value))
  res.json({ success: true })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
