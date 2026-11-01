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

  useEffect(() => {
    fetch('/api/rooms').then(r => r.ok ? r.json() : []).then(d => setRooms(Array.isArray(d) ? d : [])).catch(() => setRooms([]))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#052633]">Rooms</h1>
      <p className="mt-1 text-muted">Manage resort rooms and rates.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map(r => (
          <div key={r.id} className="rounded-2xl bg-white p-5 shadow">
            <img src={r.image} alt={r.name} className="h-32 w-full rounded-xl object-cover" />
            <h3 className="mt-3 font-display text-lg text-ocean">{r.name}</h3>
            <p className="mt-1 text-sm text-muted">{r.description}</p>
            <p className="mt-2 font-bold text-coral">{r.price}</p>
            <p className="mt-1 text-xs text-muted">{r.features}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
