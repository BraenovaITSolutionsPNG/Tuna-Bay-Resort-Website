import { useState } from 'react'

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-72 rounded-2xl border border-ocean/10 bg-white p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg text-ocean">Chat Assistant</span>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 text-muted hover:bg-sand" aria-label="Close chat">✕</button>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">This feature is coming soon.</p>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid size-14 place-items-center rounded-full bg-ocean text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-teal"
        aria-label="Open chat assistant"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-6">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  )
}
