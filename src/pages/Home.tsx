import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header, Footer, Eyebrow } from '../components/Layout'
import ReviewForm from '../components/ReviewForm'
import BookingForm from '../components/BookingForm'
import EnquiryForm from '../components/EnquiryForm'
import BlueTunaScene from '../components/BlueTunaScene'

const heroImage = '/images/tuna-bay-hero.jpg'
const aboutImage = '/images/tuna-bay-waterfront.png'

interface Testimonial {
  id: number
  name: string
  text: string
  rating: number
}

const offerings = [
  { title: 'Coastal Dining & Bar', text: 'Fresh seafood, flame-grilled favourites and ice-cold drinks served right by the water.', href: '/menu' },
  { title: 'Private Venue Hire', text: 'Flexible spaces for birthdays, celebrations, team events and intimate functions.', href: '#booking' },
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [barType, setBarType] = useState('room')
  const [barDate, setBarDate] = useState('')
  const [barParty, setBarParty] = useState('2')
  const [modalType, setModalType] = useState('')
  const [modalDate, setModalDate] = useState('')
  const [modalParty, setModalParty] = useState('2')

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.ok ? r.json() : [])
      .then(d => setTestimonials(Array.isArray(d) ? d : []))
      .catch(() => setTestimonials([]))
  }, [])

  return (
    <main className="relative overflow-x-hidden bg-[#052633] text-white">
      <BlueTunaScene />
      <Header variant="dark" />
      <div className="relative z-10">
      <section id="tuna-hero" className="relative min-h-[100svh] text-white overflow-hidden">
        {/* Coral (upper hero) — tuna swims over to "eat" here */}
        <div className="pointer-events-none absolute right-[3%] top-[4%] z-[6] w-[220px] opacity-95 sm:right-[6%] sm:top-[5%] sm:w-[320px] lg:w-[380px]">
          <svg viewBox="0 0 360 240" className="h-auto w-full drop-shadow-[0_18px_40px_rgba(0,40,60,.35)]" aria-hidden="true">
            <defs>
              <linearGradient id="coralA" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#cf5b40"/><stop offset="1" stopColor="#ff9b73"/></linearGradient>
              <linearGradient id="coralB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#0c766d"/><stop offset="1" stopColor="#8ed8c7"/></linearGradient>
              <linearGradient id="coralC" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#b85c7a"/><stop offset="1" stopColor="#f2a7c3"/></linearGradient>
            </defs>
            <g opacity="0.98">
              <ellipse cx="180" cy="214" rx="150" ry="18" fill="#052633" opacity="0.35"/>
              <path d="M150 210c-8-38 2-72 18-104 10 30 10 62 6 104z" fill="url(#coralA)"/>
              <path d="M168 210c-4-52 18-90 44-132 0 46-6 88-20 132z" fill="url(#coralC)"/>
              <path d="M190 210c6-44 24-76 54-108-6 40-20 74-30 108z" fill="url(#coralA)"/>
              <path d="M120 210c-2-30 10-52 26-74 2 26-2 48-8 74z" fill="url(#coralB)"/>
              <path d="M228 210c4-34 20-58 40-82-2 30-10 56-18 82z" fill="url(#coralB)"/>
              <path d="M92 210c2-22 12-40 24-56 0 20-6 38-10 56z" fill="url(#coralC)" opacity="0.9"/>
              <path d="M262 210c0-20 10-38 22-54-2 20-6 38-10 54z" fill="url(#coralA)" opacity="0.9"/>
              <g fill="#ffffff" opacity="0.55">
                <circle cx="156" cy="156" r="3"/><circle cx="190" cy="138" r="3"/><circle cx="214" cy="160" r="3"/><circle cx="132" cy="176" r="2.5"/><circle cx="244" cy="176" r="2.5"/>
              </g>
            </g>
          </svg>
        </div>
        <div className="relative z-10 flex flex-col justify-end sm:justify-center min-h-[100svh] page-wrap pb-10 sm:pb-8 pt-24 sm:pt-36">
          <div className="max-w-3xl">
            <div className="mb-3 sm:mb-6">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-seafoam">
                Taurama · Port Moresby
              </span>
            </div>
            <h1 className="font-display text-[2.5rem] leading-[1.05] tracking-[-0.02em] sm:text-5xl sm:leading-[0.98] sm:tracking-[-0.035em] md:text-7xl lg:text-[5.5rem]">
              Your Coastal <em className="font-normal text-seafoam">Escape</em>
              <br />
              <span className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white/90 font-display">Behind the Mangroves</span>
            </h1>
            <p className="mt-4 sm:mt-6 max-w-md sm:max-w-2xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7 md:text-lg">
              Relaxing ocean views, fresh dining, and private function spaces just minutes from central Port Moresby.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/menu" className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-6 sm:px-7 py-3 sm:py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-coral-dark w-full sm:w-auto">
                View Menu 
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
              </Link>
              <Link to="/rooms" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 sm:px-7 py-3 sm:py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 w-full sm:w-auto">
                View Rooms
              </Link>
            </div>
            <div className="mt-8 sm:mt-12 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 border-t border-white/20 pt-5 text-xs sm:text-sm text-white/70">
              <span className="flex items-center gap-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4 text-seafoam"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg> Open Fri–Sun</span>
              <span className="flex items-center gap-2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4 text-seafoam"><path d="M3 18h18M5 14h14M8 14a4 4 0 0 1 8 0M12 3v3" /></svg> Sunset from 5:30pm</span>
            </div>
          </div>
          <div id="booking" className="mt-8 flex flex-col gap-4">
            <span className="text-sm font-bold uppercase tracking-wide text-white/90">Room booking</span>
            <div className="flex flex-col gap-3 rounded-2xl bg-white/95 p-4 shadow-xl md:flex-row md:items-end">
              <label className="flex-1">
                <span className="field-label">Check-in</span>
                <input type="date" value={barDate} onChange={(e) => setBarDate(e.target.value)} className="field-input" />
              </label>
              <label className="w-full md:w-32">
                <span className="field-label">Guests</span>
                <input type="number" min={1} value={barParty} onChange={(e) => setBarParty(e.target.value)} className="field-input" />
              </label>
              <button onClick={() => { setModalType('room'); setModalDate(barDate); setModalParty(barParty); setBookingOpen(true) }} className="rounded-xl bg-coral px-6 py-3 text-sm font-bold text-white transition hover:bg-coral-dark">
                Book room
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['table', 'Restaurant table'],
                ['function', 'Private function'],
                ['day-pass', 'Family day pass'],
                ['general', 'General enquiry'],
              ].map(([value, label]) => (
                <button key={value} onClick={() => { setModalType(value); setModalDate(''); setModalParty('2'); setBookingOpen(true) }} className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="tuna-about" className="section-space relative z-10">
        <div className="page-wrap grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm">
              <img src={aboutImage} alt="Aerial view of Tuna Bay’s waterfront jetty and surrounding coastline" className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5] opacity-90" />
            </div>
          </div>
          <div>
            <Eyebrow light>Our little corner of the coast</Eyebrow>
            <h2 className="heading-lg mt-4 text-white">Where the city <em>slows down</em> and the tide rolls in.</h2>
            <p className="mt-6 text-lg leading-8 text-white/72">Tucked behind Taurama’s mangroves, Tuna Bay Resort is a welcoming waterfront hideaway made for long lunches, salt-air afternoons and celebrations that feel a little more special.</p>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 rounded-full bg-coral px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-coral-dark">
              Learn More
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
            </Link>
          </div>
        </div>
      </section>

      <section id="tuna-features" className="section-space relative z-10">
        <div className="page-wrap">
          <div className="mb-12">
            <Eyebrow light>Eat · Celebrate · Unwind</Eyebrow>
            <h2 className="heading-lg mt-4 text-white">Everything you need for a <em>day by the bay.</em></h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {offerings.map((item) => (
              <article key={item.title} className="group relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.07] p-6 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/[0.12] hover:shadow-xl">
                <h3 className="mt-2 font-display text-2xl leading-tight text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/68">{item.text}</p>
                <Link to={item.href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-seafoam">
                  Explore 
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tuna-experience" className="section-space relative z-10">
        <div className="page-wrap">
          <div className="mb-12">
            <Eyebrow light>Resort facilities</Eyebrow>
            <h2 className="heading-lg mt-4 text-white">Relax, swim & <em>celebrate</em></h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {facilities.map((facility) => (
              <article key={facility.title} className="rounded-3xl border border-white/12 bg-white/[0.07] p-6 backdrop-blur-md shadow-[0_12px_35px_rgba(0,0,0,.18)]">
                <h3 className="font-display text-xl text-white">{facility.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/68">{facility.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/facilities" className="inline-flex items-center gap-2 rounded-full bg-coral px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-coral-dark">
              View All Facilities
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-space relative z-10">
        <div className="page-wrap">
          <div className="text-center mb-12">
            <Eyebrow light>Guest Reviews</Eyebrow>
            <h2 className="heading-lg mt-4 text-white">What our guests <em>say</em></h2>
          </div>
          <div className="overflow-hidden">
            <div className="marquee-track gap-6">
              {[...testimonials, ...testimonials].map((t, i) => (
                <div key={i} className="w-80 shrink-0 rounded-3xl border border-white/12 bg-white/[0.07] p-6 backdrop-blur-md shadow-[0_12px_35px_rgba(0,0,0,.18)]">
                  <div className="text-yellow-400">{'★'.repeat(t.rating)}</div>
                  <p className="mt-3 text-sm leading-6 text-white/72 italic">"{t.text}"</p>
                  <p className="mt-4 font-display text-white">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 max-w-xl mx-auto">
            <h3 className="font-display text-xl text-white text-center mb-4">Leave a review</h3>
            {!showReviewForm ? (
              <div className="text-center">
                <button onClick={() => setShowReviewForm(true)} className="rounded-full bg-coral px-6 py-3 text-sm font-bold text-white hover:bg-coral-dark transition">Write a Review</button>
              </div>
            ) : (
              <ReviewForm onSubmitted={() => { setShowReviewForm(false); fetch('/api/testimonials').then(r => r.ok ? r.json() : []).then(d => setTestimonials(Array.isArray(d) ? d : [])).catch(() => {}) }} onClose={() => setShowReviewForm(false)} />
            )}
          </div>
        </div>
      </section>

      {bookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl text-ocean">Plan your visit</h2>
              <button onClick={() => setBookingOpen(false)} className="rounded-full p-2 text-muted hover:bg-sand">✕</button>
            </div>
            <BookingForm initialType={modalType} initialDate={modalDate} initialParty={modalParty} />
          </div>
        </div>
      )}

      <section id="tuna-end" className="section-space relative z-10">
        <div className="page-wrap">
          <div className="text-center mb-12">
            <Eyebrow light>Come find us</Eyebrow>
            <h2 className="heading-lg mt-4 text-white">Location & <em>Contact</em></h2>
            <p className="mt-6 max-w-2xl mx-auto leading-7 text-white/72">Your Tuna Bay escape starts here in Taurama, Port Moresby.</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-[2rem] border border-white/12 bg-white/[0.07] p-7 text-white backdrop-blur-md sm:p-10">
              <h3 className="font-display text-2xl">Get in touch</h3>
              <div className="mt-6 space-y-4 text-sm">
                <div><strong className="block text-seafoam">Address</strong><span className="text-white/80">Tuna Bay Resort, Taurama, Port Moresby, PNG</span></div>
                <div><strong className="block text-seafoam">Phone / WhatsApp</strong><span className="text-white/80">+675 7000 0000</span></div>
                <div><strong className="block text-seafoam">Opening hours</strong><span className="text-white/80">Friday–Sunday · 10am–9pm</span></div>
              </div>
              <div className="mt-8">
                <h4 className="font-display text-xl mb-3">General enquiry</h4>
                <EnquiryForm />
              </div>
            </div>
            <div className="rounded-[2rem] overflow-hidden border border-white/12 shadow-xl h-full min-h-[400px]">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31528!2d147.180!3d-9.443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMjYnMzUiUyAxNDfCsDEwJzQ4IkU!5e0!3m2!1sen!2spg!4v1234567890" width="100%" height="100%" style={{ border: 0, minHeight: '400px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Tuna Bay Resort Location" className="h-full w-full" />
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
      </div>
    </main>
  )
}
