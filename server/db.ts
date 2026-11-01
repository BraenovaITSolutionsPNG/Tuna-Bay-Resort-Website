import Database from 'better-sqlite3'
import path from 'node:path'
import bcrypt from 'bcryptjs'

const db = new Database(path.resolve(process.cwd(), 'data', 'tunabay.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','staff')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    booking_type TEXT NOT NULL,
    date TEXT NOT NULL,
    checkout TEXT,
    party TEXT,
    room TEXT,
    rooms TEXT,
    message TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

// Seed default admin/staff if none exist
const count = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }
if (count.c === 0) {
  const hash = (p: string) => bcrypt.hashSync(p, 10)
  db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'admin@tunabay.com', hash('admin123'), 'Admin', 'admin'
  )
  db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'staff@tunabay.com', hash('staff123'), 'Staff', 'staff'
  )
}

export default db
