import { useState, useEffect } from 'react'
import { Header, Footer } from '../components/Layout'

interface Booking {
  id: number
  name: string
  phone: string
  booking_type: string
  date: string
  checkout: string | null
  party: string | null
  room: string | null
  rooms: string | null
  message: string | null
  status: string
  created_at: string
}

interface Room {
  id: number
  name: string
  description: string
  price: string
  features: string
  image: string
}

interface Facility {
  id: number
  title: string
  text: string
  image: string
}

interface MenuItem {
  id: number
  category: string
  name: string
  description: string
  price: string
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<'bookings' | 'rooms' | 'facilities' | 'menu'>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
    fetch('/api/bookings', { headers })
      .then(r => r.json())
      .then(setBookings)
      .catch(() => {})
    fetch('/api/rooms').then(r => r.json()).then(setRooms).catch(() => {})
    fetch('/api/facilities').then(r => r.json()).then(setFacilities).catch(() => {})
    fetch('/api/menu').then(r => r.json()).then(setMenu).catch(() => {})
  }, [])

  const tabs = [
    { key: 'bookings', label: 'Bookings' },
    { key: 'rooms', label: 'Rooms' },
    { key: 'facilities', label: 'Facilities' },
    { key: 'menu', label: 'Menu' },
  ] as const

  return (
    <main className="min-h-screen bg-sand-light text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap">
          <h1 className="heading-lg">Admin <em>Dashboard</em></h1>
          <p className="mt-2 text-muted">Manage bookings, rooms, facilities and menu items.</p>

          <div className="mt-8 flex flex-wrap gap-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition ${tab === t.key ? 'bg-ocean text-white' : 'bg-white text-ocean border border-ocean/20'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {tab === 'bookings' && (
              <div className="overflow-x-auto rounded-2xl bg-white shadow">
                <table className="w-full text-sm">
                  <thead className="bg-ocean text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Room</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-t border-ocean/10">
                        <td className="px-4 py-3">{b.id}</td>
                        <td className="px-4 py-3">{b.name}</td>
                        <td className="px-4 py-3">{b.phone}</td>
                        <td className="px-4 py-3">{b.booking_type}</td>
                        <td className="px-4 py-3">{b.date}</td>
                        <td className="px-4 py-3">{b.room || '-'}</td>
                        <td className="px-4 py-3">{b.status}</td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-6 text-center text-muted">No bookings yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'rooms' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.map(r => (
                  <div key={r.id} className="rounded-2xl bg-white p-5 shadow">
                    <h3 className="font-display text-lg text-ocean">{r.name}</h3>
                    <p className="mt-1 text-sm text-muted">{r.description}</p>
                    <p className="mt-2 font-bold text-coral">{r.price}</p>
                    <p className="mt-1 text-xs text-muted">{r.features}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'facilities' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {facilities.map(f => (
                  <div key={f.id} className="rounded-2xl bg-white p-5 shadow">
                    <h3 className="font-display text-lg text-ocean">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted">{f.text}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'menu' && (
              <div className="overflow-x-auto rounded-2xl bg-white shadow">
                <table className="w-full text-sm">
                  <thead className="bg-ocean text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.map(m => (
                      <tr key={m.id} className="border-t border-ocean/10">
                        <td className="px-4 py-3">{m.category}</td>
                        <td className="px-4 py-3">{m.name}</td>
                        <td className="px-4 py-3">{m.description}</td>
                        <td className="px-4 py-3">{m.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
