import { useState, useEffect } from 'react'

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')

  const token = () => localStorage.getItem('token') || ''
  const auth = () => ({ Authorization: `Bearer ${token()}` })

  const reload = () => {
    fetch('/api/settings', { headers: auth() }).then(r => r.ok ? r.json() : []).then(d => {
      const map: Record<string, string> = {}
      if (Array.isArray(d)) d.forEach((s: any) => { map[s.key] = s.value })
      setSettings(map)
    }).catch(() => {})
  }

  useEffect(() => { reload() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth() },
      body: JSON.stringify({ key, value }),
    })
    setKey(''); setValue('')
    reload()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#052633]">Settings</h1>
      <p className="mt-1 text-muted">Manage site settings.</p>

      <div className="mt-6 glass-panel rounded-2xl p-5">
        <h3 className="font-display text-lg text-ocean mb-4">Current Settings</h3>
        <div className="space-y-2">
          {Object.entries(settings).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-ocean/10 py-2">
              <span className="text-sm font-medium text-gray-700">{k}</span>
              <span className="text-sm text-muted">{v}</span>
            </div>
          ))}
          {Object.keys(settings).length === 0 && <p className="text-sm text-muted">No settings yet.</p>}
        </div>
      </div>

      <form onSubmit={save} className="mt-6 flex flex-wrap gap-3 glass-panel rounded-2xl p-5">
        <input placeholder="Key (e.g. phone)" value={key} onChange={e => setKey(e.target.value)} className="rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
        <input placeholder="Value" value={value} onChange={e => setValue(e.target.value)} className="flex-1 rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
        <button type="submit" className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white shadow-lg shadow-ocean/20 hover:bg-teal transition">Save</button>
      </form>
    </div>
  )
}
