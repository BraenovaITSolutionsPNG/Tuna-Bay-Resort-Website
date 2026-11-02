import { useCallback, useEffect, useMemo, useState } from 'react'
import CalendarView from '../../components/CalendarView'
import {
  BOOKING_TYPE_OPTIONS,
  Booking,
  BookingStatus,
  bookingTypeLabel,
  deleteBooking,
  formatBookingDate,
  listBookings,
  roomName,
  stayNights,
  updateBookingStatus,
} from '../../lib/bookings'

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [view, setView] = useState<'table' | 'calendar'>('table')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { bookings: rows } = await listBookings()
      setBookings(rows)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const changeStatus = async (booking: Booking, status: BookingStatus) => {
    setNotice('')
    try {
      await updateBookingStatus(booking.id, status)
      setNotice(`Booking ${booking.name} marked as ${status}.`)
      await load()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not update this booking.')
    }
  }

  const remove = async (booking: Booking) => {
    const confirmed = window.confirm(
      `Delete booking ${booking.name}? This cannot be undone.`,
    )
    if (!confirmed) return

    setNotice('')
    try {
      await deleteBooking(booking.id)
      setNotice(`Booking ${booking.name} deleted.`)
      await load()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not delete this booking.')
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return bookings.filter((booking) => {
      const matchesTerm = !term || [booking.name, booking.phone, booking.email, booking.reference]
        .some((value) => (value || '').toLowerCase().includes(term))
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
      const matchesType = typeFilter === 'all' || booking.booking_type === typeFilter
      return matchesTerm && matchesStatus && matchesType
    })
  }, [bookings, search, statusFilter, typeFilter])

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
    cancelled: bookings.filter((booking) => booking.status === 'cancelled').length,
  }), [bookings])

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#052633]">Bookings</h1>
          <p className="mt-1 text-muted">Review, confirm and manage every reservation enquiry.</p>
        </div>
        <button
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white transition hover:bg-teal disabled:opacity-60"
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" />
          </svg>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total bookings" value={stats.total} accent="text-ocean" />
        <StatCard label="Pending confirmation" value={stats.pending} accent="text-amber-600" />
        <StatCard label="Confirmed" value={stats.confirmed} accent="text-emerald-600" />
        <StatCard label="Cancelled" value={stats.cancelled} accent="text-rose-600" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search name, phone, email or reference…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="min-w-56 flex-1 rounded-xl border border-ocean/20 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ocean sm:max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-ocean/20 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ocean"
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="rounded-xl border border-ocean/20 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ocean"
        >
          <option value="all">All booking types</option>
          {BOOKING_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <span className="ml-auto text-xs font-semibold text-muted">
          {filtered.length} of {bookings.length} shown
        </span>
      </div>

      {notice && (
        <div className="mt-4 rounded-xl border border-ocean/10 bg-white px-4 py-3 text-sm text-ink" role="status">
          {notice}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={() => setView('table')} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${view === 'table' ? 'bg-ocean text-white' : 'bg-white text-ocean border border-ocean/20'}`}>Table</button>
        <button onClick={() => setView('calendar')} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${view === 'calendar' ? 'bg-ocean text-white' : 'bg-white text-ocean border border-ocean/20'}`}>Calendar</button>
      </div>

      {view === 'calendar' && (
        <div className="mt-4 rounded-2xl bg-white p-5 shadow">
          <CalendarView bookings={filtered} />
        </div>
      )}

      {view === 'table' && (
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full min-w-[880px] text-sm">
          <thead className="bg-ocean text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Reference</th>
              <th className="px-4 py-3 text-left font-semibold">Guest</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-left font-semibold">Stay</th>
              <th className="px-4 py-3 text-left font-semibold">Room</th>
              <th className="px-4 py-3 text-left font-semibold">Guests</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((booking) => {
              const nights = stayNights(booking.date, booking.checkout)
              return (
                <tr key={booking.id} className="border-t border-ocean/10 align-top">
                  <td className="px-4 py-4 font-mono text-xs font-bold tracking-wide text-ocean">
                    {booking.reference || '—'}
                  </td>
                  <td className="px-4 py-4">
                    <span className="block font-semibold text-ink">{booking.name}</span>
                    <span className="block text-xs text-muted">{booking.phone}</span>
                    {booking.email && <span className="block text-xs text-muted">{booking.email}</span>}
                  </td>
                  <td className="px-4 py-4">{bookingTypeLabel(booking.booking_type)}</td>
                  <td className="px-4 py-4">
                    <span className="block whitespace-nowrap">{formatBookingDate(booking.date)}</span>
                    {booking.checkout && (
                      <span className="block whitespace-nowrap text-xs text-muted">
                        to {formatBookingDate(booking.checkout)} · {nights} night{nights === 1 ? '' : 's'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="block">{roomName(booking.room) ?? '—'}</span>
                    {booking.rooms && Number(booking.rooms) > 1 && (
                      <span className="block text-xs text-muted">{booking.rooms} rooms</span>
                    )}
                  </td>
                  <td className="px-4 py-4">{booking.party || '—'}</td>
                  <td className="px-4 py-4"><StatusBadge status={booking.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {booking.status !== 'confirmed' && (
                        <button
                          onClick={() => void changeStatus(booking, 'confirmed')}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => void changeStatus(booking, 'cancelled')}
                          className="rounded-lg border border-amber-300 px-2.5 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-50"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => void remove(booking)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted">
                  {bookings.length === 0 ? 'No bookings have been received yet.' : 'No bookings match these filters.'}
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted">Loading bookings…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 font-display text-3xl ${accent}`}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>
      {label}
    </span>
  )
}
