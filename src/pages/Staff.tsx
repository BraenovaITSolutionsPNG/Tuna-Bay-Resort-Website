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

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
    fetch('/api/bookings', { headers })
      .then(r => r.json())
      .then(setBookings)
      .catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-sand-light text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap">
          <h1 className="heading-lg">Staff <em>Dashboard</em></h1>
          <p className="mt-2 text-muted">View and manage bookings.</p>

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
        </div>
      </section>
      <Footer />
    </main>
  )
}
