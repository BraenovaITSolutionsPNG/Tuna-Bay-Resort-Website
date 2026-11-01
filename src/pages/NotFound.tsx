import { Link } from 'react-router-dom'
import { Header, Footer } from '../components/Layout'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-sand text-ink flex flex-col">
      <Header variant="light" />
      <section className="flex-1 flex items-center justify-center section-space">
        <div className="text-center">
          <h1 className="font-display text-8xl text-ocean">404</h1>
          <p className="mt-4 text-lg text-muted">Page not found.</p>
          <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-ocean px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal">
            Go Home
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
