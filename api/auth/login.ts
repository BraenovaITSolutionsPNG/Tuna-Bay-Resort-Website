import jwt from 'jsonwebtoken'

const USERS = [
  { email: 'admin@tunabay.com', password: 'admin123', name: 'Admin', role: 'admin' },
  { email: 'staff@tunabay.com', password: 'staff123', name: 'Staff', role: 'staff' },
]

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' })
  }

  const user = USERS.find(u => u.email === String(email).trim() && u.password === String(password))
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = jwt.sign({ id: 1, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '8h' })
  res.json({ token, user: { id: 1, email: user.email, name: user.name, role: user.role } })
}

