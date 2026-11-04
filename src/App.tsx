import { ReactNode, useState } from 'react'
import BookingForm from './components/BookingForm'

const heroImage = '/images/tuna-bay-hero.jpg'
const aboutImage = '/images/tuna-bay-waterfront.png'

type IconName =
  | 'arrow'
  | 'calendar'
  | 'chevron'
  | 'clock'
  | 'facebook'
  | 'family'
  | 'food'
  | 'instagram'
  | 'location'
  | 'menu'
  | 'phone'
  | 'sunset'
  | 'venue'
  | 'wave'

function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    calendar: <><path d="M8 2v4M16 2v4M3 9h18" /><rect x="3" y="4" width="18" height="17" rx="2" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    facebook: <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.7.3-1 1-1Z" />,
    family: <><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M14 15c3.7-.6 6.3 1 7 4.5" /></>,
    food: <><path d="M7 3v7M4 3v4c0 2 1 3 3 3s3-1 3-3V3M7 10v11M16 3c-2 2-2 7 1 9v9M17 12h2V3c-1 0-2 .1-3 0Z" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    phone: <path d="M5.5 3h3l1.5 5-2 1.5a15 15 0 0 0 6.5 6.5l1.5-2 5 1.5v3c0 1.4-1.1 2.5-2.5 2.5C10 21 3 14 3 5.5 3 4.1 4.1 3 5.5 3Z" />,
    sunset: <><path d="M3 18h18M5 14h14M8 14a4 4 0 0 1 8 0M12 3v3M4.2 6.2l2.1 2.1M19.8 6.2l-2.1 2.1" /></>,
    venue: <><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6M9 10h.01M15 10h.01" /></>,
    wave: <><path d="M2 8c3-3 5 3 8 0s5 3 8 0 4 0 4 0M2 14c3-3 5 3 8 0s5 3 8 0 4 0 4 0M4 20c2-2 4 2 6 0s4 2 6 0 4 0 4 0" /></>,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

const offerings = [
  { icon: 'food' as const, title: 'Coastal Dining & Bar', text: 'Fresh seafood, flame-grilled favourites and ice-cold drinks served right by the water.', href: '#menu' },
  { icon: 'venue' as const, title: 'Private Venue Hire', text: 'Flexible spaces for birthdays, celebrations, team events and intimate functions.', href: '#booking' },
  { icon: 'family' as const, title: 'Family Day Passes', text: 'Slow weekends, open-air fun and relaxed spaces made for the whole family.', href: '#menu' },
  { icon: 'sunset' as const, title: 'Jetty & Sunset Views', text: 'Walk the waterfront jetty and settle in for one of Taurama’s best sunset views.', href: '#menu' },
]

const facilities = [
  { icon: 'venue' as const, title: 'Resort Rooms', text: 'Comfortable accommodation for overnight stays and relaxed coastal weekends.' },
  { icon: 'wave' as const, title: 'Resort Swimming Pool', text: 'A spacious outdoor pool with separate shallow areas for relaxed family days.' },
  { icon: 'sunset' as const, title: 'Waterfront Jetty', text: 'Direct access to the bay with open views across the water and surrounding coast.' },
  { icon: 'food' as const, title: 'Restaurant & Bar', text: 'Covered, open-air dining with fresh meals, cold drinks and poolside service.' },
  { icon: 'venue' as const, title: 'Function Spaces', text: 'Flexible indoor and outdoor areas for private parties, meetings and celebrations.' },
  { icon: 'family' as const, title: 'Family-Friendly Grounds', text: 'Open lawns and comfortable shaded spaces with room for everyone to unwind.' },
  { icon: 'location' as const, title: 'On-site Parking', text: 'Convenient guest parking located close to the pool, dining and event areas.' },
]

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

