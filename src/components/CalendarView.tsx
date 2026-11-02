import { Booking } from '../lib/bookings'

interface Props { bookings: Booking[] }

export default function CalendarView({ bookings }: Props) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const byDay: Record<number, number> = {}
  bookings.forEach(b => {
    const d = new Date(b.date)
    if (d.getMonth() === month && d.getFullYear() === year) {
      byDay[d.getDate()] = (byDay[d.getDate()] || 0) + 1
    }
  })

  return (
    <div>
      <h3 className="font-display text-lg text-ocean mb-4">{today.toLocaleString('default', { month: 'long' })} {year}</h3>
      <div className="grid grid-cols-7 gap-2 text-center text-xs">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="font-bold text-muted py-1">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className={`rounded-lg p-2 min-h-[60px] ${d ? 'bg-sand-light' : ''}`}>
            {d && (
              <>
                <div className="font-semibold text-ink">{d}</div>
                {byDay[d] && <div className="mt-1 rounded-full bg-coral text-white text-[0.6rem] font-bold px-1">{byDay[d]}</div>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
