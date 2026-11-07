import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts'
import { listBookings } from '../../lib/bookings'

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
    let active = true
    const h = (): Record<string,string> => { const t = localStorage.getItem('token'); return t ? { Authorization: `Bearer ${t}` } : {} }
    listBookings()
      .then(({ bookings: rows }) => { if (active) setBookings(rows) })
      .catch(() => { if (active) setBookings([]) })
    fetch('/api/rooms', { headers: h() }).then(r => r.ok ? r.json() : []).then(d => setRooms(Array.isArray(d) ? d : [])).catch(() => setRooms([]))
    fetch('/api/facilities', { headers: h() }).then(r => r.ok ? r.json() : []).then(d => setFacilities(Array.isArray(d) ? d : [])).catch(() => setFacilities([]))
    fetch('/api/menu', { headers: h() }).then(r => r.ok ? r.json() : []).then(d => setMenu(Array.isArray(d) ? d : [])).catch(() => setMenu([]))
    return () => { active = false }
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

  const tooltipStyle = { background: 'rgba(255,255,255,.72)', border: '1px solid rgba(255,255,255,.7)', borderRadius: 12, backdropFilter: 'blur(10px)', color: '#183139' }
  return (
    <div>
      <div className="glass-panel rounded-2xl p-5 sm:p-6">
        <h1 className="font-display text-2xl sm:text-3xl text-ocean">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Overview of resort activity.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['Total Bookings', bookings.length], ['Rooms', rooms.length], ['Facilities', facilities.length], ['Menu Items', menu.length]].map(([label, value]) => (
          <div key={String(label)} className="glass-panel rounded-2xl p-5">
            <p className="text-sm font-medium text-muted">{label}</p>
            <p className="mt-2 font-display text-3xl text-ocean">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="font-display text-lg text-ocean mb-4">Bookings by Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingsByType}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#607278' }} axisLine={{ stroke: 'rgba(8,49,64,.15)' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#607278' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,.25)' }} />
              <Bar dataKey="value" fill="#0c766d" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="font-display text-lg text-ocean mb-4">Booking Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={bookingsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={82} paddingAngle={3} label>
                {bookingsByType.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(255,255,255,.5)" />))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-panel rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-display text-lg text-ocean mb-4">Bookings Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={bookingsByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,49,64,.12)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#607278' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#607278' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#e76f51" strokeWidth={2.5} dot={{ fill: '#e76f51', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
