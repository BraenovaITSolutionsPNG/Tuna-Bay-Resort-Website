import { Header, Footer, Eyebrow } from '../components/Layout'

export default function Location() {
  return (
    <main className="overflow-x-hidden bg-sand text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap">
          <div className="text-center mb-12">
            <Eyebrow>Come find us</Eyebrow>
            <h1 className="heading-lg mt-4">Location & <em>Contact</em></h1>
            <p className="mt-6 max-w-2xl mx-auto leading-7 text-muted">Your Tuna Bay escape starts here in Taurama, Port Moresby.</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-[2rem] bg-teal p-7 text-white sm:p-10">
              <h2 className="font-display text-3xl">Get in touch</h2>
              <div className="mt-8 space-y-5 text-sm">
                <div>
                  <strong className="block text-seafoam">Address</strong>
                  <span className="text-white/80">Tuna Bay Resort<br />Taurama, Port Moresby<br />Papua New Guinea</span>
                </div>
                <div>
                  <strong className="block text-seafoam">Phone / WhatsApp</strong>
                  <span className="text-white/80">+675 7000 0000</span>
                </div>
                <div>
                  <strong className="block text-seafoam">Opening hours</strong>
                  <span className="text-white/80">Friday–Sunday · 10am–9pm</span>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] overflow-hidden shadow-xl">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31528!2d147.180!3d-9.443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMjYnMzUiUyAxNDfCsDEwJzQ4IkU!5e0!3m2!1sen!2spg!4v1234567890"
                width="100%" 
                height="400" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Tuna Bay Resort Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
