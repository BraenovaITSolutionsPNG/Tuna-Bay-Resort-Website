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
  ROOM_OPTIONS,
  stayNights,
  updateBooking,
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

const PAY_STYLES: Record<string, string> = {
  paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  unpaid: 'border-slate-200 bg-slate-50 text-slate-600',
  refunded: 'border-rose-200 bg-rose-50 text-rose-700',
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [view, setView] = useState<'table' | 'calendar'>('table')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [active, setActive] = useState<Booking | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<Partial<Booking>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { bookings: rows } = await listBookings()
      setBookings(rows)
      setActive((cur) => (cur ? rows.find((r) => r.id === cur.id) ?? null : null))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const changeStatus = async (booking: Booking, status: BookingStatus) => {
    setNotice('')
    try {
      await updateBookingStatus(booking.id, status)
      setNotice(`Booking ${booking.reference || booking.name} marked as ${status}.`)
      await load()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not update this booking.')
    }
  }

  const remove = async (booking: Booking) => {
    if (!window.confirm(`Delete booking ${booking.reference || booking.name}? This cannot be undone.`)) return
    setNotice('')
    try {
      await deleteBooking(booking.id)
      setNotice(`Booking ${booking.reference || booking.name} deleted.`)
      setActive(null)
      await load()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not delete this booking.')
    }
  }

  const startEdit = (booking: Booking) => {
    setActive(booking)
    setDraft({ ...booking })
    setEditing(true)
  }

  const saveEdit = async () => {
    if (!active) return
    setSaving(true)
    setNotice('')
    try {
      await updateBooking(active.id, draft)
      setNotice(`Booking ${active.reference || active.id} updated.`)
      setEditing(false)
      await load()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save booking.')
    } finally {
      setSaving(false)
    }
  }

  const markPayment = async (booking: Booking, method: 'online' | 'at_resort') => {
    setNotice('')
    try {
      if (method === 'online') {
        const res = await fetch('/api/payments/create-session', {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...(localStorage.getItem('token')?{Authorization:`Bearer ${localStorage.getItem('token')}`}:{}) },
          body: JSON.stringify({ bookingId: booking.id, reference: booking.reference, amountK: (roomRateValue(booking) || 0) * Math.max(1, stayNights(booking.date, booking.checkout)) || 1, currency: 'PGK', description: `Booking ${booking.reference}`, customerEmail: booking.email, customerName: booking.name, successUrl: location.origin + '/booking?paid=1', cancelUrl: location.origin + '/booking?cancelled=1' }),
        })
        const data = await res.json()
        if (data.checkoutUrl) { window.open(data.checkoutUrl, '_blank'); return }
        await updateBooking(booking.id, { payment_status: data.status === 'paid' ? 'paid' : 'unpaid', payment_method: 'online', payment_reference: data.transactionId || data.sessionId || null })
        setNotice(data.status === 'paid' ? `Online payment recorded (mock: ${data.transactionId}).` : 'Payment session created.')
      } else {
        await updateBooking(booking.id, { payment_status: 'unpaid', payment_method: 'at_resort', payment_reference: null })
        setNotice(`Booking ${booking.reference} set to pay at resort.`)
      }
      await load()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not process payment action.')
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
          <p className="mt-1 text-muted">View full details, edit reservations, and manage payment/status.</p>
        </div>
        <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white transition hover:bg-teal disabled:opacity-60" disabled={loading}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" /></svg>
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
        <input type="search" placeholder="Search name, phone, email or reference…" value={search} onChange={(e) => setSearch(e.target.value)} className="min-w-56 flex-1 rounded-xl border border-ocean/20 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ocean sm:max-w-sm" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-ocean/20 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ocean">
          {STATUS_FILTERS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-ocean/20 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ocean">
          <option value="all">All booking types</option>
          {BOOKING_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="ml-auto text-xs font-semibold text-muted">{filtered.length} of {bookings.length} shown</span>
      </div>

      {notice && <div className="mt-4 rounded-xl border border-ocean/10 bg-white px-4 py-3 text-sm text-ink" role="status">{notice}</div>}

      <div className="mt-4 flex gap-2">
        <button onClick={() => setView('table')} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${view === 'table' ? 'bg-ocean text-white' : 'bg-white text-ocean border border-ocean/20'}`}>Table</button>
        <button onClick={() => setView('calendar')} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${view === 'calendar' ? 'bg-ocean text-white' : 'bg-white text-ocean border border-ocean/20'}`}>Calendar</button>
      </div>

      {view === 'calendar' && <div className="mt-4 rounded-2xl bg-white p-5 shadow"><CalendarView bookings={filtered} /></div>}

      {view === 'table' && (
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-ocean text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Reference</th>
                <th className="px-4 py-3 text-left font-semibold">Guest</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Stay</th>
                <th className="px-4 py-3 text-left font-semibold">Room</th>
                <th className="px-4 py-3 text-left font-semibold">Payment</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => {
                const nights = stayNights(booking.date, booking.checkout)
                return (
                  <tr key={booking.id} className="border-t border-ocean/10 align-top">
                    <td className="px-4 py-4">
                      <button onClick={() => { setActive(booking); setEditing(false) }} className="font-mono text-xs font-bold tracking-wide text-ocean hover:underline">{booking.reference || '—'}</button>
                    </td>
                    <td className="px-4 py-4">
                      <span className="block font-semibold text-ink">{booking.name}</span>
                      <span className="block text-xs text-muted">{booking.phone}</span>
                      {booking.email && <span className="block text-xs text-muted">{booking.email}</span>}
                    </td>
                    <td className="px-4 py-4">{bookingTypeLabel(booking.booking_type)}</td>
                    <td className="px-4 py-4">
                      <span className="block whitespace-nowrap">{formatBookingDate(booking.date)}</span>
                      {booking.checkout && <span className="block whitespace-nowrap text-xs text-muted">to {formatBookingDate(booking.checkout)} · {nights} night{nights === 1 ? '' : 's'}</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className="block">{roomName(booking.room) ?? '—'}</span>
                      {booking.rooms && Number(booking.rooms) > 1 && <span className="block text-xs text-muted">{booking.rooms} rooms</span>}
                      <span className="block text-xs text-muted">Party: {booking.party || '—'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge value={booking.payment_status || 'unpaid'} styles={PAY_STYLES} />
                      <span className="mt-1 block text-xs text-muted">{paymentLabel(booking.payment_method)}</span>
                    </td>
                    <td className="px-4 py-4"><Badge value={booking.status} styles={STATUS_STYLES} /></td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => { setActive(booking); setEditing(false) }} className="rounded-lg border border-ocean/20 px-2.5 py-1.5 text-xs font-bold text-ocean hover:bg-ocean/5">View</button>
                        <button onClick={() => startEdit(booking)} className="rounded-lg border border-ocean/20 px-2.5 py-1.5 text-xs font-bold text-ocean hover:bg-ocean/5">Edit</button>
                        {booking.status !== 'confirmed' && <button onClick={() => void changeStatus(booking, 'confirmed')} className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">Confirm</button>}
                        {booking.status !== 'cancelled' && <button onClick={() => void changeStatus(booking, 'cancelled')} className="rounded-lg border border-amber-300 px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50">Cancel</button>}
                        <button onClick={() => void remove(booking)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {!loading && filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">{bookings.length === 0 ? 'No bookings have been received yet.' : 'No bookings match these filters.'}</td></tr>}
              {loading && <tr><td colSpan={8} className="px-4 py-12 text-center text-muted">Loading bookings…</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !saving && setActive(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-sm font-bold text-ocean">{active.reference}</p>
                <h2 className="mt-1 text-xl font-bold text-ink">{editing ? 'Edit booking' : 'Booking details'}</h2>
              </div>
              <button onClick={() => setActive(null)} className="rounded-lg p-2 text-muted hover:bg-slate-100" aria-label="Close">✕</button>
            </div>

            {!editing ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
                <Detail label="Guest" value={active.name} />
                <Detail label="Phone" value={active.phone} />
                <Detail label="Email" value={active.email || '—'} />
                <Detail label="Type" value={bookingTypeLabel(active.booking_type)} />
                <Detail label="Check-in" value={formatBookingDate(active.date)} />
                <Detail label="Check-out" value={active.checkout ? `${formatBookingDate(active.checkout)} · ${stayNights(active.date, active.checkout)} night(s)` : '—'} />
                <Detail label="Room" value={roomName(active.room) || '—'} />
                <Detail label="Rooms / Party" value={[active.rooms && `${active.rooms} room(s)`, active.party].filter(Boolean).join(' · ') || '—'} />
                <Detail label="Status" value={active.status} />
                <Detail label="Payment" value={`${active.payment_status || 'unpaid'} · ${paymentLabel(active.payment_method)}`} />
                {active.payment_reference && <Detail label="Payment ref" value={active.payment_reference} />}
                {active.message && <div className="sm:col-span-2"><p className="text-xs font-bold uppercase tracking-wide text-muted">Message</p><p className="mt-1 text-ink">{active.message}</p></div>}
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Field label="Guest name"><input value={draft.name || ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputCls} /></Field>
                <Field label="Phone"><input value={draft.phone || ''} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className={inputCls} /></Field>
                <Field label="Email"><input value={draft.email || ''} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={inputCls} /></Field>
                <Field label="Booking type">
                  <select value={draft.booking_type || 'room'} onChange={(e) => setDraft({ ...draft, booking_type: e.target.value })} className={inputCls}>
                    {BOOKING_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Check-in"><input type="date" value={draft.date || ''} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className={inputCls} /></Field>
                <Field label="Check-out"><input type="date" value={draft.checkout || ''} onChange={(e) => setDraft({ ...draft, checkout: e.target.value })} className={inputCls} /></Field>
                <Field label="Room">
                  <select value={draft.room || ''} onChange={(e) => setDraft({ ...draft, room: e.target.value })} className={inputCls}>
                    <option value="">—</option>
                    {ROOM_OPTIONS.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
                  </select>
                </Field>
                <Field label="Rooms"><input value={draft.rooms || ''} onChange={(e) => setDraft({ ...draft, rooms: e.target.value })} className={inputCls} /></Field>
                <Field label="Party"><input value={draft.party || ''} onChange={(e) => setDraft({ ...draft, party: e.target.value })} className={inputCls} /></Field>
                <Field label="Status">
                  <select value={draft.status || 'pending'} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className={inputCls}>
                    <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option>
                  </select>
                </Field>
                <Field label="Payment status">
                  <select value={draft.payment_status || 'unpaid'} onChange={(e) => setDraft({ ...draft, payment_status: e.target.value })} className={inputCls}>
                    <option value="unpaid">Unpaid</option><option value="paid">Paid</option><option value="refunded">Refunded</option>
                  </select>
                </Field>
                <Field label="Payment method">
                  <select value={draft.payment_method || 'unpaid'} onChange={(e) => setDraft({ ...draft, payment_method: e.target.value })} className={inputCls}>
                    <option value="unpaid">Not set</option><option value="online">Online</option><option value="at_resort">Pay at resort</option>
                  </select>
                </Field>
                <div className="sm:col-span-2"><Field label="Message"><textarea value={draft.message || ''} onChange={(e) => setDraft({ ...draft, message: e.target.value })} className={inputCls} rows={3} /></Field></div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
              {!editing ? (
                <>
                  <button onClick={() => startEdit(active)} className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal">Edit booking</button>
                  <button onClick={() => void markPayment(active, 'online')} className="rounded-xl border border-ocean/20 px-4 py-2 text-sm font-bold text-ocean hover:bg-ocean/5">Pay online</button>
                  <button onClick={() => void markPayment(active, 'at_resort')} className="rounded-xl border border-ocean/20 px-4 py-2 text-sm font-bold text-ocean hover:bg-ocean/5">Pay at resort</button>
                  {active.status !== 'cancelled' && <button onClick={() => void changeStatus(active, 'cancelled')} className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50">Cancel</button>}
                  <button onClick={() => void remove(active)} className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50">Delete</button>
                </>
              ) : (
                <>
                  <button onClick={() => void saveEdit()} disabled={saving} className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>
                  <button onClick={() => setEditing(false)} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel edit</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputCls = 'w-full rounded-xl border border-ocean/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ocean'

function roomRateValue(b: Booking): number | null {
  const match = ROOM_OPTIONS.find((r) => r.slug === b.room || r.name === b.room)
  return match ? match.price : null
}
function paymentLabel(v?: string | null) {
  if (v === 'online') return 'Online'
  if (v === 'at_resort') return 'Pay at resort'
  return 'Not set'
}
function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 font-display text-3xl ${accent}`}>{value}</p>
    </div>
  )
}
function Badge({ value, styles }: { value: string; styles: Record<string, string> }) {
  const label = value.charAt(0).toUpperCase() + value.slice(1)
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${styles[value] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>{label}</span>
}
function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p><p className="mt-1 text-ink">{value}</p></div>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">{label}</span>{children}</label>
}
