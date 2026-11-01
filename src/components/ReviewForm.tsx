import { useState } from 'react'

export default function ReviewForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [status, setStatus] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('')
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, text, rating }),
      })
      if (!res.ok) throw new Error('Failed')
      setName(''); setText(''); setRating(5)
      setStatus('Thank you! Your review is pending approval.')
      onSubmitted()
    } catch {
      setStatus('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-white p-5 shadow">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
      <select value={rating} onChange={e => setRating(Number(e.target.value))} className="rounded-xl border border-ocean/20 px-4 py-2 text-sm">
        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} stars</option>)}
      </select>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Your review" rows={3} className="rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
      <button type="submit" className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal transition">Submit Review</button>
      {status && <p className="text-sm text-center text-teal">{status}</p>}
    </form>
  )
}
