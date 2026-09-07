import { useState } from 'react'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function toDateKey(d) {
  return d.toISOString().slice(0, 10)
}

// sessionsByDate: Map of 'YYYY-MM-DD' -> array of sessions
export default function WorkoutCalendar({ sessionsByDate, onSelectDay, selectedDate }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayKey = toDateKey(new Date())

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)

  function changeMonth(delta) {
    const next = new Date(year, month + delta, 1)
    setCursor(next)
  }

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button className="secondary" style={{ padding: '6px 12px' }} onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
        <b>{monthLabel}</b>
        <button className="secondary" style={{ padding: '6px 12px' }} onClick={() => changeMonth(1)} aria-label="Next month">›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, textAlign: 'center' }}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="muted" style={{ fontSize: 11, fontWeight: 800, padding: '4px 0' }}>{w}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />
          const dateKey = toDateKey(new Date(year, month, day))
          const count = sessionsByDate[dateKey]?.length || 0
          const isToday = dateKey === todayKey
          const isSelected = dateKey === selectedDate
          return (
            <button
              key={i}
              onClick={() => onSelectDay(count > 0 ? dateKey : null)}
              style={{
                aspectRatio: '1',
                border: isSelected ? '2px solid var(--accent)' : isToday ? '1px solid var(--accent)' : '1px solid transparent',
                borderRadius: 10,
                background: count > 0 ? 'rgba(255,77,35,0.12)' : 'transparent',
                color: 'var(--text)',
                fontWeight: count > 0 ? 800 : 500,
                fontSize: 13,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: count > 0 ? 'pointer' : 'default',
                padding: 0
              }}
            >
              {day}
              {count > 0 && <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', marginTop: 2 }} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
