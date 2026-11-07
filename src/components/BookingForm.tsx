import { FormEvent, InputHTMLAttributes, ReactNode, useMemo, useState } from 'react'
import {
  BOOKING_TYPE_OPTIONS,
  ROOM_OPTIONS,
  Booking,
  BookingError,
  BookingPayload,
  bookingTypeLabel,
  createBooking,
  formatBookingDate,
  isValidEmail,
  roomName,
  roomRate,
  stayNights,
  todayIso,
} from '../lib/bookings'

interface FormState {
  bookingType: string
  name: string
  email: string
  phone: string
  date: string
  checkout: string
  party: string
  room: string
  rooms: string
  message: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const initialForm: FormState = {
  bookingType: '',
  name: '',
  email: '',
  phone: '',
  date: '',
  checkout: '',
  party: '2',
  room: '',
  rooms: '1',
  message: '',
}

interface BookingFormProps {
  initialType?: string
  initialDate?: string
  initialParty?: string
}

export default function BookingForm({ initialType = '', initialDate = '', initialParty = '' }: BookingFormProps) {
  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    bookingType: initialType,
    date: initialDate,
    party: initialParty || initialForm.party,
  }))
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<Booking | null>(null)

  const isRoom = form.bookingType === 'room'
  const selectedRoom = ROOM_OPTIONS.find((room) => room.slug === form.room)
  const roomCount = Math.max(1, Number(form.rooms) || 1)
  const nights = useMemo(() => stayNights(form.date, form.checkout), [form.date, form.checkout])
  const estimatedTotal = selectedRoom && nights > 0 ? selectedRoom.price * nights * roomCount : 0
  const today = todayIso()

  const update = (field: keyof FormState, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => {
      if (!previous[field]) return previous
      const next = { ...previous }
      delete next[field]
      return next
    })
    setFormError('')
  }

  const validate = (): boolean => {
    const next: FormErrors = {}

    if (!form.bookingType) next.bookingType = 'Choose what you would like to book.'
    if (!form.name.trim()) next.name = 'Enter your full name.'
    if (!form.email.trim()) next.email = 'Enter your email address.'
    else if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.'
    if (!form.phone.trim()) next.phone = 'Enter a contact phone number.'

    if (!form.date) next.date = isRoom ? 'Choose your check-in date.' : 'Choose a date for your visit.'
    else if (form.date < today) next.date = 'The date cannot be in the past.'

    if (isRoom) {
      if (!form.checkout) next.checkout = 'Choose your check-out date.'
      else if (form.date && form.checkout <= form.date) next.checkout = 'Check-out must be after check-in.'
      if (!form.room) next.room = 'Select the room you would like.'
      if (!form.party || Number(form.party) < 1) next.party = 'Enter at least one guest.'
    } else if (!form.party.trim()) {
      next.party = 'Enter your party size.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    const payload: BookingPayload = {
      bookingType: form.bookingType,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      date: form.date,
      party: form.party.trim(),
      message: form.message.trim() || undefined,
      ...(isRoom ? { checkout: form.checkout, room: form.room, rooms: form.rooms } : {}),
    }

    setSubmitting(true)
    try {
      const { booking } = await createBooking(payload)
      setConfirmed(booking)
    } catch (error) {
      setFormError(
        error instanceof BookingError
          ? error.message
          : 'Something went wrong while sending your request. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setConfirmed(null)
    setForm(initialForm)
    setErrors({})
    setFormError('')
  }

  if (confirmed) {
    return <BookingConfirmation booking={confirmed} onReset={reset} />
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
      <label className="sm:col-span-2">
        <span className="field-label">What would you like to book?</span>
        <select
          value={form.bookingType}
          onChange={(event) => update('bookingType', event.target.value)}
          className={`field-input ${errors.bookingType ? 'border-red-400' : ''}`}
          aria-invalid={Boolean(errors.bookingType)}
        >
          <option value="" disabled>Select a booking type</option>
          {BOOKING_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {errors.bookingType && <FieldError>{errors.bookingType}</FieldError>}
      </label>

      <TextField
        label={isRoom ? 'Check-in date' : 'Date of visit'}
        type="date"
        value={form.date}
        min={today}
        onChange={(value) => update('date', value)}
        error={errors.date}
        required
      />

      {isRoom && (
        <TextField
          label="Check-out date"
          type="date"
          value={form.checkout}
          min={form.date || today}
          onChange={(value) => update('checkout', value)}
          error={errors.checkout}
          required
        />
      )}

      {isRoom ? (
        <>
          <fieldset className="sm:col-span-2">
            <legend className="field-label">Choose your room</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {ROOM_OPTIONS.map((room) => {
                const active = form.room === room.slug
                return (
                  <button
                    key={room.slug}
                    type="button"
                    onClick={() => update('room', room.slug)}
                    aria-pressed={active}
                    className={`rounded-2xl border p-4 text-left transition ${
                      active
                        ? 'border-teal bg-seafoam/20 ring-1 ring-teal'
                        : 'border-ocean/10 bg-sand-light hover:border-teal/40'
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-bold text-ocean">{room.name}</span>
                      <span className="shrink-0 text-sm font-bold text-coral">K{room.price}</span>
                    </span>
                    <span className="mt-1 block text-xs text-muted">{room.summary}</span>
                    <span className="mt-1 block text-[0.7rem] font-semibold uppercase tracking-wide text-muted">per night</span>
                  </button>
                )
              })}
            </div>
            {errors.room && <FieldError>{errors.room}</FieldError>}
          </fieldset>

          <TextField
            label="Guests"
            type="number"
            min={1}
            max={12}
            value={form.party}
            onChange={(value) => update('party', value)}
            error={errors.party}
            required
          />
          <label>
            <span className="field-label">Rooms</span>
            <select value={form.rooms} onChange={(event) => update('rooms', event.target.value)} className="field-input">
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>{count} room{count > 1 ? 's' : ''}</option>
              ))}
            </select>
          </label>

          {selectedRoom && nights > 0 && (
            <div className="sm:col-span-2 rounded-2xl border border-teal/20 bg-seafoam/15 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-teal">
                  {selectedRoom.name} · K{selectedRoom.price}/night × {nights} night{nights === 1 ? '' : 's'}
                  {roomCount > 1 ? ` × ${roomCount} rooms` : ''}
                </span>
                <span className="font-display text-2xl text-ocean">K{estimatedTotal.toLocaleString()}</span>
              </div>
              <p className="mt-1 text-xs text-muted">Estimated room total. Our team confirms the final rate with your booking.</p>
            </div>
          )}
        </>
      ) : (
        <TextField
          label="Party size"
          placeholder="e.g. 8 guests"
          value={form.party}
          onChange={(value) => update('party', value)}
          error={errors.party}
          required
        />
      )}

      <div className="sm:col-span-2 mt-1 border-t border-ocean/10 pt-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">Your details</p>
      </div>

      <TextField
        label="Your name"
        placeholder="Full name"
        autoComplete="name"
        value={form.name}
        onChange={(value) => update('name', value)}
        error={errors.name}
        required
      />
      <TextField
        label="Phone number"
        type="tel"
        placeholder="+675 7000 0000"
        autoComplete="tel"
        value={form.phone}
        onChange={(value) => update('phone', value)}
        error={errors.phone}
        required
      />
      <TextField
        label="Email address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={form.email}
        onChange={(value) => update('email', value)}
        error={errors.email}
        required
      />

      <label className="sm:col-span-2">
        <span className="field-label">Anything we should know? <span className="font-normal text-muted">(optional)</span></span>
        <textarea
          rows={4}
          value={form.message}
          onChange={(event) => update('message', event.target.value)}
          placeholder={isRoom
            ? 'Room preferences, children travelling, airport transfers…'
            : 'Tell us a little more about your booking…'}
          className="field-input resize-none"
        />
      </label>

      {formError && (
        <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {formError}
        </div>
      )}

      <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-muted">Secure checkout will be available once payment gateway keys are configured. For now, our team will confirm and arrange payment with you.</p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-coral-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Sending request…' : 'Request booking'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden="true">
            <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </form>
  )
}

function BookingConfirmation({ booking, onReset }: { booking: Booking; onReset: () => void }) {
  const nights = stayNights(booking.date, booking.checkout)
  const rate = roomRate(booking.room)
  const rooms = Math.max(1, Number(booking.rooms) || 1)
  const total = rate && nights > 0 ? rate * nights * rooms : 0
  const [payState, setPayState] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [payMsg, setPayMsg] = useState('')

  const handlePay = async () => {
    setPayState('working')
    setPayMsg('')
    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          reference: booking.reference,
          amountK: total || 0,
          currency: 'PGK',
          description: `Booking ${booking.reference} - ${bookingTypeLabel(booking.booking_type)}`,
          customerEmail: booking.email,
          customerName: booking.name,
          successUrl: `${window.location.origin}/booking?paid=1&ref=${booking.reference}`,
          cancelUrl: `${window.location.origin}/booking?cancelled=1&ref=${booking.reference}`,
        }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      setPayState('done')
      setPayMsg(data.message || `Payment ${data.status}. ${data.transactionId ? `Ref: ${data.transactionId}` : ''}`)
    } catch {
      setPayState('error')
      setPayMsg('Payment setup failed. Please try again or contact us.')
    }
  }

  return (
    <div className="rounded-2xl border border-teal/20 bg-teal/5 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-teal text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-6" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <div>
          <strong className="font-display text-2xl text-teal">Booking request received</strong>
          <p className="mt-1 text-sm leading-6 text-muted">
            Thank you, {booking.name.split(' ')[0]}. Our reservations team will confirm availability and final details shortly.
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ocean/10 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ocean/10 bg-sand-light px-5 py-4">
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-muted">Booking reference</span>
          <span className="font-mono text-lg font-bold tracking-[0.18em] text-ocean">{booking.reference}</span>
        </div>
        <dl className="grid gap-x-6 gap-y-4 px-5 py-5 text-sm sm:grid-cols-2">
          <Detail label="Booking type" value={bookingTypeLabel(booking.booking_type)} />
          <Detail
            label="Status"
            value={<span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Pending confirmation</span>}
          />
          <Detail label={booking.checkout ? 'Check-in' : 'Date'} value={formatBookingDate(booking.date)} />
          {booking.checkout && <Detail label="Check-out" value={formatBookingDate(booking.checkout)} />}
          {booking.room && <Detail label="Room" value={roomName(booking.room) ?? booking.room} />}
          {nights > 0 && <Detail label="Nights" value={`${nights} night${nights === 1 ? '' : 's'}`} />}
          {booking.party && <Detail label="Guests" value={booking.party} />}
          {rooms > 1 && <Detail label="Rooms" value={String(rooms)} />}
          {total > 0 && <Detail label="Estimated total" value={`K${total.toLocaleString()}`} />}
        </dl>
      </div>

      <p className="mt-4 text-xs leading-5 text-muted">
        Keep your reference for any follow-up. If you need to change something, call us at +675 7000 0000.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        {total > 0 && payState !== 'done' && (
          <button
            type="button"
            onClick={handlePay}
            disabled={payState === 'working'}
            className="inline-flex items-center justify-center rounded-full bg-coral px-6 py-3 text-sm font-bold text-white transition hover:bg-coral-dark disabled:opacity-60"
          >
            {payState === 'working' ? 'Processing…' : `Pay K${total.toLocaleString()} (mock)`}
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-full bg-ocean px-6 py-3 text-sm font-bold text-white transition hover:bg-teal"
        >
          Make another booking
        </button>
      </div>
      {payMsg && <p className={`mt-3 text-sm ${payState === 'error' ? 'text-red-600' : 'text-teal'}`}>{payMsg}</p>}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">{value}</dd>
    </div>
  )
}

function FieldError({ children }: { children: string }) {
  return <span className="mt-1.5 block text-xs font-semibold text-red-600">{children}</span>
}

function TextField({
  label,
  value,
  onChange,
  error,
  ...inputProps
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input
        {...inputProps}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`field-input ${error ? 'border-red-400' : ''}`}
        aria-invalid={Boolean(error)}
      />
      {error && <FieldError>{error}</FieldError>}
    </label>
  )
}
