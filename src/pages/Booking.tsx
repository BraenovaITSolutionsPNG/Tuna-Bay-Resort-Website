import { Header, Footer, Eyebrow } from '../components/Layout'
import BookingForm from '../components/BookingForm'

const assurances = ['Instant request', 'No payment today', 'Personal confirmation']

export default function Booking() {
  return (
    <main className="overflow-x-hidden bg-sand text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap max-w-4xl">
          <div className="text-center mb-10 sm:mb-12">
            <Eyebrow>Reservations & enquiries</Eyebrow>
            <h1 className="heading-lg mt-4">Plan your <em>visit</em></h1>
            <p className="mt-6 max-w-2xl mx-auto leading-7 text-muted">
              Check availability, choose your dates and send a reservation request. Our team confirms every booking personally.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-bold text-teal">
              {assurances.map((item) => (
                <span key={item} className="rounded-full bg-seafoam/25 px-3 py-1.5">{item}</span>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(8,49,64,.1)] p-6 sm:p-10 lg:p-12">
            <BookingForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
