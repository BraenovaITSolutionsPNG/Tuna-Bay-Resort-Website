import { Link } from 'react-router-dom'
import { Header, Footer, Eyebrow } from '../components/Layout'

const heroImage = '/images/tuna-bay-hero.jpg'

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
      <Footer />
    </main>
  )
}
