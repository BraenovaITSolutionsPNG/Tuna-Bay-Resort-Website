import { Link } from 'react-router-dom'

const navItems = [
  ['Home', '/'],
  ['About', '/about'],
  ['Facilities', '/facilities'],
  ['Menu', '/menu'],
  ['Gallery', '/gallery'],
  ['Rooms', '/rooms'],
  ['360° Tour', '/tour'],
  ['Booking', '/booking'],
  ['Location', '/location'],
]

export function Header({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  return (
    <header className={`border-b ${variant === 'dark' ? 'border-white/15 bg-ocean/90 backdrop-blur-sm' : 'border-ocean/10 bg-white'}`}>
      <div className="page-wrap flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="Tuna Bay Resort home">
          <span className={`grid size-11 place-items-center rounded-full ${variant === 'dark' ? 'border border-white/35 bg-white/10' : 'bg-seafoam'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke={variant === 'dark' ? 'white' : '#052633'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
              <path d="M2 8c3-3 5 3 8 0s5 3 8 0 4 0 4 0M2 14c3-3 5 3 8 0s5 3 8 0 4 0 4 0M4 20c2-2 4 2 6 0s4 2 6 0 4 0 4 0" />
            </svg>
          </span>
          <span className={`font-display text-xl leading-none tracking-wide ${variant === 'dark' ? 'text-white' : 'text-ocean'}`}>
            Tuna Bay 
            <small className={`mt-1 block font-sans text-[0.6rem] font-semibold uppercase tracking-[0.28em] ${variant === 'dark' ? 'text-white/70' : 'text-teal'}`}>
              Resort · Taurama
            </small>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <Link key={label} to={href} className={`text-sm font-medium transition ${variant === 'dark' ? 'text-white/80 hover:text-white' : 'text-ocean/80 hover:text-ocean'}`}>
              {label}
            </Link>
          ))}
        </nav>
        <Link to="/booking" className={`hidden rounded-full px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5 sm:inline-flex ${variant === 'dark' ? 'bg-coral text-white shadow-lg shadow-black/10 hover:bg-coral-dark' : 'bg-coral text-white hover:bg-coral-dark'}`}>
          Book Now
        </Link>
      </div>
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
    ['360° Tour', '/tour'],
    ['Booking', '/booking'],
    ['Location', '/location'],
  ]
  return (
    <footer className="bg-[#052633] py-10 text-white">
      <div className="page-wrap">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-seafoam text-ocean">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
                <path d="M2 8c3-3 5 3 8 0s5 3 8 0 4 0 4 0M2 14c3-3 5 3 8 0s5 3 8 0 4 0 4 0M4 20c2-2 4 2 6 0s4 2 6 0 4 0 4 0" />
              </svg>
            </span>
            <span className="font-display text-xl">Tuna Bay Resort</span>
          </Link>
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
            {navItems.map(([label, href]) => (
              <Link key={label} to={href} className="hover:text-white">{label}</Link>
            ))}
          </nav>
          <div className="flex gap-2">
            <a href="#" aria-label="Facebook" className="grid size-10 place-items-center rounded-full border border-white/15 text-white/70 hover:bg-white/10 hover:text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.7.3-1 1-1Z" /></svg>
            </a>
            <a href="#" aria-label="Instagram" className="grid size-10 place-items-center rounded-full border border-white/15 text-white/70 hover:bg-white/10 hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></svg>
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-xs text-white/40 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Tuna Bay Resort. All rights reserved.</span>
          <span>Taurama · Port Moresby · Papua New Guinea</span>
        </div>
      </div>
    </footer>
  )
}

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <div className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? 'text-seafoam' : 'text-teal'}`}>{children}</div>
}
