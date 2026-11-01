import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import db from './db'

const app = express()
const PORT = process.env.PORT || 5000

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
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

// List bookings (admin)
app.get('/api/bookings', (req, res) => {
  const rows = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all()
  res.json(rows)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
