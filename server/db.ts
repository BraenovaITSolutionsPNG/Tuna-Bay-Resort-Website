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
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price TEXT NOT NULL,
    features TEXT,
    image TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    text TEXT,
    image TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS gallery_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    src TEXT NOT NULL,
    alt TEXT,
    title TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`)

// Seed default admin/staff if none exist
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }
if (userCount.c === 0) {
  const hash = (p: string) => bcrypt.hashSync(p, 10)
  db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'admin@tunabay.com', hash('admin123'), 'Admin', 'admin'
  )
  db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'staff@tunabay.com', hash('staff123'), 'Staff', 'staff'
  )
}

// Seed rooms if empty
const roomCount = db.prepare('SELECT COUNT(*) as c FROM rooms').get() as { c: number }
if (roomCount.c === 0) {
  const rooms = [
    { name: 'Standard Room', description: 'Comfortable coastal rooms with modern amenities, perfect for couples or solo travelers.', price: 'K450/night', features: 'Queen Bed,Air Conditioning,Private Bathroom,WiFi', image: '/images/tuna-bay-waterfront.png' },
    { name: 'Deluxe Room', description: 'Spacious rooms with enhanced comfort and garden views for a relaxing stay.', price: 'K550/night', features: 'King Bed,Air Conditioning,Private Bathroom,WiFi,Balcony', image: '/images/tuna-bay-hero.jpg' },
    { name: 'Ocean View Suite', description: 'Stunning ocean views with separate living area, ideal for a special getaway.', price: 'K750/night', features: 'King Bed,Living Area,Ocean View,Air Conditioning,WiFi', image: '/images/tuna-bay-waterfront.png' },
    { name: 'Family Room', description: 'Generous space for families with multiple beds and all the comforts you need.', price: 'K650/night', features: '2 Queen Beds,Family Space,Air Conditioning,Private Bathroom,WiFi', image: '/images/tuna-bay-hero.jpg' },
    { name: 'Beachfront Villa', description: 'Ultimate luxury with direct beach access, private space and premium amenities.', price: 'K950/night', features: 'King Bed,Private Villa,Beach Access,Air Conditioning,WiFi,Kitchenette', image: '/images/tuna-bay-waterfront.png' },
  ]
  const stmt = db.prepare('INSERT INTO rooms (name, description, price, features, image) VALUES (?, ?, ?, ?, ?)')
  rooms.forEach(r => stmt.run(r.name, r.description, r.price, r.features, r.image))
}

// Seed facilities if empty
const facCount = db.prepare('SELECT COUNT(*) as c FROM facilities').get() as { c: number }
if (facCount.c === 0) {
  const facilities = [
    { title: 'Resort Rooms', text: 'Comfortable accommodation for overnight stays and relaxed coastal weekends.', image: '/images/tuna-bay-waterfront.png' },
    { title: 'Resort Swimming Pool', text: 'A spacious outdoor pool with separate shallow areas for relaxed family days.', image: '/images/tuna-bay-hero.jpg' },
    { title: 'Waterfront Jetty', text: 'Direct access to the bay with open views across the water and surrounding coast.', image: '/images/tuna-bay-waterfront.png' },
    { title: 'Restaurant & Bar', text: 'Covered, open-air dining with fresh meals, cold drinks and poolside service.', image: '/images/tuna-bay-hero.jpg' },
    { title: 'Function Spaces', text: 'Flexible indoor and outdoor areas for private parties, meetings and celebrations.', image: '/images/tuna-bay-waterfront.png' },
    { title: 'Family-Friendly Grounds', text: 'Open lawns and comfortable shaded spaces with room for everyone to unwind.', image: '/images/tuna-bay-hero.jpg' },
    { title: 'On-site Parking', text: 'Convenient guest parking located close to the pool, dining and event areas.', image: '/images/tuna-bay-waterfront.png' },
  ]
  const stmt = db.prepare('INSERT INTO facilities (title, text, image) VALUES (?, ?, ?)')
  facilities.forEach(f => stmt.run(f.title, f.text, f.image))
}

// Seed menu items if empty
const menuCount = db.prepare('SELECT COUNT(*) as c FROM menu_items').get() as { c: number }
if (menuCount.c === 0) {
  const items = [
    { category: 'dining', name: 'Tuna Bay Seafood Basket', description: 'Crispy fish, prawns, calamari, chips & house slaw', price: 'K85' },
    { category: 'dining', name: 'Chargrilled Reef Fish', description: 'Seasonal catch, coconut rice, greens & lime butter', price: 'K72' },
    { category: 'dining', name: 'Coastal Mixed Grill', description: 'Chicken, beef, sausage, chips & garden salad', price: 'K78' },
    { category: 'dining', name: 'Coconut Prawn Curry', description: 'Local prawns, fragrant coconut curry & steamed rice', price: 'K65' },
    { category: 'drinks', name: 'Tropical Fruit Cooler', description: 'Pineapple, passionfruit, lime & soda', price: 'K18' },
    { category: 'drinks', name: 'Local Beer Bucket', description: 'Five chilled local beers served on ice', price: 'K55' },
    { category: 'drinks', name: 'Tuna Bay Sunset', description: 'Rum, orange, pineapple & grenadine', price: 'K28' },
    { category: 'drinks', name: 'Fresh Coconut', description: 'Chilled whole young coconut', price: 'K15' },
    { category: 'hire', name: 'Pier Gathering', description: 'Reserved waterfront area for up to 20 guests', price: 'From K450' },
    { category: 'hire', name: 'Garden Celebration', description: 'Private lawn and seating for up to 50 guests', price: 'From K900' },
    { category: 'hire', name: 'Full Venue Function', description: 'Exclusive venue access with dedicated service team', price: 'From K2,500' },
    { category: 'hire', name: 'Family Day Pass', description: 'Weekend entry for two adults and up to three children', price: 'K60' },
  ]
  const stmt = db.prepare('INSERT INTO menu_items (category, name, description, price) VALUES (?, ?, ?, ?)')
  items.forEach(m => stmt.run(m.category, m.name, m.description, m.price))
}

// Seed gallery if empty
const galCount = db.prepare('SELECT COUNT(*) as c FROM gallery_images').get() as { c: number }
if (galCount.c === 0) {
  const images = [
    { src: '/images/tuna-bay-hero.jpg', alt: 'Aerial view of the Tuna Bay Resort pool and grounds', title: 'Poolside days' },
    { src: '/images/tuna-bay-waterfront.png', alt: 'Tuna Bay waterfront jetty surrounded by green coastline', title: 'The waterfront' },
  ]
  const stmt = db.prepare('INSERT INTO gallery_images (src, alt, title) VALUES (?, ?, ?)')
  images.forEach(g => stmt.run(g.src, g.alt, g.title))
}

export default db
