import { Header, Footer, Eyebrow } from '../components/Layout'

const aboutImage = '/images/tuna-bay-waterfront.png'

export default function About() {
  return (
    <main className="overflow-x-hidden bg-sand text-ink">
      <Header variant="light" />
      <section className="section-space bg-sand">
        <div className="page-wrap grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem]">
              <img src={aboutImage} alt="Aerial view of Tuna Bay’s waterfront jetty and surrounding coastline" className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]" />
            </div>
            <div className="absolute -bottom-6 right-4 max-w-52 rounded-2xl bg-ocean p-5 text-white shadow-xl sm:right-[-1.5rem]">
              <span className="font-display text-4xl text-seafoam">15 min</span>
              <p className="mt-1 text-sm leading-5 text-white/70">from central Port Moresby, a world away from the rush.</p>
            </div>
          </div>
          <div className="pt-6 lg:pt-0">
            <Eyebrow>Our little corner of the coast</Eyebrow>
            <h2 className="heading-lg mt-4">Where the city <em>slows down</em> and the tide rolls in.</h2>
            <p className="mt-6 text-lg leading-8 text-muted">Tucked behind Taurama’s mangroves, Tuna Bay Resort is a welcoming waterfront hideaway made for long lunches, salt-air afternoons and celebrations that feel a little more special.</p>
            <p className="mt-4 leading-7 text-muted">Follow the road through the greenery to our dining pier, open lawns and uninterrupted ocean views. Come with the family for a weekend escape, share a seafood feast with friends, or make the whole place yours for the day.</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
