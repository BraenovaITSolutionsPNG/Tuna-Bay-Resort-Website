import Database from 'better-sqlite3'
import path from 'node:path'

const db = new Database(path.resolve(process.cwd(), 'data', 'tunabay.db'))
db.pragma('journal_mode = WAL')

db.exec(`
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
  )
`)

export default db
