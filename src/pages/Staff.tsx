import { Header, Footer } from '../components/Layout'

export default function StaffDashboard() {
  return (
    <main className="min-h-screen bg-sand text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap">
          <h1 className="heading-lg">Staff <em>Dashboard</em></h1>
          <p className="mt-4 text-muted">Staff tools and daily operations.</p>
        </div>
      </section>
      <Footer />
    </main>
  )
}
