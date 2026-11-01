import { useState, useEffect } from 'react'
import { Header, Footer, Eyebrow } from '../components/Layout'

interface GalleryImage {
  id: number
  src: string
  alt: string | null
  title: string | null
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.ok ? r.json() : [])
      .then(d => setImages(Array.isArray(d) ? d : []))
      .catch(() => setImages([]))
      .finally(() => setLoading(false))
  }, [])

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
          {loading ? (
            <p className="text-center text-muted">Loading gallery...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {images.map((image) => (
                <figure key={image.id} className="group relative overflow-hidden rounded-3xl bg-ocean aspect-[4/3]">
                  <img src={image.src} alt={image.alt || ''} className="size-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean/75 via-transparent to-transparent" />
                  <figcaption className="absolute bottom-0 left-0 p-5 font-display text-xl text-white">{image.title}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
