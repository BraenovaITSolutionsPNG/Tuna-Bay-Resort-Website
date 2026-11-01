import { useCallback, useEffect, useMemo, useState } from 'react'
import { Header, Footer, Eyebrow } from '../components/Layout'
import {
  Booking,
  bookingTypeLabel,
  formatBookingDate,
  listBookings,
  roomName,
  stayNights,
} from '../lib/bookings'

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
}

export default function StaffDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return bookings
    return bookings.filter((booking) =>
      [booking.name, booking.phone, booking.email, booking.reference]
        .some((value) => (value || '').toLowerCase().includes(term)),
    )
  }, [bookings, search])

  const upcoming = useMemo(
    () => bookings.filter((booking) => booking.status !== 'cancelled').length,
    [bookings],
  )

  return (
    <main className="min-h-screen bg-sand-light text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap">
          <Eyebrow>Staff desk</Eyebrow>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="heading-lg">Today&rsquo;s <em>bookings</em></h1>
              <p className="mt-2 text-muted">View reservation requests and check guest details before service.</p>
            </div>
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Search name, phone, email or reference…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-56 flex-1 rounded-xl border border-ocean/20 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ocean sm:max-w-sm"
            />
            <span className="text-xs font-semibold text-muted">
              {upcoming} active reservation{upcoming === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-ocean text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Reference</th>
                  <th className="px-4 py-3 text-left font-semibold">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Stay</th>
                  <th className="px-4 py-3 text-left font-semibold">Room</th>
                  <th className="px-4 py-3 text-left font-semibold">Guests</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => {
                  const nights = stayNights(booking.date, booking.checkout)
                  return (
                    <tr key={booking.id} className="border-t border-ocean/10 align-top">
                      <td className="px-4 py-4 font-mono text-xs font-bold tracking-wide text-ocean">
                        {booking.reference || `#${booking.id}`}
                      </td>
                      <td className="px-4 py-4">
                        <span className="block font-semibold text-ink">{booking.name}</span>
                        <span className="block text-xs text-muted">{booking.phone}</span>
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
                      <td className="px-4 py-4">{roomName(booking.room) ?? '—'}</td>
                      <td className="px-4 py-4">{booking.party || '—'}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[booking.status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted">
                      {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match your search.'}
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted">Loading bookings…</td>
                  </tr>
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
