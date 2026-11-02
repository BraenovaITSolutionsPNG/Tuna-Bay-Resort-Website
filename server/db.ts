import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL || '')

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','staff')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price TEXT NOT NULL,
      features TEXT,
      image TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS facilities (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      text TEXT,
      image TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id SERIAL PRIMARY KEY,
      src TEXT NOT NULL,
      alt TEXT,
      title TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      text TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      approved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  // Migration: add approved column if missing
  await sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE`

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `

  const users = await sql`SELECT COUNT(*) as c FROM users`
  if (Number(users[0].c) === 0) {
    const hash = (p: string) => bcrypt.hashSync(p, 10)
    await sql`INSERT INTO users (email, password_hash, name, role) VALUES ('admin@tunabay.com', ${hash('admin123')}, 'Admin', 'admin')`
    await sql`INSERT INTO users (email, password_hash, name, role) VALUES ('staff@tunabay.com', ${hash('staff123')}, 'Staff', 'staff')`
  }

  // Seed rooms if empty
  const roomCount = await sql`SELECT COUNT(*) as c FROM rooms`
  if (Number(roomCount[0].c) === 0) {
    const rooms = [
      { name: 'Standard Room', description: 'Comfortable coastal rooms with modern amenities, perfect for couples or solo travelers.', price: 'K450/night', features: 'Queen Bed,Air Conditioning,Private Bathroom,WiFi', image: '/images/tuna-bay-waterfront.png' },
      { name: 'Deluxe Room', description: 'Spacious rooms with enhanced comfort and garden views for a relaxing stay.', price: 'K550/night', features: 'King Bed,Air Conditioning,Private Bathroom,WiFi,Balcony', image: '/images/tuna-bay-hero.jpg' },
      { name: 'Ocean View Suite', description: 'Stunning ocean views with separate living area, ideal for a special getaway.', price: 'K750/night', features: 'King Bed,Living Area,Ocean View,Air Conditioning,WiFi', image: '/images/tuna-bay-waterfront.png' },
      { name: 'Family Room', description: 'Generous space for families with multiple beds and all the comforts you need.', price: 'K650/night', features: '2 Queen Beds,Family Space,Air Conditioning,Private Bathroom,WiFi', image: '/images/tuna-bay-hero.jpg' },
      { name: 'Beachfront Villa', description: 'Ultimate luxury with direct beach access, private space and premium amenities.', price: 'K950/night', features: 'King Bed,Private Villa,Beach Access,Air Conditioning,WiFi,Kitchenette', image: '/images/tuna-bay-waterfront.png' },
    ]
    for (const r of rooms) {
      await sql`INSERT INTO rooms (name, description, price, features, image) VALUES (${r.name}, ${r.description}, ${r.price}, ${r.features}, ${r.image})`
    }
  }

  // Seed facilities if empty
  const facCount = await sql`SELECT COUNT(*) as c FROM facilities`
  if (Number(facCount[0].c) === 0) {
    const facilities = [
      { title: 'Resort Rooms', text: 'Comfortable accommodation for overnight stays and relaxed coastal weekends.', image: '/images/tuna-bay-waterfront.png' },
      { title: 'Resort Swimming Pool', text: 'A spacious outdoor pool with separate shallow areas for relaxed family days.', image: '/images/tuna-bay-hero.jpg' },
      { title: 'Waterfront Jetty', text: 'Direct access to the bay with open views across the water and surrounding coast.', image: '/images/tuna-bay-waterfront.png' },
      { title: 'Restaurant & Bar', text: 'Covered, open-air dining with fresh meals, cold drinks and poolside service.', image: '/images/tuna-bay-hero.jpg' },
      { title: 'Function Spaces', text: 'Flexible indoor and outdoor areas for private parties, meetings and celebrations.', image: '/images/tuna-bay-waterfront.png' },
      { title: 'Family-Friendly Grounds', text: 'Open lawns and comfortable shaded spaces with room for everyone to unwind.', image: '/images/tuna-bay-hero.jpg' },
      { title: 'On-site Parking', text: 'Convenient guest parking located close to the pool, dining and event areas.', image: '/images/tuna-bay-waterfront.png' },
    ]
    for (const f of facilities) {
      await sql`INSERT INTO facilities (title, text, image) VALUES (${f.title}, ${f.text}, ${f.image})`
    }
  }

  // Seed menu if empty
  const menuCount = await sql`SELECT COUNT(*) as c FROM menu_items`
  if (Number(menuCount[0].c) === 0) {
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
    for (const m of items) {
      await sql`INSERT INTO menu_items (category, name, description, price) VALUES (${m.category}, ${m.name}, ${m.description}, ${m.price})`
    }
  }

  // Seed gallery if empty
  const galCount = await sql`SELECT COUNT(*) as c FROM gallery_images`
  if (Number(galCount[0].c) === 0) {
    await sql`INSERT INTO gallery_images (src, alt, title) VALUES ('/images/tuna-bay-hero.jpg', 'Aerial view of the Tuna Bay Resort pool and grounds', 'Poolside days')`
    await sql`INSERT INTO gallery_images (src, alt, title) VALUES ('/images/tuna-bay-waterfront.png', 'Tuna Bay waterfront jetty surrounded by green coastline', 'The waterfront')`
  }

  // Seed testimonials if empty
  const testCount = await sql`SELECT COUNT(*) as c FROM testimonials`
  if (Number(testCount[0].c) === 0) {
    await sql`INSERT INTO testimonials (name, text, rating, approved) VALUES ('Sarah K.', 'A wonderful escape from the city. The seafood was incredible and the staff were so welcoming.', 5, TRUE)`
    await sql`INSERT INTO testimonials (name, text, rating, approved) VALUES ('Mark T.', 'Perfect venue for our family gathering. The pool area is great for kids.', 5, TRUE)`
    await sql`INSERT INTO testimonials (name, text, rating, approved) VALUES ('Grace M.', 'Beautiful sunset views from the jetty. Will definitely come back.', 4, TRUE)`
    await sql`INSERT INTO testimonials (name, text, rating, approved) VALUES ('James K.', 'Beautiful place to visit over the weekends. I just have one thing to say please improve the toilets.', 3, TRUE)`
  }
}

  // Seed test bookings if empty
  const bookingCount = await sql`SELECT COUNT(*) as c FROM bookings`
  if (Number(bookingCount[0].c) === 0) {
    const types = ['room', 'table', 'function', 'day-pass', 'general']
    const rooms = ['Standard Room', 'Deluxe Room', 'Ocean View Suite', 'Family Room', 'Beachfront Villa']
    const names = ['John Doe', 'Jane Smith', 'Peter Kalu', 'Mary Tama', 'David Ora', 'Sarah Numa', 'James Kila', 'Grace Moka', 'Tom Hiri', 'Lisa Buka', 'Paul Raga', 'Anna Kone', 'Mark Saea', 'Ruth Igo', 'Steve Puka']
    for (let i = 0; i < 25; i++) {
      const type = types[i % types.length]
      const isRoom = type === 'room'
      await sql`
        INSERT INTO bookings (name, phone, booking_type, date, checkout, party, room, rooms, message, status)
        VALUES (
          ${names[i % names.length]},
          ${'+675 7' + Math.floor(Math.random() * 9000000 + 1000000)},
          ${type},
          ${'2026-11-' + String((i % 28) + 1).padStart(2, '0')},
          ${isRoom ? '2026-11-' + String((i % 28) + 3).padStart(2, '0') : null},
          ${isRoom ? ((i % 4) + 1) + ' guests' : ((i % 8) + 2) + ' guests'},
          ${isRoom ? rooms[i % rooms.length] : null},
          ${isRoom ? String((i % 3) + 1) : null},
          ${i % 3 === 0 ? 'Looking forward to visiting!' : null},
          ${i % 4 === 0 ? 'confirmed' : 'pending'}
        )
      `
    }
  }
  // Approve seeded testimonials
  await sql`UPDATE testimonials SET approved = TRUE WHERE name IN ('Sarah K.', 'Mark T.', 'Grace M.', 'James K.')`

export default sql
