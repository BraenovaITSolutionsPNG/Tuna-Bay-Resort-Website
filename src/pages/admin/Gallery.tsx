import { useState, useEffect } from 'react'

interface GalleryImage {
  id: number
  src: string
  alt: string | null
  title: string | null
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [src, setSrc] = useState('')
  const [title, setTitle] = useState('')
  const [alt, setAlt] = useState('')

  const reload = () => {
    fetch('/api/gallery')
      .then(r => r.ok ? r.json() : [])
      .then(d => setImages(Array.isArray(d) ? d : []))
      .catch(() => setImages([]))
  }

  useEffect(() => { reload() }, [])

  const addImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!src) return
    const token = localStorage.getItem('token')
    await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ src, alt, title }),
    })
    setSrc(''); setAlt(''); setTitle('')
    reload()
  }

  const deleteImage = async (id: number) => {
    if (!confirm('Delete this image?')) return
    const token = localStorage.getItem('token')
    await fetch(`/api/gallery/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    reload()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#052633]">Gallery</h1>
      <p className="mt-1 text-muted">Manage gallery images.</p>

      <form onSubmit={addImage} className="mt-6 flex flex-wrap gap-3 rounded-2xl bg-white p-5 shadow">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
          <input type="file" accept="image/*" onChange={e => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => setSrc(reader.result as string)
            reader.readAsDataURL(file)
          }} className="w-full rounded-xl border border-ocean/20 px-4 py-2 text-sm" required />
        </div>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="rounded-xl border border-ocean/20 px-4 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Alt text"
          value={alt}
          onChange={e => setAlt(e.target.value)}
          className="rounded-xl border border-ocean/20 px-4 py-2 text-sm"
        />
        <button type="submit" className="rounded-xl bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-teal transition">
          Add Image
        </button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map(img => (
          <div key={img.id} className="group relative overflow-hidden rounded-2xl bg-white shadow">
            <img src={img.src} alt={img.alt || ''} className="h-48 w-full object-cover" />
            <div className="p-4">
              <p className="font-display text-sm text-ocean">{img.title || 'Untitled'}</p>
              <p className="text-xs text-muted truncate">{img.alt}</p>
            </div>
            <button
              onClick={() => deleteImage(img.id)}
              className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition"
            >
              Delete
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <p className="text-muted col-span-full">No images yet.</p>
        )}
      </div>
    </div>
  )
}
