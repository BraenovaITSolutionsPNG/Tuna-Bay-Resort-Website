import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export type AuthUser = { id: number; email: string; name: string; role: string }
declare global { namespace Express { interface Request { user?: AuthUser } } }

export function signToken(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '8h' })
}

function readToken(req: Request): string | null {
  const h = req.headers.authorization || ''
  if (h.startsWith('Bearer ')) return h.slice(7)
  return null
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = readToken(req)
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    req.user = jwt.verify(token, JWT_SECRET) as AuthUser
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    next()
  })
}
