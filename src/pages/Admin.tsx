import { Header, Footer } from '../components/Layout'

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-sand text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap">
          <h1 className="heading-lg">Admin <em>Dashboard</em></h1>
          <p className="mt-4 text-muted">Manage bookings, rooms, and resort settings.</p>
        </div>
      </section>
      <Footer />
    </main>
  )
}
