import { useState, useEffect } from 'react'
import { Header, Footer, Eyebrow } from '../components/Layout'

interface Facility {
  id: number
  title: string
  text: string
  image: string
}

export default function Facilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/facilities')
      .then(r => r.ok ? r.json() : [])
      .then(d => setFacilities(Array.isArray(d) ? d : []))
      .catch(() => setFacilities([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="overflow-x-hidden bg-sand-light text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap">
          <div className="text-center mb-12">
            <Eyebrow>Resort facilities</Eyebrow>
            <h1 className="heading-lg mt-4">Everything for an <em>easy day out.</em></h1>
            <p className="mt-6 max-w-2xl mx-auto leading-7 text-muted">Settle in for the day with all the essentials close by, from a refreshing swim and waterfront dining to generous spaces for families and private events.</p>
          </div>
          {loading ? (
            <p className="text-center text-muted">Loading facilities...</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {facilities.map((facility) => (
                <article key={facility.id} className="rounded-3xl border border-ocean/8 bg-white overflow-hidden shadow-[0_12px_35px_rgba(8,49,64,.05)]">
                  <div className="relative h-48 overflow-hidden">
                    {facility.image && <img src={facility.image} alt={facility.title} className="size-full object-cover" />}
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl text-ocean">{facility.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{facility.text}</p>
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
