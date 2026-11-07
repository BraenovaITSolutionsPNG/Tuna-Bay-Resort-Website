import { useState, useEffect } from 'react'

interface Room {
  id: number
  name: string
  description: string
  price: string
  features: string
  image: string
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [form, setForm] = useState({ name: '', description: '', price: '', features: '', image: '' })
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const reload = () => {
    fetch('/api/rooms',{headers: localStorage.getItem('token')?{Authorization:`Bearer ${localStorage.getItem('token')}`}:{}}).then(async r=>{ if(r.status===401||r.status===403) throw 0; return r.ok?r.json():[] }).then(d=>setRooms(Array.isArray(d)?d:[])).catch(()=>setRooms([]))
  }

  useEffect(() => { reload() }, [])

  const token = () => localStorage.getItem('token') || ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/rooms/${editing}` : '/api/rooms'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(form),
    })
    setForm({ name: '', description: '', price: '', features: '', image: '' })
    setEditing(null)
    setShowForm(false)
    reload()
  }

  const editRoom = (r: Room) => {
    setForm({ name: r.name, description: r.description || '', price: r.price, features: r.features || '', image: r.image || '' })
    setEditing(r.id)
    setShowForm(true)
  }

  const deleteRoom = async (id: number) => {
    if (!confirm('Delete this room?')) return
    await fetch(`/api/rooms/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })
    reload()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#052633]">Rooms</h1>
      <p className="mt-1 text-muted">Manage resort rooms and rates.</p>

      <div className="mt-6">
        {!showForm && !editing && (
          <button onClick={() => setShowForm(true)} className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal transition">
            Add Room
          </button>
        )}
        {(showForm || editing) && (
          <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl bg-white p-5 shadow sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input placeholder="Room name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input placeholder="e.g. K450/night" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
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
              <textarea placeholder="Room description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
              <input placeholder="Queen Bed, WiFi, ..." value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal transition">
                {editing ? 'Update Room' : 'Add Room'}
              </button>
              <button type="button" onClick={() => { setEditing(null); setShowForm(false); setForm({ name: '', description: '', price: '', features: '', image: '' }) }} className="rounded-xl border border-ocean/20 px-4 py-2 text-sm font-bold text-ocean">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map(r => (
          <div key={r.id} className="rounded-2xl bg-white p-5 shadow">
            {r.image && <img src={r.image} alt={r.name} className="h-32 w-full rounded-xl object-cover" />}
            <h3 className="mt-3 font-display text-lg text-ocean">{r.name}</h3>
            <p className="mt-1 text-sm text-muted">{r.description}</p>
            <p className="mt-2 font-bold text-coral">{r.price}</p>
            <p className="mt-1 text-xs text-muted">{r.features}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => editRoom(r)} className="text-xs text-blue-600 hover:underline">Edit</button>
              <button onClick={() => deleteRoom(r.id)} className="text-xs text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
