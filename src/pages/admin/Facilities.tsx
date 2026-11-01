import { useState, useEffect } from 'react'

interface Facility {
  id: number
  title: string
  text: string
  image: string
}

export default function AdminFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])

  useEffect(() => {
    fetch('/api/facilities').then(r => r.ok ? r.json() : []).then(d => setFacilities(Array.isArray(d) ? d : [])).catch(() => setFacilities([]))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#052633]">Facilities</h1>
      <p className="mt-1 text-muted">Manage resort facilities.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map(f => (
          <div key={f.id} className="rounded-2xl bg-white p-5 shadow">
            <img src={f.image} alt={f.title} className="h-32 w-full rounded-xl object-cover" />
            <h3 className="mt-3 font-display text-lg text-ocean">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
