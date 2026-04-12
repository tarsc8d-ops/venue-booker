import { useMemo, useState, useCallback } from 'react'

function parseYMD(s) {
  if (!s || typeof s !== 'string') return null
  const p = s.split('T')[0]
  const [y, m, d] = p.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function formatKey(d) {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${day}`
}

function startOfWeekSunday(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = x.getDay()
  x.setDate(x.getDate() - dow)
  return x
}

function addDays(d, n) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() + n)
  return x
}

function todayKey() {
  const t = new Date()
  return formatKey(new Date(t.getFullYear(), t.getMonth(), t.getDate()))
}

/**
 * Cal AI–style week strip: current week (Sun–Sat) + optional trailing cell when
 * the next venue show date falls outside this week.
 */
export default function DateBar({ venues = [] }) {
  const [selectedKey, setSelectedKey] = useState(todayKey)

  const { weekDays, nextOutside } = useMemo(() => {
    const now = new Date()
    const start = startOfWeekSunday(now)
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i)
      days.push({
        key: formatKey(d),
        date: d,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
        num: d.getDate(),
      })
    }
    const w0 = days[0].key
    const w6 = days[6].key

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const upcoming = venues
      .filter((v) => v.showDate)
      .map((v) => ({ v, d: parseYMD(v.showDate) }))
      .filter(({ d }) => d && d >= today)
      .sort((a, b) => a.d - b.d)

    const next = upcoming[0]
    const nd = next?.v?.showDate?.split('T')[0]
    const inWeek = nd && nd >= w0 && nd <= w6
    const nextOutside = !inWeek && nd
      ? {
          key: nd,
          date: parseYMD(nd),
          venueName: next.v.venueName,
          dayLabel: parseYMD(nd).toLocaleDateString('en-US', { weekday: 'short' }),
          num: parseYMD(nd).getDate(),
        }
      : null

    const counts = new Map()
    for (const v of venues) {
      if (!v.showDate) continue
      const k = v.showDate.split('T')[0]
      counts.set(k, (counts.get(k) || 0) + 1)
    }

    return {
      weekDays: days.map((x) => ({ ...x, venueCount: counts.get(x.key) || 0 })),
      nextOutside,
    }
  }, [venues])

  const onPick = useCallback((key) => {
    setSelectedKey(key)
  }, [])

  const todayK = todayKey()

  return (
    <div className="date-bar" role="group" aria-label="Week and upcoming show dates">
      <div className="date-bar-scroll">
        {weekDays.map((d) => {
          const sel = selectedKey === d.key
          const isToday = d.key === todayK
          return (
            <button
              key={d.key}
              type="button"
              className={`date-bar-item ${sel ? 'date-bar-item--selected' : ''} ${isToday && !sel ? 'date-bar-item--today' : ''}`}
              onClick={() => onPick(d.key)}
              aria-pressed={sel}
              aria-label={`${d.dayLabel} ${d.num}${d.venueCount ? `, ${d.venueCount} shows` : ''}`}
            >
              <span className="date-bar-day">{d.dayLabel}</span>
              <span className={`date-bar-num ${sel ? 'date-bar-num--solid' : ''}`}>
                {d.num}
              </span>
              {d.venueCount > 0 && <span className="date-bar-dot" aria-hidden />}
            </button>
          )
        })}

        {nextOutside && (
          <>
            <div className="date-bar-sep" aria-hidden />
            <button
              type="button"
              className={`date-bar-item date-bar-item--next ${selectedKey === nextOutside.key ? 'date-bar-item--selected' : ''}`}
              onClick={() => onPick(nextOutside.key)}
              aria-pressed={selectedKey === nextOutside.key}
              aria-label={`Next show ${nextOutside.dayLabel} ${nextOutside.num}: ${nextOutside.venueName || 'Venue'}`}
            >
              <span className="date-bar-day">{nextOutside.dayLabel}</span>
              <span
                className={`date-bar-num ${selectedKey === nextOutside.key ? 'date-bar-num--solid' : ''}`}
              >
                {nextOutside.num}
              </span>
              <span className="date-bar-next-label">Next</span>
              {nextOutside.venueName && (
                <span className="date-bar-venue" title={nextOutside.venueName}>
                  {nextOutside.venueName.length > 10
                    ? `${nextOutside.venueName.slice(0, 9)}…`
                    : nextOutside.venueName}
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
