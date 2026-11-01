import { Header, Footer, Eyebrow } from '../components/Layout'
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer'

export default function VirtualTour() {
  return (
    <main className="overflow-x-hidden bg-sand text-ink">
      <Header variant="light" />
      <section className="section-space">
        <div className="page-wrap">
          <div className="text-center mb-12">
            <Eyebrow>Virtual Experience</Eyebrow>
            <h1 className="heading-lg mt-4">360° <em>Virtual Tour</em></h1>
            <p className="mt-6 max-w-2xl mx-auto leading-7 text-muted">Explore Tuna Bay Resort in immersive 360° view.</p>
          </div>
          <div className="rounded-[2rem] overflow-hidden shadow-xl h-[500px] md:h-[600px]">
            <ReactPhotoSphereViewer 
              src="/images/tuna-bay-waterfront.png" 
              height={'100%'} 
              width={'100%'}
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
