import { FormEvent, useState } from 'react'
import { Header, Footer, Eyebrow } from '../components/Layout'

function Field({ label, ...props }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <input {...props} className="field-input" />
    </label>
  )
}

export default function Booking() {
  const [submitted, setSubmitted] = useState(false)
  const [bookingType, setBookingType] = useState('')

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setBookingType('')
    event.currentTarget.reset()
  }

  return (
    <main className="overflow-x-hidden bg-sand text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap max-w-4xl">
          <div className="text-center mb-12">
            <Eyebrow>Reservations & enquiries</Eyebrow>
            <h1 className="heading-lg mt-4">Plan your <em>visit</em></h1>
            <p className="mt-6 max-w-2xl mx-auto leading-7 text-muted">Tell us what you have in mind and our team will get back to confirm your booking.</p>
          </div>
          <div className="rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(8,49,64,.1)] p-7 sm:p-10 lg:p-12">
            {submitted ? (
              <div className="rounded-2xl border border-teal/20 bg-teal/8 p-6 text-center">
                <strong className="font-display text-2xl text-teal">Thank you. We’ve received your enquiry.</strong>
                <p className="mt-2 text-sm text-muted">Our team will be in touch shortly to confirm the details.</p>
                <button onClick={() => setSubmitted(false)} className="mt-5 text-sm font-bold text-teal underline underline-offset-4">Send another enquiry</button>
              </div>
            ) : (
              <form onSubmit={submitForm} className="grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="field-label">What would you like to book?</span>
                  <select name="bookingType" value={bookingType} onChange={(event) => setBookingType(event.target.value)} className="field-input" required>
                    <option value="" disabled>Select a booking type</option>
                    <option value="room">Room stay</option>
                    <option value="table">Restaurant table</option>
                    <option value="function">Private function or event</option>
                    <option value="day-pass">Family day pass</option>
                    <option value="general">General enquiry</option>
                  </select>
                </label>
                <Field label="Your name" name="name" placeholder="Full name" required />
                <Field label="Phone number" name="phone" placeholder="+675" type="tel" required />
                <Field label={bookingType === 'room' ? 'Check-in date' : 'Date of visit'} name="date" type="date" required />
                {bookingType === 'room' ? (
                  <>
                    <Field label="Check-out date" name="checkout" type="date" required />
                    <Field label="Number of guests" name="party" placeholder="e.g. 2 guests" required />
                    <label>
                      <span className="field-label">Select Room</span>
                      <select name="room" className="field-input" required>
                        <option value="" disabled selected>Select a room</option>
                        <option value="standard">Standard Room</option>
                        <option value="deluxe">Deluxe Room</option>
                        <option value="ocean-view">Ocean View Suite</option>
                        <option value="family">Family Room</option>
                        <option value="beachfront">Beachfront Villa</option>
                      </select>
                    </label>
                    <label>
                      <span className="field-label">Number of rooms</span>
                      <select name="rooms" className="field-input" required>
                        <option value="1">1 Room</option>
                        <option value="2">2 Rooms</option>
                        <option value="3">3 Rooms</option>
                        <option value="4">4 Rooms</option>
                      </select>
                    </label>
                  </>
                ) : (
                  <Field label="Party size" name="party" placeholder="e.g. 8 guests" required />
                )}
                <label className="sm:col-span-2"><span className="field-label">Message</span><textarea name="message" rows={4} placeholder={bookingType === 'room' ? 'Room preferences, children travelling or anything we should know...' : 'Booking details or anything we should know...'} className="field-input resize-none" /></label>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-coral-dark sm:col-span-2 sm:w-fit">Send enquiry <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg></button>
              </form>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
