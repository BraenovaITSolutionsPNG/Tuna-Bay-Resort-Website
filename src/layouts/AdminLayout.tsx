import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Monitor, Tag, Users, ChevronDown, ChevronsRight, Settings, User, Calendar, Bed, UtensilsCrossed, Image as ImageIcon } from 'lucide-react'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/admin/login', { replace: true }); return }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error('unauth'); return r.json() })
      .then(() => setOk(true))
      .catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/admin/login', { replace: true }) })
  }, [navigate])

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/admin/login') }

  const adminNav = [
    { Icon: Home, title: 'Dashboard', path: '/admin' },
    { Icon: Calendar, title: 'Bookings', path: '/admin/bookings' },
    { Icon: Bed, title: 'Rooms', path: '/admin/rooms' },
    { Icon: Tag, title: 'Facilities', path: '/admin/facilities' },
    { Icon: UtensilsCrossed, title: 'Menu', path: '/admin/menu' },
    { Icon: ImageIcon, title: 'Gallery', path: '/admin/gallery' },
    { Icon: Users, title: 'Testimonials', path: '/admin/testimonials' },
    { Icon: User, title: 'Users', path: '/admin/users' },
    { Icon: Settings, title: 'Settings', path: '/admin/settings' },
    { Icon: Monitor, title: 'View Site', path: '/' },
  ]

  if (ok !== true) return <div className="admin-glass-bg grid min-h-screen place-items-center text-sm text-white/80">Checking admin session…</div>

  return (
    <div className="admin-glass-bg flex min-h-screen w-full text-white">
      <nav className={`glass-sidebar sticky top-0 h-screen shrink-0 transition-all duration-300 ease-in-out ${open ? 'w-64' : 'w-[4.5rem]'} p-2`}>
        <div className="mb-5 border-b border-white/15 pb-4">
          <div className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-white/10">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-content-center rounded-xl bg-gradient-to-br from-seafoam/80 to-teal/80 shadow-lg shadow-black/10 ring-1 ring-white/30">
                <svg width="18" height="auto" viewBox="0 0 50 39" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-white"><path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" /><path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z" /></svg>
              </div>
              {open && (<div><span className="block text-sm font-semibold text-white">Tuna Bay</span><span className="block text-xs text-white/60">Admin Panel</span></div>)}
            </div>
            {open && <ChevronDown className="h-4 w-4 text-white/50" />}
          </div>
        </div>
        <div className="mb-6 space-y-1">
          {adminNav.map(item => {
            const isSelected = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} className={`relative flex h-11 w-full items-center rounded-xl transition-all duration-200 ${isSelected ? 'glass-nav-item-active' : 'glass-nav-item'}`} title={!open ? item.title : undefined}>
                <div className="grid h-full w-12 shrink-0 place-content-center"><item.Icon className="h-4 w-4" /></div>
                {open && <span className="pr-3 text-sm font-medium">{item.title}</span>}
              </Link>
            )
          })}
        </div>
        {open && (
          <div className="space-y-1 border-t border-white/15 pt-4">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Account</div>
            <button onClick={logout} className="glass-nav-item relative flex h-11 w-full items-center rounded-xl transition-all duration-200">
              <div className="grid h-full w-12 shrink-0 place-content-center"><User className="h-4 w-4" /></div>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
        <button onClick={() => setOpen(!open)} className="absolute bottom-0 left-0 right-0 border-t border-white/15 transition-colors hover:bg-white/10">
          <div className="flex items-center p-3">
            <div className="grid size-10 place-content-center"><ChevronsRight className={`h-4 w-4 text-white/60 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} /></div>
            {open && <span className="text-sm font-medium text-white/70">Hide</span>}
          </div>
        </button>
      </nav>
      <div className="relative min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" style={{ background: 'radial-gradient(60% 40% at 70% 0%, rgba(255,255,255,.10), rgba(255,255,255,0))' }} />
        <div className="relative"><Outlet /></div>
      </div>
    </div>
  )
}
