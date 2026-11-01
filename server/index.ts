import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sql, { initDb } from './db.ts'

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })
  const rows = await sql`SELECT * FROM users WHERE email = ${String(email).trim()}`
  const user = rows[0] as { id: number; email: string; password_hash: string; name: string; role: string } | undefined
  if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '8h' })
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
})

app.post('/api/booking', bookingLimiter, async (req, res) => {
  const { name, phone, bookingType, date, checkout, party, room, rooms, message } = req.body
  if (!name || !phone || !bookingType || !date) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const rows = await sql`
    INSERT INTO bookings (name, phone, booking_type, date, checkout, party, room, rooms, message)
    VALUES (${String(name).trim().slice(0, 100)}, ${String(phone).trim().slice(0, 20)}, ${String(bookingType).trim().slice(0, 50)}, ${String(date).trim()}, ${checkout ? String(checkout).trim() : null}, ${party ? String(party).trim().slice(0, 50) : null}, ${room ? String(room).trim().slice(0, 50) : null}, ${rooms ? String(rooms).trim().slice(0, 10) : null}, ${message ? String(message).trim().slice(0, 500) : null})
    RETURNING id
  `
  res.json({ success: true, id: rows[0].id, message: 'Booking request received' })
})

app.get('/api/bookings', authMiddleware, async (req, res) => {
  const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`
  res.json(rows)
})

app.put('/api/bookings/:id', authMiddleware, async (req, res) => {
  const { status } = req.body
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  const rows = await sql`UPDATE bookings SET status = ${status} WHERE id = ${Number(req.params.id)} RETURNING id`
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.delete('/api/bookings/:id', authMiddleware, async (req, res) => {
  const rows = await sql`DELETE FROM bookings WHERE id = ${Number(req.params.id)} RETURNING id`
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.get('/api/rooms', async (req, res) => {
  const rows = await sql`SELECT * FROM rooms`
  res.json(rows)
})

app.post('/api/rooms', authMiddleware, async (req, res) => {
  const { name, description, price, features, image } = req.body
  if (!name || !price) return res.status(400).json({ error: 'Missing name or price' })
  const rows = await sql`
    INSERT INTO rooms (name, description, price, features, image)
    VALUES (${String(name).trim()}, ${description ? String(description).trim() : null}, ${String(price).trim()}, ${features ? String(features).trim() : null}, ${image ? String(image).trim() : null})
    RETURNING id
  `
  res.json({ success: true, id: rows[0].id })
})

app.put('/api/rooms/:id', authMiddleware, async (req, res) => {
  const { name, description, price, features, image } = req.body
  const rows = await sql`
    UPDATE rooms SET name = ${String(name).trim()}, description = ${description ? String(description).trim() : null}, price = ${String(price).trim()}, features = ${features ? String(features).trim() : null}, image = ${image ? String(image).trim() : null}
    WHERE id = ${Number(req.params.id)} RETURNING id
  `
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.delete('/api/rooms/:id', authMiddleware, async (req, res) => {
  const rows = await sql`DELETE FROM rooms WHERE id = ${Number(req.params.id)} RETURNING id`
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.get('/api/facilities', async (req, res) => {
  const rows = await sql`SELECT * FROM facilities`
  res.json(rows)
})

app.post('/api/facilities', authMiddleware, async (req, res) => {
  const { title, text, image } = req.body
  if (!title) return res.status(400).json({ error: 'Missing title' })
  const rows = await sql`
    INSERT INTO facilities (title, text, image) VALUES (${String(title).trim()}, ${text ? String(text).trim() : null}, ${image ? String(image).trim() : null}) RETURNING id
  `
  res.json({ success: true, id: rows[0].id })
})

app.put('/api/facilities/:id', authMiddleware, async (req, res) => {
  const { title, text, image } = req.body
  const rows = await sql`
    UPDATE facilities SET title = ${String(title).trim()}, text = ${text ? String(text).trim() : null}, image = ${image ? String(image).trim() : null}
    WHERE id = ${Number(req.params.id)} RETURNING id
  `
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.delete('/api/facilities/:id', authMiddleware, async (req, res) => {
  const rows = await sql`DELETE FROM facilities WHERE id = ${Number(req.params.id)} RETURNING id`
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.get('/api/menu', async (req, res) => {
  const rows = await sql`SELECT * FROM menu_items`
  res.json(rows)
})

app.post('/api/menu', authMiddleware, async (req, res) => {
  const { category, name, description, price } = req.body
  if (!name || !price) return res.status(400).json({ error: 'Missing name or price' })
  const rows = await sql`
    INSERT INTO menu_items (category, name, description, price)
    VALUES (${String(category || 'dining').trim()}, ${String(name).trim()}, ${description ? String(description).trim() : null}, ${String(price).trim()})
    RETURNING id
  `
  res.json({ success: true, id: rows[0].id })
})

app.put('/api/menu/:id', authMiddleware, async (req, res) => {
  const { category, name, description, price } = req.body
  const rows = await sql`
    UPDATE menu_items SET category = ${String(category || 'dining').trim()}, name = ${String(name).trim()}, description = ${description ? String(description).trim() : null}, price = ${String(price).trim()}
    WHERE id = ${Number(req.params.id)} RETURNING id
  `
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.delete('/api/menu/:id', authMiddleware, async (req, res) => {
  const rows = await sql`DELETE FROM menu_items WHERE id = ${Number(req.params.id)} RETURNING id`
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.get('/api/gallery', async (req, res) => {
  const rows = await sql`SELECT * FROM gallery_images`
  res.json(rows)
})

app.post('/api/gallery', authMiddleware, async (req, res) => {
  const { src, alt, title } = req.body
  if (!src) return res.status(400).json({ error: 'Missing src' })
  const rows = await sql`
    INSERT INTO gallery_images (src, alt, title) VALUES (${String(src).trim()}, ${alt ? String(alt).trim() : null}, ${title ? String(title).trim() : null}) RETURNING id
  `
  res.json({ success: true, id: rows[0].id })
})

app.delete('/api/gallery/:id', authMiddleware, async (req, res) => {
  const rows = await sql`DELETE FROM gallery_images WHERE id = ${Number(req.params.id)} RETURNING id`
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.get('/api/testimonials', async (req, res) => {
  const rows = await sql`SELECT * FROM testimonials`
  res.json(rows)
})

app.post('/api/testimonials', async (req, res) => {
  const { name, text, rating } = req.body
  if (!name || !text) return res.status(400).json({ error: 'Missing name or text' })
  const rows = await sql`
    INSERT INTO testimonials (name, text, rating) VALUES (${String(name).trim()}, ${String(text).trim()}, ${rating ? Number(rating) : 5}) RETURNING id
  `
  res.json({ success: true, id: rows[0].id })
})

app.delete('/api/testimonials/:id', authMiddleware, async (req, res) => {
  const rows = await sql`DELETE FROM testimonials WHERE id = ${Number(req.params.id)} RETURNING id`
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.get('/api/users', authMiddleware, async (req, res) => {
  const user = (req as express.Request & { user: { role: string } }).user
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  const rows = await sql`SELECT id, email, name, role, created_at FROM users`
  res.json(rows)
})

app.post('/api/users', authMiddleware, async (req, res) => {
  const user = (req as express.Request & { user: { role: string } }).user
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  const { email, password, name, role } = req.body
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' })
  const hash = bcrypt.hashSync(String(password), 10)
  const rows = await sql`
    INSERT INTO users (email, password_hash, name, role) VALUES (${String(email).trim()}, ${hash}, ${String(name).trim()}, ${role === 'admin' ? 'admin' : 'staff'}) RETURNING id
  `
  res.json({ success: true, id: rows[0].id })
})

app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  const user = (req as express.Request & { user: { role: string; id: number } }).user
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  if (Number(req.params.id) === user.id) return res.status(400).json({ error: 'Cannot delete yourself' })
  const rows = await sql`DELETE FROM users WHERE id = ${Number(req.params.id)} RETURNING id`
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

app.get('/api/settings', async (req, res) => {
  const rows = await sql`SELECT * FROM settings`
  res.json(rows)
})

app.post('/api/settings', authMiddleware, async (req, res) => {
  const { key, value } = req.body
  if (!key) return res.status(400).json({ error: 'Missing key' })
  await sql`INSERT INTO settings (key, value) VALUES (${String(key).trim()}, ${String(value)}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
  res.json({ success: true })
})

app.get('/api/availability', (req, res) => {
  res.json({ available: true, conflicts: 0 })
})

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(err => {
  console.error('DB init failed:', err)
  process.exit(1)
})

export default app