const galleryImages = [
  {
    src: '/images/tuna-bay-hero.jpg',
    alt: 'Aerial view of the Tuna Bay Resort pool and grounds',
    title: 'Poolside days',
    className: 'sm:col-span-2 lg:col-span-2 lg:row-span-2',
  },
  {
    src: '/images/tuna-bay-waterfront.png',
    alt: 'Tuna Bay waterfront jetty surrounded by green coastline',
    title: 'The waterfront',
    className: 'lg:col-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1615608178738-37d47d27c13d?auto=format&fit=crop&w=1000&q=85',
    alt: 'Lush tropical island surrounded by clear blue water',
    title: 'Tropical surrounds',
    className: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1678080394259-824d24aeb05c?auto=format&fit=crop&w=1000&q=85',
    alt: 'Calm coastal water bordered by green trees',
    title: 'Quiet moments',
    className: '',
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<keyof typeof menuData>('dining')
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    ['About', '#about'],
    ['Facilities', '#facilities'],
    ['Menu', '#menu'],
    ['Gallery', '#gallery'],
    ['Hire', '#hire'],
    ['Location', '#location'],
  ]

  return (
    <main className="overflow-x-hidden bg-sand text-ink">
      <header className="absolute inset-x-0 top-0 z-50 border-b border-white/15">
        <div className="page-wrap flex h-20 items-center justify-between text-white">
          <a href="#" className="flex items-center gap-3" aria-label="Tuna Bay Resort home">
            <span className="grid size-11 place-items-center rounded-full border border-white/35 bg-white backdrop-blur-sm overflow-hidden"><img src="/images/tuna-bay-logo.png" alt="Tuna Bay Resort logo" className="size-full object-contain" /></span>
            <span className="font-display text-xl leading-none tracking-wide">Tuna Bay <small className="mt-1 block font-sans text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-white/70">Resort · Taurama</small></span>
          </a>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {navItems.map(([label, href]) => <a key={label} href={href} className="text-sm font-medium text-white/80 transition hover:text-white">{label}</a>)}
          </nav>
          <div className="flex items-center gap-3">
            <a href="#booking" className="hidden rounded-full bg-coral px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-coral-dark sm:inline-flex">Book Now</a>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="grid size-11 place-items-center rounded-full border border-white/30 lg:hidden" aria-expanded={mobileOpen} aria-label="Toggle navigation">
              <Icon name="menu" />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="mx-4 flex flex-col rounded-2xl bg-white p-3 text-ink shadow-2xl lg:hidden" aria-label="Mobile navigation">
            {navItems.map(([label, href]) => <a key={label} href={href} onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 font-semibold hover:bg-sand">{label}</a>)}
            <a href="#booking" onClick={() => setMobileOpen(false)} className="mt-1 rounded-xl bg-ocean px-4 py-3 text-center font-bold text-white">Book Now</a>
          </nav>
        )}
      </header>

      <section className="relative flex min-h-[92svh] items-end bg-ocean pb-16 pt-36 text-white md:items-center md:pb-8">
        <img src={heroImage} alt="Aerial view of Tuna Bay Resort and its waterfront pool" className="absolute inset-0 size-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,37,51,.94)_0%,rgba(5,37,51,.68)_48%,rgba(5,37,51,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,37,51,.65)_0%,transparent_48%)]" />
        <div className="page-wrap relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="mb-6 text-xs font-bold uppercase tracking-[0.23em] text-seafoam">
              Taurama · Port Moresby
            </div>
            <h1 className="font-display text-5xl leading-[0.98] tracking-[-0.035em] sm:text-6xl md:text-7xl lg:text-[5.5rem]">Your Coastal Escape <em className="font-normal text-seafoam">Behind the Mangroves</em> of Taurama</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">Relaxing ocean views, fresh dining, and private function spaces just minutes from central Port Moresby.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#menu" className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-coral-dark">View Menu <Icon name="arrow" /></a>
              <a href="/rooms" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">View Rooms</a>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/20 pt-6 text-sm text-white/70 md:absolute md:bottom-0 md:right-8 md:mt-0 md:w-72 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <span className="flex items-center gap-2"><Icon name="clock" className="size-4 text-seafoam" /> Open Fri–Sun</span>
            <span className="flex items-center gap-2"><Icon name="sunset" className="size-4 text-seafoam" /> Sunset from 5:30pm</span>
          </div>
        </div>
      </section>

      <section id="about" className="section-space bg-sand">
        <div className="page-wrap grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem]">
              <img src={aboutImage} alt="Aerial view of Tuna Bay’s waterfront jetty and surrounding coastline" className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]" />
            </div>
            <div className="absolute -bottom-6 right-4 max-w-52 rounded-2xl bg-ocean p-5 text-white shadow-xl sm:right-[-1.5rem]">
              <span className="font-display text-4xl text-seafoam">15 min</span>
              <p className="mt-1 text-sm leading-5 text-white/70">from central Port Moresby, a world away from the rush.</p>
            </div>
          </div>
          <div className="pt-6 lg:pt-0">
            <Eyebrow>Our little corner of the coast</Eyebrow>
            <h2 className="heading-lg mt-4">Where the city <em>slows down</em> and the tide rolls in.</h2>
            <p className="mt-6 text-lg leading-8 text-muted">Tucked behind Taurama’s mangroves, Tuna Bay Resort is a welcoming waterfront hideaway made for long lunches, salt-air afternoons and celebrations that feel a little more special.</p>
            <p className="mt-4 leading-7 text-muted">Follow the road through the greenery to our dining pier, open lawns and uninterrupted ocean views. Come with the family for a weekend escape, share a seafood feast with friends, or make the whole place yours for the day.</p>
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-ocean/10 pt-7">
              <div><strong className="block font-display text-3xl text-ocean">Waterfront</strong><span className="text-sm text-muted">open-air dining</span></div>
              <div><strong className="block font-display text-3xl text-ocean">Weekend</strong><span className="text-sm text-muted">family atmosphere</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="facilities" className="section-space bg-sand-light">
        <div className="page-wrap">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
            <div>
              <Eyebrow>Resort facilities</Eyebrow>
              <h2 className="heading-lg mt-4">Everything for an <em>easy day out.</em></h2>
              <p className="mt-6 max-w-md leading-7 text-muted">Settle in for the day with all the essentials close by, from a refreshing swim and waterfront dining to generous spaces for families and private events.</p>
              <a href="#booking" className="mt-8 inline-flex items-center gap-2 rounded-full bg-ocean px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal">Ask about our facilities <Icon name="arrow" /></a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {facilities.map((facility) => (
                <article key={facility.title} className="rounded-3xl border border-ocean/8 bg-white p-6 shadow-[0_12px_35px_rgba(8,49,64,.05)]">
                  <span className="grid size-11 place-items-center rounded-2xl bg-seafoam/30 text-teal"><Icon name={facility.icon} className="size-5" /></span>
                  <h3 className="mt-5 font-display text-xl text-ocean">{facility.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{facility.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="hire" className="section-space bg-white">
        <div className="page-wrap">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <Eyebrow>Eat · Celebrate · Unwind</Eyebrow>
              <h2 className="heading-lg mt-4 max-w-2xl">Everything you need for a <em>day by the bay.</em></h2>
            </div>
            <p className="max-w-md leading-7 text-muted">Whether you’re here for lunch or the whole afternoon, there’s always a reason to stay a little longer.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {offerings.map((item) => (
              <article key={item.title} className="group relative overflow-hidden rounded-3xl border border-ocean/10 bg-sand-light p-6 transition duration-300 hover:-translate-y-1 hover:bg-ocean hover:text-white hover:shadow-xl">
                <span className="grid size-12 place-items-center rounded-2xl bg-teal/10 text-teal group-hover:bg-white/10 group-hover:text-seafoam"><Icon name={item.icon} className="size-6" /></span>
                <h3 className="mt-8 font-display text-2xl leading-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted group-hover:text-white/65">{item.text}</p>
                <a href={item.href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal group-hover:text-seafoam">Explore <Icon name="arrow" className="size-4" /></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="section-space bg-sand">
        <div className="page-wrap">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <Eyebrow>Life at Tuna Bay</Eyebrow>
              <h2 className="heading-lg mt-4 max-w-2xl">A glimpse of your next <em>coastal escape.</em></h2>
            </div>
            <p className="max-w-md leading-7 text-muted">From easy poolside afternoons to wide-open waterfront views, every visit comes with room to breathe.</p>
          </div>
          <div className="mt-12 grid auto-rows-[16rem] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {galleryImages.map((image) => (
              <figure key={image.title} className={`group relative overflow-hidden rounded-3xl bg-ocean ${image.className}`}>
                <img src={image.src} alt={image.alt} className="size-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean/75 via-transparent to-transparent" />
                <figcaption className="absolute bottom-0 left-0 p-5 font-display text-xl text-white">{image.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="menu" className="section-space relative overflow-hidden bg-ocean text-white">
        <img src="/images/abstract-ocean-waves.png" alt="" className="absolute inset-0 size-full object-cover" aria-hidden="true" />
        <div className="absolute -left-32 top-20 size-80 rounded-full bg-seafoam/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 size-96 rounded-full bg-teal/25 blur-3xl" />
        <div className="page-wrap relative">
          <div className="text-center">
            <Eyebrow light>Taste Tuna Bay</Eyebrow>
            <h2 className="heading-lg mx-auto mt-4 max-w-3xl">Fresh from the coast, <em>made to share.</em></h2>
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
          <p className="mt-8 text-center text-xs text-white/40">Sample menu and rates. Availability and pricing may vary.</p>
        </div>
      </section>

      <section id="booking" className="section-space bg-sand">
        <div className="page-wrap grid overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(8,49,64,.1)] lg:grid-cols-[.8fr_1.2fr]">
          <div id="location" className="relative flex flex-col overflow-hidden bg-teal p-7 text-white sm:p-10 lg:p-12">
            <div className="absolute -right-24 -top-24 size-72 rounded-full border border-white/10" />
            <div className="absolute -right-12 -top-12 size-44 rounded-full border border-white/10" />
            <Eyebrow light>Come find us</Eyebrow>
            <h2 className="mt-4 font-display text-4xl leading-tight">Your Tuna Bay escape starts here.</h2>
            <div className="mt-8 space-y-5 text-sm">
              <div className="flex gap-4"><Icon name="location" className="mt-0.5 size-5 shrink-0 text-seafoam" /><div><strong className="block">Tuna Bay Resort</strong><span className="text-white/65">Taurama, Port Moresby, PNG</span></div></div>
              <div className="flex gap-4"><Icon name="phone" className="mt-0.5 size-5 shrink-0 text-seafoam" /><div><strong className="block">Call or WhatsApp</strong><span className="text-white/65">+675 7000 0000</span></div></div>
              <div className="flex gap-4"><Icon name="clock" className="mt-0.5 size-5 shrink-0 text-seafoam" /><div><strong className="block">Opening hours</strong><span className="text-white/65">Friday–Sunday · 10am–9pm</span></div></div>
            </div>
            <a href="https://maps.google.com/?q=Taurama+Port+Moresby+Papua+New+Guinea" target="_blank" rel="noreferrer" className="mt-9 block overflow-hidden rounded-2xl border border-white/15 bg-ocean/30 lg:flex-1">
              <div className="map-pattern relative h-44 lg:h-full lg:min-h-64">
                <span className="absolute left-[58%] top-[42%] grid size-11 place-items-center rounded-full bg-coral text-white shadow-xl"><Icon name="location" /></span>
                <span className="absolute bottom-3 left-3 rounded-lg bg-white px-3 py-2 text-xs font-bold text-ocean">Open in Maps <Icon name="chevron" className="ml-1 inline size-3" /></span>
              </div>
            </a>
          </div>
          <div className="p-7 sm:p-10 lg:p-12">
            <Eyebrow>Reservations & enquiries</Eyebrow>
            <h2 className="mt-3 font-display text-4xl text-ocean">Plan your visit.</h2>
            <p className="mt-3 text-sm leading-6 text-muted">Check dates, choose a room or send an enquiry — our team confirms every booking personally.</p>
            <div className="mt-8">
              <BookingForm />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#052633] py-10 text-white">
        <div className="page-wrap">
          <div className="flex flex-col gap-8 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
            <a href="#" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-seafoam text-ocean"><Icon name="wave" /></span><span className="font-display text-xl">Tuna Bay Resort</span></a>
            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">{navItems.map(([label, href]) => <a key={label} href={href} className="hover:text-white">{label}</a>)}</nav>
            <div className="flex gap-2">
              <a href="#" aria-label="Facebook" className="grid size-10 place-items-center rounded-full border border-white/15 text-white/70 hover:bg-white/10 hover:text-white"><Icon name="facebook" className="size-4" /></a>
              <a href="#" aria-label="Instagram" className="grid size-10 place-items-center rounded-full border border-white/15 text-white/70 hover:bg-white/10 hover:text-white"><Icon name="instagram" className="size-4" /></a>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-6 text-xs text-white/40 sm:flex-row sm:justify-between"><span>© {new Date().getFullYear()} Tuna Bay Resort. All rights reserved.</span><span>Taurama · Port Moresby · Papua New Guinea</span></div>
        </div>
      </footer>
    </main>
  )
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? 'text-seafoam' : 'text-teal'}`}>{children}</div>
}
