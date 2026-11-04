import { FormEvent, useState } from 'react'
import { createBooking, isValidEmail, todayIso } from '../lib/bookings'

export default function EnquiryForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!name.trim()) return setError('Enter your name.')
    if (!email.trim() || !isValidEmail(email)) return setError('Enter a valid email.')
    if (!phone.trim()) return setError('Enter your phone number.')
    if (!message.trim()) return setError('Enter your enquiry.')

    setSubmitting(true)
    try {
      await createBooking({
        bookingType: 'general',
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        date: todayIso(),
        party: '1',
        message: message.trim(),
      })
      setDone(true)
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-teal/20 bg-teal/5 p-6 text-center">
        <strong className="font-display text-xl text-teal">Enquiry sent</strong>
        <p className="mt-2 text-sm text-muted">Our team will get back to you shortly.</p>
        <button onClick={() => setDone(false)} className="mt-4 rounded-full bg-ocean px-5 py-2 text-sm font-bold text-white">Send another</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label>
        <span className="field-label">Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="field-input" placeholder="Full name" />
      </label>
      <label>
        <span className="field-label">Email address</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" placeholder="you@example.com" />
      </label>
      <label>
        <span className="field-label">Phone number</span>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="field-input" placeholder="+675 7000 0000" />
      </label>
      <label>
        <span className="field-label">Your enquiry</span>
        <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="field-input resize-none" placeholder="How can we help?" />
      </label>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <button type="submit" disabled={submitting} className="rounded-full bg-coral px-6 py-3 text-sm font-bold text-white transition hover:bg-coral-dark disabled:opacity-60">
        {submitting ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  )
}
