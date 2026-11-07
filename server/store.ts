import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const DATA_FILE = process.env.DATA_FILE || path.join(process.cwd(), 'data', 'tunabay.json')

export type AnyRow = Record<string, any>
export type Store = {
  users: AnyRow[]
  bookings: AnyRow[]
  rooms: AnyRow[]
  facilities: AnyRow[]
  menu_items: AnyRow[]
  gallery_images: AnyRow[]
  testimonials: AnyRow[]
  settings: AnyRow[]
}

const empty = (): Store => ({ users: [], bookings: [], rooms: [], facilities: [], menu_items: [], gallery_images: [], testimonials: [], settings: [] })

function seed(s: Store) {
  if (s.rooms.length === 0) s.rooms.push(
    { id: 1, name: 'Standard Room', description: 'Comfortable coastal rooms', price: 'K450/night', features: 'Queen Bed, AC, Private Bathroom, WiFi', image: '/images/tuna-bay-waterfront.png' },
    { id: 2, name: 'Deluxe Room', description: 'Spacious rooms with garden views', price: 'K550/night', features: 'King Bed, AC, Private Bathroom, WiFi, Balcony', image: '/images/tuna-bay-hero.jpg' },
    { id: 3, name: 'Ocean View Suite', description: 'Stunning ocean views with separate living area', price: 'K750/night', features: 'King Bed, Living Area, Ocean View, AC, WiFi', image: '/images/tuna-bay-waterfront.png' },
    { id: 4, name: 'Family Room', description: 'Generous space for families', price: 'K650/night', features: '2 Queen Beds, Family Space, AC, Private Bathroom, WiFi', image: '/images/tuna-bay-hero.jpg' },
    { id: 5, name: 'Beachfront Villa', description: 'Ultimate luxury with direct beach access', price: 'K950/night', features: 'King Bed, Private Villa, Beach Access, AC, WiFi, Kitchenette', image: '/images/tuna-bay-waterfront.png' },
  )
  if (s.facilities.length === 0) s.facilities.push(
    { id: 1, title: 'Resort Rooms', text: 'Comfortable accommodation', image: '/images/tuna-bay-waterfront.png' },
    { id: 2, title: 'Resort Swimming Pool', text: 'A spacious outdoor pool', image: '/images/tuna-bay-hero.jpg' },
    { id: 3, title: 'Waterfront Jetty', text: 'Direct access to the bay', image: '/images/tuna-bay-waterfront.png' },
    { id: 4, title: 'Restaurant & Bar', text: 'Covered, open-air dining', image: '/images/tuna-bay-hero.jpg' },
    { id: 5, title: 'Function Spaces', text: 'Flexible indoor and outdoor areas', image: '/images/tuna-bay-waterfront.png' },
  )
  if (s.menu_items.length === 0) s.menu_items.push(
    { id: 1, category: 'dining', name: 'Tuna Bay Seafood Basket', description: 'Crispy fish, prawns, calamari', price: 'K85' },
    { id: 2, category: 'dining', name: 'Chargrilled Reef Fish', description: 'Seasonal catch', price: 'K72' },
    { id: 3, category: 'dining', name: 'Coconut Prawn Curry', description: 'Local prawns, coconut curry', price: 'K65' },
    { id: 4, category: 'drinks', name: 'Tropical Fruit Cooler', description: 'Pineapple, passionfruit', price: 'K18' },
    { id: 5, category: 'hire', name: 'Family Day Pass', description: 'Weekend entry', price: 'K60' },
  )
  if (s.gallery_images.length === 0) s.gallery_images.push(
    { id: 1, src: '/images/tuna-bay-hero.jpg', alt: 'Aerial view of pool', title: 'Poolside days' },
    { id: 2, src: '/images/tuna-bay-waterfront.png', alt: 'Waterfront jetty', title: 'The waterfront' },
  )
  if (s.testimonials.length === 0) s.testimonials.push(
    { id: 1, name: 'Sarah K.', text: 'A wonderful escape from the city.', rating: 5, approved: true, created_at: new Date().toISOString() },
    { id: 2, name: 'Mark T.', text: 'Perfect venue for our family gathering.', rating: 5, approved: true, created_at: new Date().toISOString() },
  )
  if (s.users.length === 0) {
    const h = (p: string) => bcrypt.hashSync(p, 10)
    const adminPass = process.env.ADMIN_SEED_PASSWORD || (process.env.NODE_ENV === 'production' ? cryptoRandom() : 'admin123')
    const staffPass = process.env.STAFF_SEED_PASSWORD || (process.env.NODE_ENV === 'production' ? cryptoRandom() : 'staff123')
    s.users.push(
      { id: 1, email: process.env.ADMIN_SEED_EMAIL || 'admin@tunabay.com', password_hash: h(adminPass), name: 'Admin', role: 'admin' },
      { id: 2, email: process.env.STAFF_SEED_EMAIL || 'staff@tunabay.com', password_hash: h(staffPass), name: 'Staff', role: 'staff' },
    )
    if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_SEED_PASSWORD) console.warn('[security] ADMIN_SEED_PASSWORD not set; generated a random admin seed password (set ADMIN_SEED_PASSWORD and reseed).')
  }
  if (!s.settings) (s as any).settings = []
}

function cryptoRandom() { return crypto.randomBytes(18).toString('base64url') }

function load(): Store {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
      const s = { ...empty(), ...raw } as Store
      seed(s); return s
    }
  } catch (e) { console.error('store load failed, reseeding', e) }
  const s = empty(); seed(s); save(s); return s
}

let dirtyTimer: NodeJS.Timeout | null = null
function save(s: Store) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
    const tmp = DATA_FILE + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(s, null, 2))
    fs.renameSync(tmp, DATA_FILE)
  } catch (e) { console.error('store save failed', e) }
}
function scheduleSave() {
  if (dirtyTimer) return
  dirtyTimer = setTimeout(() => { dirtyTimer = null; save(store) }, 150)
}
export function flushStore() { if (dirtyTimer) { clearTimeout(dirtyTimer); dirtyTimer = null } save(store) }

export const store: Store = load()
export function touch() { scheduleSave() }
export function nextId(table: keyof Store) {
  const rows = store[table] as AnyRow[]
  return rows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1
}
