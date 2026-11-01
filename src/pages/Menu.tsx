import { useState, useEffect } from 'react'
import { Header, Footer, Eyebrow } from '../components/Layout'

interface MenuItem {
  id: number
  category: string
  name: string
  description: string
  price: string
}

export default function Menu() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dining')

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.ok ? r.json() : [])
      .then(d => setMenu(Array.isArray(d) ? d : []))
      .catch(() => setMenu([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = Array.from(new Set(menu.map(m => m.category)))
  const tabs = categories.length ? categories : ['dining', 'drinks', 'hire']

  return (
    <main className="overflow-x-hidden text-white">
      <Header variant="dark" />
      <section className="relative overflow-hidden bg-ocean pb-20 pt-32">
        <img src="/images/abstract-ocean-waves.png" alt="" className="absolute inset-0 size-full object-cover" aria-hidden="true" />
        <div className="absolute -left-32 top-20 size-80 rounded-full bg-seafoam/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 size-96 rounded-full bg-teal/25 blur-3xl" />
        <div className="page-wrap relative">
          <div className="text-center">
            <Eyebrow light>Taste Tuna Bay</Eyebrow>
            <h1 className="heading-lg mx-auto mt-4 max-w-3xl">Fresh from the coast, <em>made to share.</em></h1>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-white/60">Browse a taste of our favourites and current venue packages. Prices shown in PNG Kina.</p>
          </div>
          <div className="mx-auto mt-10 flex w-fit max-w-full rounded-full border border-white/10 bg-white/8 p-1.5 shadow-lg backdrop-blur-md">
            {tabs.map(key => (
              <button key={key} onClick={() => setActiveTab(key)} className={`rounded-full px-4 py-3 text-sm font-bold transition sm:px-7 ${activeTab === key ? 'bg-seafoam text-ocean shadow-lg' : 'text-white/60 hover:text-white'}`}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          {loading ? (
            <p className="text-center mt-10 text-white/60">Loading menu...</p>
          ) : (
            <div className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-white/12 bg-white/[0.07] px-6 shadow-2xl shadow-black/10 backdrop-blur-md sm:px-8">
              <div className="grid gap-x-14 md:grid-cols-2">
                {menu.filter(m => m.category === activeTab).map((item) => (
                  <article key={item.id} className="flex items-start justify-between gap-5 border-b border-white/12 py-6">
                    <div><h3 className="font-display text-xl">{item.name}</h3><p className="mt-2 text-sm leading-6 text-white/60">{item.description}</p></div>
                    <span className="shrink-0 font-display text-lg text-seafoam">{item.price}</span>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
