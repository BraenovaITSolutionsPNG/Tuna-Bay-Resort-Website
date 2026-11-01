import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

const USERS = [
  { email: 'admin@tunabay.com', password: 'admin123', name: 'Admin', role: 'admin' },
  { email: 'staff@tunabay.com', password: 'staff123', name: 'Staff', role: 'staff' },
]

export default function handler(req: any, res: any) {
  const path = (req.query?.path || []).join('/')
  const method = req.method

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return res.status(204).end()
  }

  // Health
  if (path === 'health') {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() })
  }

  // Auth login
  if (path === 'auth/login' && method === 'POST') {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })
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
    return res.json([])
  }

  // Booking create
  if (path === 'booking' && method === 'POST') {
    return res.json({ success: true, id: Date.now(), message: 'Booking request received' })
  }

  // Rooms
  if (path === 'rooms') {
    if (method === 'GET') return res.json([])
    if (method === 'POST') return res.json({ success: true, id: Date.now() })
  }

  // Facilities
  if (path === 'facilities') {
    if (method === 'GET') return res.json([])
    if (method === 'POST') return res.json({ success: true, id: Date.now() })
  }

  // Menu
  if (path === 'menu') {
    if (method === 'GET') return res.json([])
    if (method === 'POST') return res.json({ success: true, id: Date.now() })
  }

  // Gallery
  if (path === 'gallery') {
    if (method === 'GET') return res.json([])
    if (method === 'POST') return res.json({ success: true, id: Date.now() })
  }

  // Testimonials
  if (path === 'testimonials') {
    if (method === 'GET') return res.json([])
    if (method === 'POST') return res.json({ success: true, id: Date.now() })
  }

  // Settings
  if (path === 'settings') {
    if (method === 'GET') return res.json([])
    if (method === 'POST') return res.json({ success: true })
  }

  // Users
  if (path === 'users') {
    if (method === 'GET') return res.json([])
    if (method === 'POST') return res.json({ success: true, id: Date.now() })
  }

  // Dynamic id routes: bookings/:id, rooms/:id, etc.
  const segments = path.split('/')
  if (segments.length === 2) {
    const [resource, id] = segments
    if (['bookings', 'rooms', 'facilities', 'gallery', 'menu', 'testimonials', 'users'].includes(resource)) {
      if (method === 'PUT' || method === 'DELETE') {
        return res.json({ success: true })
      }
    }
  }

  return res.status(404).json({ error: 'Not found' })
}
