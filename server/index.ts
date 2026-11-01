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
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

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

// Booking endpoint
app.post('/api/booking', bookingLimiter, (req, res) => {
  const { name, phone, bookingType, date, checkout, party, room, rooms, message } = req.body

  if (!name || !phone || !bookingType || !date) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const stmt = db.prepare(`
    INSERT INTO bookings (name, phone, booking_type, date, checkout, party, room, rooms, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    String(name).trim().slice(0, 100),
    String(phone).trim().slice(0, 20),
    String(bookingType).trim().slice(0, 50),
    String(date).trim(),
    checkout ? String(checkout).trim() : null,
    party ? String(party).trim().slice(0, 50) : null,
    room ? String(room).trim().slice(0, 50) : null,
    rooms ? String(rooms).trim().slice(0, 10) : null,
    message ? String(message).trim().slice(0, 500) : null,
  )

  res.json({ success: true, id: result.lastInsertRowid, message: 'Booking request received' })
})

// List bookings (admin/staff)
app.get('/api/bookings', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all()
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

// Facilities
app.get('/api/facilities', (req, res) => {
  res.json(db.prepare('SELECT * FROM facilities').all())
})

// Menu
app.get('/api/menu', (req, res) => {
  res.json(db.prepare('SELECT * FROM menu_items').all())
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
