// Shared booking domain types, formatting helpers and a resilient API client.
//
// The site is served by the Express API in `server/` when it is running
// (Vite proxies /api to it). In static previews — such as the Figma Make
// preview — the API is not reachable, so this client falls back to a
// device-local store. That keeps the booking flow and the admin views
// usable everywhere while the server remains the source of truth.

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  id: number
  reference: string
  name: string
  email: string
  phone: string
  booking_type: string
  date: string
  checkout: string | null
  party: string | null
  room: string | null
  rooms: string | null
  message: string | null
  status: BookingStatus | string
  created_at: string
}

export interface BookingPayload {
  bookingType: string
  name: string
  email: string
  phone: string
  date: string
  checkout?: string
  party?: string
  room?: string
  rooms?: string
  message?: string
}

export type BookingSource = 'server' | 'device'

export class BookingError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = 'BookingError'
    this.status = status
  }
}

export const BOOKING_TYPE_OPTIONS = [
  { value: 'room', label: 'Room stay', hint: 'Overnight accommodation' },
  { value: 'table', label: 'Restaurant table', hint: 'Dining reservation' },
  { value: 'function', label: 'Private function', hint: 'Events & celebrations' },
  { value: 'day-pass', label: 'Family day pass', hint: 'Pool & grounds access' },
  { value: 'general', label: 'General enquiry', hint: 'Anything else' },
] as const

export const ROOM_OPTIONS = [
  { slug: 'standard', name: 'Standard Room', price: 450, summary: 'Queen bed · coastal comfort' },
  { slug: 'deluxe', name: 'Deluxe Room', price: 550, summary: 'King bed · garden views' },
  { slug: 'ocean-view', name: 'Ocean View Suite', price: 750, summary: 'King bed · separate living area' },
  { slug: 'family', name: 'Family Room', price: 650, summary: 'Two queen beds · family space' },
  { slug: 'beachfront', name: 'Beachfront Villa', price: 950, summary: 'Private villa · direct beach access' },
] as const

const BOOKING_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  BOOKING_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

const ROOM_NAMES: Record<string, string> = Object.fromEntries(
  ROOM_OPTIONS.map((room) => [room.slug, room.name]),
)

const STORAGE_KEY = 'tunabay.bookings.v1'
const STORAGE_SEEDED_KEY = 'tunabay.bookings.seeded.v1'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

let memoryStore: Booking[] | null = null

export function bookingTypeLabel(value: string): string {
  return BOOKING_TYPE_LABELS[value] ?? titleCase(value)
}

export function roomName(value?: string | null): string | null {
  if (!value) return null
  return ROOM_NAMES[value] ?? value
}

export function roomRate(value?: string | null): number | null {
  const match = ROOM_OPTIONS.find((room) => room.slug === value || room.name === value)
  return match ? match.price : null
}

export function formatBookingDate(value?: string | null): string {
  if (!value) return '—'
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  const monthLabel = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1]
  return `${day} ${monthLabel} ${year}`
}

export function stayNights(date?: string | null, checkout?: string | null): number {
  if (!date || !checkout) return 0
  const start = Date.parse(`${date}T00:00:00`)
  const end = Date.parse(`${checkout}T00:00:00`)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0
  return Math.max(0, Math.round((end - start) / 86_400_000))
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Create a booking through the API, falling back to device storage when offline. */
export async function createBooking(payload: BookingPayload): Promise<{ booking: Booking; source: BookingSource }> {
  let response: Response | null = null

  try {
    response = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    response = null
  }

  if (response) {
    if (response.ok) {
      const data = await safeJson(response)
      const booking = data && typeof data === 'object' ? (data as { booking?: unknown }).booking : null
      if (booking && typeof booking === 'object') {
        return { booking: normalizeBooking(booking as Partial<Booking>), source: 'server' }
      }
    } else if (response.status === 400 || response.status === 409 || response.status === 429) {
      const data = await safeJson(response)
      const message = data && typeof data === 'object' ? (data as { error?: string }).error : undefined
      throw new BookingError(message || 'We could not complete this booking. Please review your details.', response.status)
    }
  }

  return { booking: createLocalBooking(payload), source: 'device' }
}

/** List bookings from the API, falling back to device storage when offline. */
export async function listBookings(): Promise<{ bookings: Booking[]; source: BookingSource }> {
  try {
    const token = getToken()
    const response = await fetch('/api/bookings', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (response.ok) {
      const data = await safeJson(response)
      if (Array.isArray(data)) {
        return { bookings: data.map((row) => normalizeBooking(row as Partial<Booking>)), source: 'server' }
      }
    }
  } catch {
    // Offline or API unavailable — use the device store below.
  }

  return { bookings: readLocal(), source: 'device' }
}

export async function updateBookingStatus(id: number, status: BookingStatus): Promise<BookingSource> {
  try {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ status }),
    })
    if (response.ok) {
      const data = await safeJson(response)
      if (data && typeof data === 'object' && (data as { success?: boolean }).success === true) return 'server'
    } else if (response.status === 401) {
      throw new BookingError('Please sign in as an administrator to manage bookings.', 401)
    }
  } catch (error) {
    if (error instanceof BookingError) throw error
  }

  const rows = readLocal().map((booking) => (booking.id === id ? { ...booking, status } : booking))
  writeLocal(rows)
  return 'device'
}

