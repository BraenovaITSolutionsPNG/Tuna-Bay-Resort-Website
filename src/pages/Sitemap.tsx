import { Link } from 'react-router-dom'
import { Header, Footer, Eyebrow } from '../components/Layout'

const pages = [
  { name: 'Home', path: '/', description: 'Welcome to Tuna Bay Resort' },
  { name: 'About', path: '/about', description: 'Our story and coastal corner' },
  { name: 'Facilities', path: '/facilities', description: 'Pool, jetty, dining and more' },
  { name: 'Menu', path: '/menu', description: 'Food, drinks and venue hire' },
  { name: 'Gallery', path: '/gallery', description: 'Life at Tuna Bay' },
  { name: 'Rooms', path: '/rooms', description: 'Accommodation and rates' },
  { name: 'Booking', path: '/booking', description: 'Reservations and enquiries' },
  { name: 'Location', path: '/location', description: 'Find us in Taurama' },
]

export default function Sitemap() {
  return (
    <main className="overflow-x-hidden bg-sand text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap max-w-3xl">
          <div className="text-center mb-12">
            <Eyebrow>Navigation</Eyebrow>
            <h1 className="heading-lg mt-4">Site <em>Map</em></h1>
            <p className="mt-6 max-w-2xl mx-auto leading-7 text-muted">All pages on the Tuna Bay Resort website.</p>
          </div>
          <ul className="space-y-3">
            {pages.map((page) => (
              <li key={page.path}>
                <Link to={page.path} className="flex items-center justify-between rounded-2xl border border-ocean/10 bg-white px-5 py-4 transition hover:border-ocean/30 hover:shadow-md">
                  <div>
                    <span className="font-display text-lg text-ocean">{page.name}</span>
                    <p className="text-sm text-muted">{page.description}</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4 text-teal"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Footer />
    </main>
  )
}
