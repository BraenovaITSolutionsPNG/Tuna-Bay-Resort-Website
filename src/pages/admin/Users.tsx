import { useState, useEffect } from 'react'

interface User {
  id: number
  email: string
  name: string
  role: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'staff' })
  const [showForm, setShowForm] = useState(false)

  const reload = () => {
    const token = localStorage.getItem('token')
    fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .catch(() => setUsers([]))
  }

  useEffect(() => { reload() }, [])

  const token = () => localStorage.getItem('token') || ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(form),
    })
    setForm({ email: '', password: '', name: '', role: 'staff' })
    setShowForm(false)
    reload()
  }

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return
    await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })
    reload()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#052633]">Users</h1>
      <p className="mt-1 text-muted">Manage admin and staff accounts.</p>

      <div className="mt-6">
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal transition">
            Add User
          </button>
        )}
        {showForm && (
          <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl bg-white p-5 shadow sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm">
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal transition">Add User</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-ocean/20 px-4 py-2 text-sm font-bold text-ocean">Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-sm">
          <thead className="bg-ocean text-white">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-ocean/10">
                <td className="px-4 py-3">{u.id}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteUser(u.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
