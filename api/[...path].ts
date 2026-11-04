import { neon } from '@neondatabase/serverless'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const DATABASE_URL = process.env.DATABASE_URL || ''

function getSql() {
  if (!DATABASE_URL) return null
  return neon(DATABASE_URL)
}

const USERS = [
  { email: 'admin@tunabay.com', password: 'admin123', name: 'Admin', role: 'admin' },
  { email: 'staff@tunabay.com', password: 'staff123', name: 'Staff', role: 'staff' },
]

export default async function handler(req: any, res: any) {
  let segments = Array.isArray(req.query?.path) ? req.query.path : req.query?.path ? [req.query.path] : []
  if (segments.length === 0 && req.url) {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname.replace(/^\/api\/?/, '')
      if (pathname) segments = pathname.split('/').filter(Boolean)
    } catch {}
  }
  const path = segments.join('/')
  const method = req.method

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return res.status(204).end()
  }

  const sql = getSql()

  // Health
  if (path === 'health') {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() })
  }

  // Auth login
  if (path === 'auth/login' && method === 'POST') {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })
    if (sql) {
      const rows = await sql`SELECT * FROM users WHERE email = ${String(email).trim()}`
      const user = rows[0] as { id: number; email: string; password_hash: string; name: string; role: string } | undefined
      if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '8h' })
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
    }
    const user = USERS.find(u => u.email === String(email).trim() && u.password === String(password))
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })
    const token = jwt.sign({ id: 1, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '8h' })
    return res.json({ token, user: { id: 1, email: user.email, name: user.name, role: user.role } })
  }

  // Availability
  if (path === 'availability') {
    return res.json({ available: true, conflicts: 0 })
  }

  // Bookings list
  if (path === 'bookings' && method === 'GET') {
    if (sql) {
      const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`
      return res.json(rows)
    }
    return res.json([])
  }

  // Booking create
  if (path === 'booking' && method === 'POST') {
    const { name, phone, bookingType, date, checkout, party, room, rooms, message } = req.body || {}
    if (!name || !phone || !bookingType || !date) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    if (sql) {
      const rows = await sql`
        INSERT INTO bookings (name, phone, booking_type, date, checkout, party, room, rooms, message)
        VALUES (${String(name).trim().slice(0, 100)}, ${String(phone).trim().slice(0, 20)}, ${String(bookingType).trim().slice(0, 50)}, ${String(date).trim()}, ${checkout ? String(checkout).trim() : null}, ${party ? String(party).trim().slice(0, 50) : null}, ${room ? String(room).trim().slice(0, 50) : null}, ${rooms ? String(rooms).trim().slice(0, 10) : null}, ${message ? String(message).trim().slice(0, 500) : null})
        RETURNING id
      `
      return res.json({ success: true, id: rows[0].id, message: 'Booking request received' })
    }
    return res.json({ success: true, id: Date.now(), message: 'Booking request received' })
  }

  // Rooms
  if (path === 'rooms') {
    if (method === 'GET') {
      if (sql) {
        const rows = await sql`SELECT * FROM rooms`
        return res.json(rows)
      }
      return res.json([])
    }
    if (method === 'POST') {
      if (sql) {
        const { name, description, price, features, image } = req.body || {}
        if (!name || !price) return res.status(400).json({ error: 'Missing name or price' })
        const rows = await sql`
          INSERT INTO rooms (name, description, price, features, image)
          VALUES (${String(name).trim()}, ${description ? String(description).trim() : null}, ${String(price).trim()}, ${features ? String(features).trim() : null}, ${image ? String(image).trim() : null})
          RETURNING id
        `
        return res.json({ success: true, id: rows[0].id })
      }
      return res.json({ success: true, id: Date.now() })
    }
  }

  // Facilities
  if (path === 'facilities') {
    if (method === 'GET') {
      if (sql) {
        const rows = await sql`SELECT * FROM facilities`
        return res.json(rows)
      }
      return res.json([])
    }
    if (method === 'POST') {
      if (sql) {
        const { title, text, image } = req.body || {}
        if (!title) return res.status(400).json({ error: 'Missing title' })
        const rows = await sql`
          INSERT INTO facilities (title, text, image) VALUES (${String(title).trim()}, ${text ? String(text).trim() : null}, ${image ? String(image).trim() : null}) RETURNING id
        `
        return res.json({ success: true, id: rows[0].id })
      }
      return res.json({ success: true, id: Date.now() })
    }
  }

  // Menu
  if (path === 'menu') {
    if (method === 'GET') {
      if (sql) {
        const rows = await sql`SELECT * FROM menu_items`
        return res.json(rows)
      }
      return res.json([])
    }
    if (method === 'POST') {
      if (sql) {
        const { category, name, description, price } = req.body || {}
        if (!name || !price) return res.status(400).json({ error: 'Missing name or price' })
        const rows = await sql`
          INSERT INTO menu_items (category, name, description, price)
          VALUES (${String(category || 'dining').trim()}, ${String(name).trim()}, ${description ? String(description).trim() : null}, ${String(price).trim()})
          RETURNING id
        `
        return res.json({ success: true, id: rows[0].id })
      }
      return res.json({ success: true, id: Date.now() })
    }
  }

  // Gallery
  if (path === 'gallery') {
    if (method === 'GET') {
      if (sql) {
        const rows = await sql`SELECT * FROM gallery_images`
        return res.json(rows)
      }
      return res.json([])
    }
    if (method === 'POST') {
      if (sql) {
        const { src, alt, title } = req.body || {}
        if (!src) return res.status(400).json({ error: 'Missing src' })
        const rows = await sql`
          INSERT INTO gallery_images (src, alt, title) VALUES (${String(src).trim()}, ${alt ? String(alt).trim() : null}, ${title ? String(title).trim() : null}) RETURNING id
        `
        return res.json({ success: true, id: rows[0].id })
      }
      return res.json({ success: true, id: Date.now() })
    }
  }

  // Testimonials
  if (path === 'testimonials') {
    if (method === 'GET') {
      if (sql) {
        const all = req.query?.all === 'true'
        const rows = all
          ? await sql`SELECT * FROM testimonials ORDER BY created_at DESC`
          : await sql`SELECT * FROM testimonials WHERE approved = TRUE ORDER BY created_at DESC`
        return res.json(rows)
      }
      return res.json([])
    }
    if (method === 'POST') {
      if (sql) {
        const { name, text, rating } = req.body || {}
        if (!name || !text) return res.status(400).json({ error: 'Missing name or text' })
        const rows = await sql`
          INSERT INTO testimonials (name, text, rating, approved) VALUES (${String(name).trim()}, ${String(text).trim()}, ${rating ? Number(rating) : 5}, FALSE) RETURNING id
        `
        return res.json({ success: true, id: rows[0].id })
      }
      return res.json({ success: true, id: Date.now() })
    }
  }

  // Settings
  if (path === 'settings') {
    if (method === 'GET') {
      if (sql) {
        const rows = await sql`SELECT * FROM settings`
        return res.json(rows)
      }
      return res.json([])
    }
    if (method === 'POST') {
      if (sql) {
        const { key, value } = req.body || {}
        if (!key) return res.status(400).json({ error: 'Missing key' })
        await sql`INSERT INTO settings (key, value) VALUES (${String(key).trim()}, ${String(value)}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
        return res.json({ success: true })
      }
      return res.json({ success: true })
    }
  }

  // Users
  if (path === 'users') {
    if (method === 'GET') {
      if (sql) {
        const rows = await sql`SELECT id, email, name, role, created_at FROM users`
        return res.json(rows)
      }
      return res.json([])
    }
    if (method === 'POST') {
      if (sql) {
        const { email, password, name, role } = req.body || {}
        if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' })
        const hash = bcrypt.hashSync(String(password), 10)
        const rows = await sql`
          INSERT INTO users (email, password_hash, name, role) VALUES (${String(email).trim()}, ${hash}, ${String(name).trim()}, ${role === 'admin' ? 'admin' : 'staff'}) RETURNING id
        `
        return res.json({ success: true, id: rows[0].id })
      }
      return res.json({ success: true, id: Date.now() })
    }
  }

  // Dynamic id routes
  if (segments.length === 2) {
    const [resource, id] = segments
    if (['bookings', 'rooms', 'facilities', 'gallery', 'menu', 'testimonials', 'users'].includes(resource)) {
      if (method === 'PUT') {
        if (sql) {
          if (resource === 'bookings') {
            const { status } = req.body || {}
            if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
              return res.status(400).json({ error: 'Invalid status' })
            }
            const rows = await sql`UPDATE bookings SET status = ${status} WHERE id = ${Number(id)} RETURNING id`
            if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
            return res.json({ success: true })
          }
          if (resource === 'testimonials') {
            const { approved } = req.body || {}
            const rows = await sql`UPDATE testimonials SET approved = ${approved === true} WHERE id = ${Number(id)} RETURNING id`
            if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
            return res.json({ success: true })
          }
          return res.json({ success: true })
        }
        return res.json({ success: true })
      }
      if (method === 'DELETE') {
        if (sql) {
          let rows: any[] = []
          if (resource === 'bookings') rows = await sql`DELETE FROM bookings WHERE id = ${Number(id)} RETURNING id`
          else if (resource === 'rooms') rows = await sql`DELETE FROM rooms WHERE id = ${Number(id)} RETURNING id`
          else if (resource === 'facilities') rows = await sql`DELETE FROM facilities WHERE id = ${Number(id)} RETURNING id`
          else if (resource === 'gallery') rows = await sql`DELETE FROM gallery_images WHERE id = ${Number(id)} RETURNING id`
          else if (resource === 'menu') rows = await sql`DELETE FROM menu_items WHERE id = ${Number(id)} RETURNING id`
          else if (resource === 'testimonials') rows = await sql`DELETE FROM testimonials WHERE id = ${Number(id)} RETURNING id`
          else if (resource === 'users') rows = await sql`DELETE FROM users WHERE id = ${Number(id)} RETURNING id`
          if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
          return res.json({ success: true })
        }
        return res.json({ success: true })
      }
    }
  }

  return res.status(404).json({ error: 'Not found' })
}