export async function deleteBooking(id: number): Promise<BookingSource> {
  try {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (response.ok) {
      const data = await safeJson(response)
      if (data && typeof data === 'object' && (data as { success?: boolean }).success === true) return 'server'
    } else if (response.status === 401) {
      throw new BookingError('Please sign in as an administrator to manage bookings.', 401)
    }
  } catch (error) {
    if (error instanceof BookingError) throw error
  }

  writeLocal(readLocal().filter((booking) => booking.id !== id))
  return 'device'
}

function getToken(): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem('token') || ''
  } catch {
    return ''
  }
}

function titleCase(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function normalizeBooking(raw: Partial<Booking>): Booking {
  return {
    id: Number(raw.id ?? 0),
    reference: String(raw.reference ?? ''),
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    booking_type: String(raw.booking_type ?? 'general'),
    date: String(raw.date ?? ''),
    checkout: raw.checkout ? String(raw.checkout) : null,
    party: raw.party ? String(raw.party) : null,
    room: raw.room ? String(raw.room) : null,
    rooms: raw.rooms ? String(raw.rooms) : null,
    message: raw.message ? String(raw.message) : null,
    status: String(raw.status ?? 'pending'),
    created_at: String(raw.created_at ?? new Date().toISOString()),
  }
}

function makeReference(): string {
  return `TB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

function createLocalBooking(payload: BookingPayload): Booking {
  const rows = readLocal()
  const booking: Booking = {
    id: rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
    reference: makeReference(),
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    booking_type: payload.bookingType,
    date: payload.date,
    checkout: payload.checkout || null,
    party: payload.party || null,
    room: payload.room ? (ROOM_NAMES[payload.room] ?? payload.room) : null,
    rooms: payload.rooms || null,
    message: payload.message || null,
    status: 'pending',
    created_at: new Date().toISOString(),
  }

  writeLocal([booking, ...rows])
  return booking
}

function readLocal(): Booking[] {
  if (memoryStore) return [...memoryStore]

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        memoryStore = parsed as Booking[]
        return [...memoryStore]
      }
    }
  } catch {
    // Storage is unavailable (private mode, disabled cookies) — use memory.
  }

  const seeded = seedBookings()
  writeLocal(seeded)
  return seeded
}

function writeLocal(rows: Booking[]): void {
  memoryStore = rows
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
    window.localStorage.setItem(STORAGE_SEEDED_KEY, '1')
  } catch {
    // Keep the in-memory copy when persistence is unavailable.
  }
}

/** Small set of sample reservations so the admin preview is never empty. */
function seedBookings(): Booking[] {
  const offset = (days: number): string => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
  }

  const samples: Array<Partial<Booking> & { booking_type: string }> = [
    { name: 'Grace Moka', email: 'grace.moka@example.com', phone: '+675 7123 4567', booking_type: 'room', date: offset(3), checkout: offset(6), party: '2', room: 'Ocean View Suite', rooms: '1', status: 'confirmed' },
    { name: 'Peter Kalu', email: 'peter.kalu@example.com', phone: '+675 7234 5678', booking_type: 'function', date: offset(9), party: '40 guests', message: 'Birthday celebration on the lawn.', status: 'pending' },
    { name: 'Sarah Numa', email: 'sarah.numa@example.com', phone: '+675 7345 6789', booking_type: 'table', date: offset(1), party: '6 guests', status: 'confirmed' },
    { name: 'David Ora', email: 'david.ora@example.com', phone: '+675 7456 7890', booking_type: 'room', date: offset(12), checkout: offset(15), party: '3', room: 'Family Room', rooms: '1', status: 'pending' },
    { name: 'Anna Kone', email: 'anna.kone@example.com', phone: '+675 7567 8901', booking_type: 'day-pass', date: offset(5), party: '2 adults, 3 children', status: 'pending' },
    { name: 'James Kila', email: 'james.kila@example.com', phone: '+675 7678 9012', booking_type: 'room', date: offset(20), checkout: offset(23), party: '2', room: 'Beachfront Villa', rooms: '1', status: 'cancelled' },
  ]

  return samples.map((sample, index) => ({
    id: index + 1,
    reference: `TB-${(482913 + index * 731).toString(36).toUpperCase().slice(0, 6)}`,
    name: sample.name ?? '',
    email: sample.email ?? '',
    phone: sample.phone ?? '',
    booking_type: sample.booking_type,
    date: sample.date ?? offset(2),
    checkout: sample.checkout ?? null,
    party: sample.party ?? null,
    room: sample.room ?? null,
    rooms: sample.rooms ?? null,
    message: sample.message ?? null,
    status: sample.status ?? 'pending',
    created_at: new Date(Date.now() - index * 3_600_000).toISOString(),
  }))
}
