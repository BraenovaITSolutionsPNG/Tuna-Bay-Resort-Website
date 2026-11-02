import { useState, useEffect } from 'react'
import { Header, Footer } from '../components/Layout'

interface Booking {
  id: number
  name: string
  phone: string
  booking_type: string
  date: string
  room: string | null
  status: string
}

export default function StaffDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0 })

  const reload = () => {
    const token = localStorage.getItem('token')
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
    fetch('/api/bookings', { headers })
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        const list = Array.isArray(d) ? d : []
        setBookings(list)
        setStats({
          total: list.length,
          pending: list.filter(b => b.status === 'pending').length,
          confirmed: list.filter(b => b.status === 'confirmed').length,
        })
      })
      .catch(() => setBookings([]))
  }

  useEffect(() => { reload() }, [])

  const token = () => localStorage.getItem('token') || ''

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    })
    reload()
  }

  return (
    <main className="min-h-screen bg-sand-light text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap">
          <h1 className="heading-lg">Staff <em>Dashboard</em></h1>
          <p className="mt-2 text-muted">View and manage bookings.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-muted">Total Bookings</p>
              <p className="mt-2 font-display text-3xl text-ocean">{stats.total}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-muted">Pending</p>
              <p className="mt-2 font-display text-3xl text-yellow-600">{stats.pending}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-muted">Confirmed</p>
              <p className="mt-2 font-display text-3xl text-green-600">{stats.confirmed}</p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl bg-white shadow">
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
                  <th className="px-4 py-3 text-left">Actions</th>
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
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => updateStatus(b.id, 'confirmed')} className="text-xs text-green-600 hover:underline">Confirm</button>
                      <button onClick={() => updateStatus(b.id, 'cancelled')} className="text-xs text-red-600 hover:underline">Cancel</button>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-6 text-center text-muted">No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
