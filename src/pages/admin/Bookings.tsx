import { useState, useEffect } from 'react'

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

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const reloadBookings = () => {
    const token = localStorage.getItem('token')
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
    fetch('/api/bookings', { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]))
  }

  useEffect(() => { reloadBookings() }, [])

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('token')
    await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    reloadBookings()
  }

  const deleteBooking = async (id: number) => {
    if (!confirm('Delete this booking?')) return
    const token = localStorage.getItem('token')
    await fetch(`/api/bookings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    reloadBookings()
  }

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.phone.includes(search)
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#052633]">Bookings</h1>
      <p className="mt-1 text-muted">Manage all reservation enquiries.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-xl border border-ocean/20 px-4 py-2 text-sm focus:ring-2 focus:ring-ocean outline-none"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-ocean/20 px-4 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={reloadBookings} className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal transition">
          Refresh
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow">
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
            {filteredBookings.map(b => (
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
                  <button onClick={() => deleteBooking(b.id)} className="text-xs text-gray-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-muted">No bookings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
