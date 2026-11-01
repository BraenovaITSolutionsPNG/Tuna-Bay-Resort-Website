import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts'

interface Booking {
  id: number
  name: string
  booking_type: string
  date: string
  status: string
}

interface Room { id: number }
interface Facility { id: number }
interface MenuItem { id: number }

export default function AdminOverview() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
    fetch('/api/bookings', { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]))
    fetch('/api/rooms').then(r => r.ok ? r.json() : []).then(d => setRooms(Array.isArray(d) ? d : [])).catch(() => setRooms([]))
    fetch('/api/facilities').then(r => r.ok ? r.json() : []).then(d => setFacilities(Array.isArray(d) ? d : [])).catch(() => setFacilities([]))
    fetch('/api/menu').then(r => r.ok ? r.json() : []).then(d => setMenu(Array.isArray(d) ? d : [])).catch(() => setMenu([]))
  }, [])

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
      <h1 className="text-2xl font-bold text-[#052633]">Dashboard</h1>
      <p className="mt-1 text-muted">Overview of resort activity.</p>

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
    </div>
  )
}
