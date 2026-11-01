import { Header, Footer, Eyebrow } from '../components/Layout'

const galleryImages = [
  { src: '/images/tuna-bay-hero.jpg', alt: 'Aerial view of the Tuna Bay Resort pool and grounds', title: 'Poolside days' },
  { src: '/images/tuna-bay-waterfront.png', alt: 'Tuna Bay waterfront jetty surrounded by green coastline', title: 'The waterfront' },
  { src: 'https://images.unsplash.com/photo-1615608178738-37d47d27c13d?auto=format&fit=crop&w=1000&q=85', alt: 'Lush tropical island surrounded by clear blue water', title: 'Tropical surrounds' },
  { src: 'https://images.unsplash.com/photo-1678080394259-824d24aeb05c?auto=format&fit=crop&w=1000&q=85', alt: 'Calm coastal water bordered by green trees', title: 'Quiet moments' },
]

export default function Gallery() {
  return (
    <main className="overflow-x-hidden bg-sand text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap">
          <div className="text-center mb-12">
            <Eyebrow>Life at Tuna Bay</Eyebrow>
            <h1 className="heading-lg mt-4">A glimpse of your next <em>coastal escape.</em></h1>
            <p className="mt-6 max-w-2xl mx-auto leading-7 text-muted">From easy poolside afternoons to wide-open waterfront views, every visit comes with room to breathe.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {galleryImages.map((image) => (
              <figure key={image.title} className="group relative overflow-hidden rounded-3xl bg-ocean aspect-[4/3]">
                <img src={image.src} alt={image.alt} className="size-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean/75 via-transparent to-transparent" />
                <figcaption className="absolute bottom-0 left-0 p-5 font-display text-xl text-white">{image.title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
