import { useState, useEffect } from 'react'
import { Header, Footer, Eyebrow } from '../components/Layout'

interface Room {
  id: number
  name: string
  description: string
  price: string
  features: string
  image: string
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/rooms')
      .then(r => r.ok ? r.json() : [])
      .then(d => setRooms(Array.isArray(d) ? d : []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="overflow-x-hidden bg-sand text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap">
          <div className="text-center mb-12">
            <Eyebrow>Accommodation</Eyebrow>
            <h1 className="heading-lg mt-4">Rooms & <em>Rates</em></h1>
            <p className="mt-6 max-w-2xl mx-auto leading-7 text-muted">Comfortable coastal accommodation just steps from the water. All rooms include modern amenities for a relaxing stay.</p>
          </div>
          {loading ? (
            <p className="text-center text-muted">Loading rooms...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <article key={room.id} className="rounded-3xl border border-ocean/10 bg-white overflow-hidden shadow-[0_12px_35px_rgba(8,49,64,.05)]">
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-ocean to-teal">
                    {room.image && <img src={room.image} alt={room.name} className="size-full object-cover" />}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-xl text-ocean">{room.name}</h3>
                      <span className="shrink-0 font-display text-lg text-coral">{room.price}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{room.description}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {room.features?.split(',').map((feature, i) => (
                        <li key={i} className="rounded-full bg-seafoam/20 px-3 py-1 text-xs font-medium text-teal">{feature.trim()}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
