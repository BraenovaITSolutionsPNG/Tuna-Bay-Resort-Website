import { Link } from 'react-router-dom'
import { Header, Footer, Eyebrow } from '../components/Layout'

const heroImage = '/images/tuna-bay-hero.jpg'
const aboutImage = '/images/tuna-bay-waterfront.png'

const offerings = [
  { title: 'Coastal Dining & Bar', text: 'Fresh seafood, flame-grilled favourites and ice-cold drinks served right by the water.', href: '/menu' },
  { title: 'Private Venue Hire', text: 'Flexible spaces for birthdays, celebrations, team events and intimate functions.', href: '/booking' },
  { title: 'Family Day Passes', text: 'Slow weekends, open-air fun and relaxed spaces made for the whole family.', href: '/menu' },
  { title: 'Jetty & Sunset Views', text: 'Walk the waterfront jetty and settle in for one of Taurama’s best sunset views.', href: '/gallery' },
]

const facilities = [
  { title: 'Resort Rooms', text: 'Comfortable accommodation for overnight stays and relaxed coastal weekends.' },
  { title: 'Resort Swimming Pool', text: 'A spacious outdoor pool with separate shallow areas for relaxed family days.' },
  { title: 'Waterfront Jetty', text: 'Direct access to the bay with open views across the water and surrounding coast.' },
  { title: 'Restaurant & Bar', text: 'Covered, open-air dining with fresh meals, cold drinks and poolside service.' },
]

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-sand text-ink">
      <Header variant="dark" />
      <section className="relative flex min-h-[92svh] items-end bg-ocean pb-16 pt-36 text-white md:items-center md:pb-8">
        <img src={heroImage} alt="Aerial view of Tuna Bay Resort and its waterfront pool" className="absolute inset-0 size-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,37,51,.94)_0%,rgba(5,37,51,.68)_48%,rgba(5,37,51,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,37,51,.65)_0%,transparent_48%)]" />
        <div className="page-wrap relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="mb-6 text-xs font-bold uppercase tracking-[0.23em] text-seafoam">
              Taurama · Port Moresby
            </div>
            <h1 className="font-display text-5xl leading-[0.98] tracking-[-0.035em] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              Your Coastal Escape <em className="font-normal text-seafoam">Behind the Mangroves</em> of Taurama
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
              Relaxing ocean views, fresh dining, and private function spaces just minutes from central Port Moresby.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/menu" className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-coral-dark">
                View Menu 
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
              </Link>
              <Link to="/booking" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                Reserve a Table / Function
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-sand">
        <div className="page-wrap grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem]">
              <img src={aboutImage} alt="Aerial view of Tuna Bay’s waterfront jetty and surrounding coastline" className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]" />
            </div>
          </div>
          <div>
            <Eyebrow>Our little corner of the coast</Eyebrow>
            <h2 className="heading-lg mt-4">Where the city <em>slows down</em> and the tide rolls in.</h2>
            <p className="mt-6 text-lg leading-8 text-muted">Tucked behind Taurama’s mangroves, Tuna Bay Resort is a welcoming waterfront hideaway made for long lunches, salt-air afternoons and celebrations that feel a little more special.</p>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 rounded-full bg-ocean px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal">
              Learn More
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-space bg-white">
        <div className="page-wrap">
          <div className="text-center mb-12">
            <Eyebrow>Eat · Celebrate · Unwind</Eyebrow>
            <h2 className="heading-lg mt-4">Everything you need for a <em>day by the bay.</em></h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {offerings.map((item) => (
              <article key={item.title} className="group relative overflow-hidden rounded-3xl border border-ocean/10 bg-sand-light p-6 transition duration-300 hover:-translate-y-1 hover:bg-ocean hover:text-white hover:shadow-xl">
                <h3 className="mt-4 font-display text-2xl leading-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted group-hover:text-white/65">{item.text}</p>
                <Link to={item.href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal group-hover:text-seafoam">
                  Explore 
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-sand-light">
        <div className="page-wrap">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end mb-12">
            <div>
              <Eyebrow>Resort facilities</Eyebrow>
              <h2 className="heading-lg mt-4">Relax, swim & <em>celebrate</em></h2>
            </div>
            <Link to="/facilities" className="inline-flex items-center gap-2 rounded-full bg-ocean px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal">
              View All Facilities
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
