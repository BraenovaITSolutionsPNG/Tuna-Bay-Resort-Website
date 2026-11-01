import { Header, Footer, Eyebrow } from '../components/Layout'

const rooms = [
  {
    name: 'Standard Room',
    description: 'Comfortable coastal rooms with modern amenities, perfect for couples or solo travelers.',
    price: 'K450/night',
    features: ['Queen Bed', 'Air Conditioning', 'Private Bathroom', 'WiFi'],
  },
  {
    name: 'Deluxe Room',
    description: 'Spacious rooms with enhanced comfort and garden views for a relaxing stay.',
    price: 'K550/night',
    features: ['King Bed', 'Air Conditioning', 'Private Bathroom', 'WiFi', 'Balcony'],
  },
  {
    name: 'Ocean View Suite',
    description: 'Stunning ocean views with separate living area, ideal for a special getaway.',
    price: 'K750/night',
    features: ['King Bed', 'Living Area', 'Ocean View', 'Air Conditioning', 'WiFi'],
  },
  {
    name: 'Family Room',
    description: 'Generous space for families with multiple beds and all the comforts you need.',
    price: 'K650/night',
    features: ['2 Queen Beds', 'Family Space', 'Air Conditioning', 'Private Bathroom', 'WiFi'],
  },
  {
    name: 'Beachfront Villa',
    description: 'Ultimate luxury with direct beach access, private space and premium amenities.',
    price: 'K950/night',
    features: ['King Bed', 'Private Villa', 'Beach Access', 'Air Conditioning', 'WiFi', 'Kitchenette'],
  },
]

export default function Rooms() {
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <article key={room.name} className="rounded-3xl border border-ocean/10 bg-white overflow-hidden shadow-[0_12px_35px_rgba(8,49,64,.05)]">
                <div className="h-48 bg-gradient-to-br from-ocean to-teal"></div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl text-ocean">{room.name}</h3>
                    <span className="shrink-0 font-display text-lg text-coral">{room.price}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{room.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {room.features.map((feature) => (
                      <li key={feature} className="rounded-full bg-seafoam/20 px-3 py-1 text-xs font-medium text-teal">{feature}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
