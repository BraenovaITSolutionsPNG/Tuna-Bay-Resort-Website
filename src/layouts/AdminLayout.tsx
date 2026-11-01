import { Link, Outlet, useLocation } from 'react-router-dom'

const adminNav = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Bookings', path: '/admin?tab=bookings' },
  { label: 'Rooms', path: '/admin?tab=rooms' },
  { label: 'Facilities', path: '/admin?tab=facilities' },
  { label: 'Menu', path: '/admin?tab=menu' },
]

export default function AdminLayout() {
  const location = useLocation()
  const current = location.pathname + location.search
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-screen bg-slate-100 text-ink flex">
      <aside className="hidden md:flex w-64 flex-col bg-[#052633] text-white">
        <div className="p-6 border-b border-white/10">
          <span className="font-display text-xl">Tuna Bay</span>
          <small className="block text-xs text-white/60 mt-1">Admin Panel</small>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`block rounded-lg px-4 py-2 text-sm font-medium transition ${current === item.path ? 'bg-coral text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={logout} className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-[#052633] text-white p-4 flex items-center justify-between">
          <span className="font-display text-lg">Admin Panel</span>
          <button onClick={logout} className="text-sm text-white/70">Logout</button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
