import { useState, useEffect } from 'react'

interface MenuItem {
  id: number
  category: string
  name: string
  description: string
  price: string
}

const DEFAULT_CATEGORIES = ['dining', 'drinks', 'hire']

export default function AdminMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [form, setForm] = useState({ category: 'dining', name: '', description: '', price: '' })
  const [newCategory, setNewCategory] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const reload = () => {
    fetch('/api/menu',{headers: localStorage.getItem('token')?{Authorization:`Bearer ${localStorage.getItem('token')}`}:{}}).then(r => r.ok ? r.json() : []).then(d => {
      const items = Array.isArray(d) ? d : []
      setMenu(items)
      const cats = Array.from(new Set(items.map((m: MenuItem) => m.category).concat(DEFAULT_CATEGORIES)))
      setCategories(cats)
    }).catch(() => setMenu([]))
  }

  useEffect(() => { reload() }, [])

  const token = () => localStorage.getItem('token') || ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/menu/${editing}` : '/api/menu'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(form),
    })
    setForm({ category: form.category, name: '', description: '', price: '' })
    setEditing(null)
    setShowForm(false)
    reload()
  }

  const editItem = (m: MenuItem) => {
    setForm({ category: m.category, name: m.name, description: m.description || '', price: m.price })
    setEditing(m.id)
    setShowForm(true)
  }

  const deleteItem = async (id: number) => {
    if (!confirm('Delete this menu item?')) return
    await fetch(`/api/menu/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })
    reload()
  }

  const addCategory = () => {
    const c = newCategory.trim().toLowerCase()
    if (!c || categories.includes(c)) return
    setCategories([...categories, c])
    setForm({ ...form, category: c })
    setNewCategory('')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#052633]">Menu</h1>
      <p className="mt-1 text-muted">Manage menu items and categories.</p>

      <div className="mt-6">
        {!showForm && !editing && (
          <button onClick={() => setShowForm(true)} className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white shadow-lg shadow-ocean/20 hover:bg-teal transition">
            Add Menu Item
          </button>
        )}
        {(showForm || editing) && (
          <form onSubmit={submit} className="mt-4 grid gap-3 glass-panel rounded-2xl p-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="flex gap-2">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="flex-1 rounded-xl border border-ocean/20 px-4 py-2 text-sm">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input placeholder="Item name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input placeholder="e.g. K85" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea placeholder="Item description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" rows={2} />
            </div>
            <div className="sm:col-span-2 flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Category</label>
                <input placeholder="e.g. desserts" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" />
              </div>
              <button type="button" onClick={addCategory} className="rounded-xl border border-ocean/20 px-4 py-2 text-sm font-bold text-ocean">
                Add Category
              </button>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white shadow-lg shadow-ocean/20 hover:bg-teal transition">
                {editing ? 'Update Item' : 'Add Item'}
              </button>
              <button type="button" onClick={() => { setEditing(null); setShowForm(false); setForm({ category: 'dining', name: '', description: '', price: '' }) }} className="rounded-xl border border-ocean/20 px-4 py-2 text-sm font-bold text-ocean">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-6 glass-panel overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-ocean/90 text-white backdrop-blur-sm">
            <tr>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menu.map(m => (
              <tr key={m.id} className="border-t border-ocean/10">
                <td className="px-4 py-3">{m.category}</td>
                <td className="px-4 py-3">{m.name}</td>
                <td className="px-4 py-3">{m.description}</td>
                <td className="px-4 py-3">{m.price}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => editItem(m)} className="text-xs text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => deleteItem(m.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
