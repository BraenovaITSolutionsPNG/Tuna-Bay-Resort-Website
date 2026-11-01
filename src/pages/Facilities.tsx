import { Header, Footer, Eyebrow } from '../components/Layout'

const facilities = [
  { title: 'Resort Rooms', text: 'Comfortable accommodation for overnight stays and relaxed coastal weekends.' },
  { title: 'Resort Swimming Pool', text: 'A spacious outdoor pool with separate shallow areas for relaxed family days.' },
  { title: 'Waterfront Jetty', text: 'Direct access to the bay with open views across the water and surrounding coast.' },
  { title: 'Restaurant & Bar', text: 'Covered, open-air dining with fresh meals, cold drinks and poolside service.' },
  { title: 'Function Spaces', text: 'Flexible indoor and outdoor areas for private parties, meetings and celebrations.' },
  { title: 'Family-Friendly Grounds', text: 'Open lawns and comfortable shaded spaces with room for everyone to unwind.' },
  { title: 'On-site Parking', text: 'Convenient guest parking located close to the pool, dining and event areas.' },
]

export default function Facilities() {
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <article key={facility.title} className="rounded-3xl border border-ocean/8 bg-white p-6 shadow-[0_12px_35px_rgba(8,49,64,.05)]">
                <h3 className="font-display text-xl text-ocean">{facility.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{facility.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
