import { useState } from 'react'

export default function ReviewForm({ onSubmitted, onClose }: { onSubmitted: () => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [bookingReference, setBookingReference] = useState('')
  const [status, setStatus] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('')
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, text, rating, bookingReference: bookingReference || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed')
      setName(''); setText(''); setRating(5); setBookingReference('')
      setStatus('Thank you! Your review is pending approval.')
      onSubmitted()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={submit} className="relative grid gap-3 rounded-2xl bg-white p-5 pt-10 text-ocean shadow">
      <button type="button" onClick={onClose} className="absolute right-3 top-3 text-xl leading-none text-gray-500 hover:text-ocean" aria-label="Close">×</button>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="rounded-xl border border-ocean/20 bg-white px-4 py-2 text-sm text-ocean placeholder:text-slate-400" required />
      <input value={bookingReference} onChange={e => setBookingReference(e.target.value)} placeholder="Booking reference (optional, enables post-stay review)" className="rounded-xl border border-ocean/20 bg-white px-4 py-2 text-sm text-ocean placeholder:text-slate-400" />
      <select value={rating} onChange={e => setRating(Number(e.target.value))} className="rounded-xl border border-ocean/20 bg-white px-4 py-2 text-sm text-ocean">
        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r} className="text-ocean">{r} stars</option>)}
      </select>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Your review" rows={3} className="rounded-xl border border-ocean/20 bg-white px-4 py-2 text-sm text-ocean placeholder:text-slate-400" required />
      <button type="submit" className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white transition hover:bg-teal">Submit Review</button>
      {status && <p className={`text-center text-sm ${status.startsWith('Thank') ? 'text-teal' : 'text-coral'}`}>{status}</p>}
    </form>
  )
}
