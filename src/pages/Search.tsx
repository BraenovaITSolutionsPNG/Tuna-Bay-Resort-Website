import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header, Footer, Eyebrow } from '../components/Layout'

interface Room { id: number; name: string; description: string; price: string }
interface Facility { id: number; title: string; text: string }
interface MenuItem { id: number; name: string; description: string; price: string; category: string }
interface GalleryImage { id: number; src: string; alt: string | null; title: string | null }

export default function Search() {
  const [query, setQuery] = useState('')
  const [rooms, setRooms] = useState<Room[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [loaded, setLoaded] = useState(false)

  const load = () => {
    if (loaded) return
    Promise.all([
      fetch('/api/rooms').then(r => r.ok ? r.json() : []),
      fetch('/api/facilities').then(r => r.ok ? r.json() : []),
      fetch('/api/menu').then(r => r.ok ? r.json() : []),
      fetch('/api/gallery').then(r => r.ok ? r.json() : []),
    ]).then(([r, f, m, g]) => {
      setRooms(Array.isArray(r) ? r : [])
      setFacilities(Array.isArray(f) ? f : [])
      setMenu(Array.isArray(m) ? m : [])
      setGallery(Array.isArray(g) ? g : [])
      setLoaded(true)
    })
  }

  useEffect(() => { load() }, [])

  const q = query.toLowerCase().trim()
  const filteredRooms = q ? rooms.filter(r => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)) : []
  const filteredFacilities = q ? facilities.filter(f => f.title.toLowerCase().includes(q) || f.text?.toLowerCase().includes(q)) : []
  const filteredMenu = q ? menu.filter(m => m.name.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q)) : []
  const filteredGallery = q ? gallery.filter(g => g.title?.toLowerCase().includes(q) || g.alt?.toLowerCase().includes(q)) : []

  return (
    <main className="overflow-x-hidden bg-sand text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap max-w-3xl">
          <Eyebrow>Search</Eyebrow>
          <h1 className="heading-lg mt-4">Find <em>anything</em></h1>
          <input
            type="text"
            placeholder="Search rooms, menu, facilities..."
            value={query}
            onChange={e => { setQuery(e.target.value); load() }}
            onFocus={load}
            className="mt-6 w-full rounded-xl border border-ocean/20 px-4 py-3 text-sm focus:ring-2 focus:ring-ocean outline-none"
          />

          {q && (
            <div className="mt-8 space-y-6">
              {filteredRooms.length > 0 && (
                <div>
                  <h2 className="font-display text-xl text-ocean mb-3">Rooms</h2>
                  {filteredRooms.map(r => (
                    <Link key={r.id} to="/rooms" className="block rounded-xl bg-white p-4 shadow mb-2 hover:shadow-md transition">
                      <span className="font-bold text-ocean">{r.name}</span>
                      <span className="ml-2 text-sm text-coral">{r.price}</span>
                      <p className="text-sm text-muted">{r.description}</p>
                    </Link>
                  ))}
                </div>
              )}
              {filteredFacilities.length > 0 && (
                <div>
                  <h2 className="font-display text-xl text-ocean mb-3">Facilities</h2>
                  {filteredFacilities.map(f => (
                    <Link key={f.id} to="/facilities" className="block rounded-xl bg-white p-4 shadow mb-2 hover:shadow-md transition">
                      <span className="font-bold text-ocean">{f.title}</span>
                      <p className="text-sm text-muted">{f.text}</p>
                    </Link>
                  ))}
                </div>
              )}
              {filteredMenu.length > 0 && (
                <div>
                  <h2 className="font-display text-xl text-ocean mb-3">Menu</h2>
                  {filteredMenu.map(m => (
                    <Link key={m.id} to="/menu" className="block rounded-xl bg-white p-4 shadow mb-2 hover:shadow-md transition">
                      <span className="font-bold text-ocean">{m.name}</span>
                      <span className="ml-2 text-sm text-coral">{m.price}</span>
                      <p className="text-sm text-muted">{m.description}</p>
                    </Link>
                  ))}
                </div>
              )}
              {filteredGallery.length > 0 && (
                <div>
                  <h2 className="font-display text-xl text-ocean mb-3">Gallery</h2>
                  {filteredGallery.map(g => (
                    <Link key={g.id} to="/gallery" className="block rounded-xl bg-white p-4 shadow mb-2 hover:shadow-md transition">
                      <span className="font-bold text-ocean">{g.title || 'Image'}</span>
                      <p className="text-sm text-muted">{g.alt}</p>
                    </Link>
                  ))}
                </div>
              )}
              {filteredRooms.length === 0 && filteredFacilities.length === 0 && filteredMenu.length === 0 && filteredGallery.length === 0 && (
                <p className="text-muted">No results found.</p>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
