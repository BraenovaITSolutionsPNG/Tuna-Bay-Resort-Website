import { useState, useEffect } from 'react'

interface Testimonial {
  id: number
  name: string
  text: string
  rating: number
  approved: boolean
}

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [form, setForm] = useState({ name: '', text: '', rating: 5 })
  const [showForm, setShowForm] = useState(false)

  const reload = () => {
    const token = localStorage.getItem('token')
    fetch('/api/testimonials?all=true', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
  }

  useEffect(() => { reload() }, [])

  const token = () => localStorage.getItem('token') || ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(form),
    })
    setForm({ name: '', text: '', rating: 5 })
    setShowForm(false)
    reload()
  }

  const deleteItem = async (id: number) => {
    if (!confirm('Delete this testimonial?')) return
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })
    reload()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#052633]">Testimonials</h1>
      <p className="mt-1 text-muted">Manage customer reviews.</p>

      <div className="mt-6">
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal transition">
            Add Testimonial
          </button>
        )}
        {showForm && (
          <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl bg-white p-5 shadow">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
              <input type="number" min={1} max={5} value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" rows={3} required />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal transition">Add</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-ocean/20 px-4 py-2 text-sm font-bold text-ocean">Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map(t => (
          <div key={t.id} className="rounded-2xl bg-white p-5 shadow">
            <div className="flex items-center justify-between">
              <p className="font-display text-ocean">{t.name}</p>
              <span className="text-yellow-500">{'★'.repeat(t.rating)}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{t.text}</p>
            <div className="mt-3 flex gap-2">
              {!t.approved && (
                <button onClick={async () => {
                  const token = localStorage.getItem('token')
                  await fetch(`/api/testimonials/${t.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ approved: true }) })
                  reload()
                }} className="text-xs text-green-600 hover:underline">Approve</button>
              )}
              {t.approved && <span className="text-xs text-green-600">Approved</span>}
              <button onClick={() => deleteItem(t.id)} className="text-xs text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
