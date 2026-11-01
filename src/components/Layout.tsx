import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { ReactNode } from 'react'

const navItems = [
  ['Home', '/'],
  ['About', '/about'],
  ['Facilities', '/facilities'],
  ['Menu', '/menu'],
  ['Gallery', '/gallery'],
  ['Rooms', '/rooms'],
  ['Booking', '/booking'],
  ['Location', '/location'],
]

export function Header({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <header className={`border-b ${variant === 'dark' ? 'border-white/15 bg-ocean/90 backdrop-blur-sm' : 'border-ocean/10 bg-white'}`}>
      <div className="page-wrap flex h-16 sm:h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3" aria-label="Tuna Bay Resort home">
          <span className={`grid size-9 sm:size-11 place-items-center rounded-full ${variant === 'dark' ? 'border border-white/35 bg-white/10' : 'bg-seafoam'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke={variant === 'dark' ? 'white' : '#052633'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 sm:size-6" aria-hidden="true">
              <path d="M2 8c3-3 5 3 8 0s5 3 8 0 4 0 4 0M2 14c3-3 5 3 8 0s5 3 8 0 4 0 4 0M4 20c2-2 4 2 6 0s4 2 6 0 4 0 4 0" />
            </svg>
          </span>
          <span className={`font-display text-lg sm:text-xl leading-none tracking-wide ${variant === 'dark' ? 'text-white' : 'text-ocean'}`}>
            Tuna Bay 
            <small className={`mt-1 block font-sans text-[0.5rem] sm:text-[0.6rem] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.28em] ${variant === 'dark' ? 'text-white/70' : 'text-teal'}`}>
              Resort · Taurama
            </small>
          </span>
        </Link>
        <nav className="hidden items-center gap-4 xl:gap-6 lg:flex" aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <Link key={label} to={href} className={`text-xs xl:text-sm font-medium transition ${variant === 'dark' ? 'text-white/80 hover:text-white' : 'text-ocean/80 hover:text-ocean'}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/booking" className={`hidden rounded-full px-4 xl:px-6 py-2 xl:py-3 text-xs xl:text-sm font-bold transition hover:-translate-y-0.5 sm:inline-flex ${variant === 'dark' ? 'bg-coral text-white shadow-lg shadow-black/10 hover:bg-coral-dark' : 'bg-coral text-white hover:bg-coral-dark'}`}>
            Book Now
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className={`grid size-9 sm:size-10 place-items-center rounded-full border lg:hidden ${variant === 'dark' ? 'border-white/30 text-white' : 'border-ocean/20 text-ocean'}`} aria-expanded={mobileOpen} aria-label="Toggle navigation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
              {mobileOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
            </svg>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className={`mx-4 mb-4 flex flex-col rounded-2xl p-3 shadow-2xl lg:hidden ${variant === 'dark' ? 'bg-white text-ink' : 'bg-white text-ink'}`} aria-label="Mobile navigation">
          {navItems.map(([label, href]) => (
            <Link key={label} to={href} onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-3 font-semibold hover:bg-sand">{label}</Link>
          ))}
          <Link to="/booking" onClick={() => setMobileOpen(false)} className="mt-1 rounded-xl bg-ocean px-4 py-3 text-center font-bold text-white">Book Now</Link>
        </nav>
      )}
    </header>
  )
}

export function Footer() {
  const navItems = [
    ['Home', '/'],
    ['About', '/about'],
    ['Facilities', '/facilities'],
    ['Menu', '/menu'],
    ['Gallery', '/gallery'],
    ['Rooms', '/rooms'],
    ['Booking', '/booking'],
    ['Location', '/location'],
  ]
  return (
    <footer className="bg-[#052633] text-white">
      <div className="page-wrap py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-seafoam text-ocean">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
                  <path d="M2 8c3-3 5 3 8 0s5 3 8 0 4 0 4 0M2 14c3-3 5 3 8 0s5 3 8 0 4 0 4 0M4 20c2-2 4 2 6 0s4 2 6 0 4 0 4 0" />
                </svg>
              </span>
              <span className="font-display text-xl">Tuna Bay Resort</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">
              A welcoming waterfront hideaway in Taurama, Port Moresby. Long lunches, salt-air afternoons and celebrations by the bay.
            </p>
            <div className="mt-5 flex gap-2">
              <a href="#" aria-label="Facebook" className="grid size-9 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.7.3-1 1-1Z" /></svg>
              </a>
              <a href="#" aria-label="Instagram" className="grid size-9 place-items-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-display text-lg text-seafoam">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/65">
              {navItems.slice(0, 4).map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="transition hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg text-seafoam">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/65">
              {navItems.slice(4).map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="transition hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg text-seafoam">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 size-4 shrink-0 text-seafoam"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                <span>Taurama, Port Moresby, PNG</span>
              </li>
              <li className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 size-4 shrink-0 text-seafoam"><path d="M5.5 3h3l1.5 5-2 1.5a15 15 0 0 0 6.5 6.5l1.5-2 5 1.5v3c0 1.4-1.1 2.5-2.5 2.5C10 21 3 14 3 5.5 3 4.1 4.1 3 5.5 3Z" /></svg>
                <span>+675 7000 0000</span>
              </li>
              <li className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 size-4 shrink-0 text-seafoam"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                <span>Fri–Sun · 10am–9pm</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:justify-center">
          <span>© {new Date().getFullYear()} Tuna Bay Resort. All rights reserved.</span>
          <span className="hidden sm:inline">·</span>
          <span>Taurama · Port Moresby · Papua New Guinea</span>
        </div>
      </div>
    </footer>
  )
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? 'text-seafoam' : 'text-teal'}`}>{children}</div>
}
