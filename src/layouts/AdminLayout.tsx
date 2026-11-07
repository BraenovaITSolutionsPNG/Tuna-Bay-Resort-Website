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

  if (ok !== true) return <div className="grid min-h-screen place-items-center bg-sand-light text-sm text-muted">Checking admin session…</div>

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full bg-white text-gray-900">
        <nav className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${open ? 'w-64' : 'w-16'} border-gray-200 bg-white p-2 shadow-sm`}>
          <div className="mb-6 border-b border-gray-200 pb-4">
            <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                  <svg width="20" height="auto" viewBox="0 0 50 39" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-white"><path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" /><path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z" /></svg>
                </div>
                {open && (<div><span className="block text-sm font-semibold text-gray-900">Tuna Bay</span><span className="block text-xs text-gray-500">Admin Panel</span></div>)}
              </div>
              {open && <ChevronDown className="h-4 w-4 text-gray-400" />}
            </div>
          </div>
          <div className="mb-8 space-y-1">
            {adminNav.map(item => {
              const isSelected = location.pathname === item.path
              return (
                <Link key={item.path} to={item.path} className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${isSelected ? 'border-l-2 border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <div className="grid h-full w-12 place-content-center"><item.Icon className="h-4 w-4" /></div>
                  {open && <span className="text-sm font-medium">{item.title}</span>}
                </Link>
              )
            })}
          </div>
          {open && (
            <div className="space-y-1 border-t border-gray-200 pt-4">
              <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">Account</div>
              <button onClick={logout} className="relative flex h-11 w-full items-center rounded-md text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900">
                <div className="grid h-full w-12 place-content-center"><User className="h-4 w-4" /></div>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
          <button onClick={() => setOpen(!open)} className="absolute bottom-0 left-0 right-0 border-t border-gray-200 transition-colors hover:bg-gray-50">
            <div className="flex items-center p-3">
              <div className="grid size-10 place-content-center"><ChevronsRight className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} /></div>
              {open && <span className="text-sm font-medium text-gray-600">Hide</span>}
            </div>
          </button>
        </nav>
        <div className="flex-1 overflow-auto bg-white p-6"><Outlet /></div>
      </div>
    </div>
  )
}
