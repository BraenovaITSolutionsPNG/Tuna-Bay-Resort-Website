import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts'

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

export default function AdminOverview() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'bookings'
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

  const bookingsByType = Object.entries(
    bookings.reduce((acc, b) => {
      acc[b.booking_type] = (acc[b.booking_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const bookingsByDate = Object.entries(
    bookings.reduce((acc, b) => {
      const d = b.date
      acc[d] = (acc[d] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  )
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const COLORS = ['#083140', '#0ea5a4', '#ff6b5b', '#f59e0b', '#8b5cf6']

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#052633]">Admin Dashboard</h1>
      <p className="mt-1 text-muted">Manage bookings, rooms, facilities and menu items.</p>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-muted">Total Bookings</p>
          <p className="mt-2 font-display text-3xl text-ocean">{bookings.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-muted">Rooms</p>
          <p className="mt-2 font-display text-3xl text-ocean">{rooms.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-muted">Facilities</p>
          <p className="mt-2 font-display text-3xl text-ocean">{facilities.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-muted">Menu Items</p>
          <p className="mt-2 font-display text-3xl text-ocean">{menu.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow">
          <h3 className="font-display text-lg text-ocean mb-4">Bookings by Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingsByType}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#083140" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow">
          <h3 className="font-display text-lg text-ocean mb-4">Booking Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={bookingsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {bookingsByType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow lg:col-span-2">
          <h3 className="font-display text-lg text-ocean mb-4">Bookings Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={bookingsByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#ff6b5b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map(t => (
          <a
            key={t.key}
            href={`/admin?tab=${t.key}`}
            className={`rounded-full px-5 py-2 text-sm font-bold transition ${tab === t.key ? 'bg-ocean text-white' : 'bg-white text-ocean border border-ocean/20'}`}
          >
            {t.label}
          </a>
        ))}
      </div>

      <div className="mt-6">
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
  )
}
