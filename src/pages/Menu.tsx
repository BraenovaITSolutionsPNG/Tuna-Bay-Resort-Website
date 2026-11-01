import { useState } from 'react'
import { Header, Footer, Eyebrow } from '../components/Layout'

const menuData = {
  dining: [
    { name: 'Tuna Bay Seafood Basket', description: 'Crispy fish, prawns, calamari, chips & house slaw', price: 'K85' },
    { name: 'Chargrilled Reef Fish', description: 'Seasonal catch, coconut rice, greens & lime butter', price: 'K72' },
    { name: 'Coastal Mixed Grill', description: 'Chicken, beef, sausage, chips & garden salad', price: 'K78' },
    { name: 'Coconut Prawn Curry', description: 'Local prawns, fragrant coconut curry & steamed rice', price: 'K65' },
  ],
  drinks: [
    { name: 'Tropical Fruit Cooler', description: 'Pineapple, passionfruit, lime & soda', price: 'K18' },
    { name: 'Local Beer Bucket', description: 'Five chilled local beers served on ice', price: 'K55' },
    { name: 'Tuna Bay Sunset', description: 'Rum, orange, pineapple & grenadine', price: 'K28' },
    { name: 'Fresh Coconut', description: 'Chilled whole young coconut', price: 'K15' },
  ],
  hire: [
    { name: 'Pier Gathering', description: 'Reserved waterfront area for up to 20 guests', price: 'From K450' },
    { name: 'Garden Celebration', description: 'Private lawn and seating for up to 50 guests', price: 'From K900' },
    { name: 'Full Venue Function', description: 'Exclusive venue access with dedicated service team', price: 'From K2,500' },
    { name: 'Family Day Pass', description: 'Weekend entry for two adults and up to three children', price: 'K60' },
  ],
}

export default function Menu() {
  const [activeTab, setActiveTab] = useState<keyof typeof menuData>('dining')
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
            {([['dining', 'Food'], ['drinks', 'Cold Drinks'], ['hire', 'Venue Hire']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`rounded-full px-4 py-3 text-sm font-bold transition sm:px-7 ${activeTab === key ? 'bg-seafoam text-ocean shadow-lg' : 'text-white/60 hover:text-white'}`}>{label}</button>
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-white/12 bg-white/[0.07] px-6 shadow-2xl shadow-black/10 backdrop-blur-md sm:px-8">
            <div className="grid gap-x-14 md:grid-cols-2">
              {menuData[activeTab].map((item) => (
                <article key={item.name} className="flex items-start justify-between gap-5 border-b border-white/12 py-6">
                  <div><h3 className="font-display text-xl">{item.name}</h3><p className="mt-2 text-sm leading-6 text-white/60">{item.description}</p></div>
                  <span className="shrink-0 font-display text-lg text-seafoam">{item.price}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
