import { useState, useEffect } from 'react'

interface Facility {
  id: number
  title: string
  text: string
  image: string
}

export default function AdminFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [form, setForm] = useState({ title: '', text: '', image: '' })
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const reload = () => {
    fetch('/api/facilities',{headers: localStorage.getItem('token')?{Authorization:`Bearer ${localStorage.getItem('token')}`}:{}}).then(async r=>{ if(r.status===401||r.status===403) throw 0; return r.ok?r.json():[] }).then(d=>setFacilities(Array.isArray(d)?d:[])).catch(()=>setFacilities([]))
  }

  useEffect(() => { reload() }, [])

  const token = () => localStorage.getItem('token') || ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/facilities/${editing}` : '/api/facilities'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(form),
    })
    setForm({ title: '', text: '', image: '' })
    setEditing(null)
    setShowForm(false)
    reload()
  }

  const editFacility = (f: Facility) => {
    setForm({ title: f.title, text: f.text || '', image: f.image || '' })
    setEditing(f.id)
    setShowForm(true)
  }

  const deleteFacility = async (id: number) => {
    if (!confirm('Delete this facility?')) return
    await fetch(`/api/facilities/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })
    reload()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#052633]">Facilities</h1>
      <p className="mt-1 text-muted">Manage resort facilities.</p>

      <div className="mt-6">
        {!showForm && !editing && (
          <button onClick={() => setShowForm(true)} className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal transition">
            Add Facility
          </button>
        )}
        {(showForm || editing) && (
          <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl bg-white p-5 shadow sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input placeholder="Facility title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => setForm({ ...form, image: reader.result as string })
                reader.readAsDataURL(file)
              }} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" />
              {form.image && <img src={form.image} alt="preview" className="mt-2 h-24 rounded-xl object-cover" />}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea placeholder="Facility description" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" rows={2} />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal transition">
                {editing ? 'Update Facility' : 'Add Facility'}
              </button>
              <button type="button" onClick={() => { setEditing(null); setShowForm(false); setForm({ title: '', text: '', image: '' }) }} className="rounded-xl border border-ocean/20 px-4 py-2 text-sm font-bold text-ocean">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map(f => (
          <div key={f.id} className="rounded-2xl bg-white p-5 shadow">
            {f.image && <img src={f.image} alt={f.title} className="h-32 w-full rounded-xl object-cover" />}
            <h3 className="mt-3 font-display text-lg text-ocean">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.text}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => editFacility(f)} className="text-xs text-blue-600 hover:underline">Edit</button>
              <button onClick={() => deleteFacility(f.id)} className="text-xs text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
