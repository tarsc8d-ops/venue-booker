import { useState } from 'react'

const COLORS = ['#7C3AED','#2563EB','#059669','#D97706','#DC2626','#DB2777','#0891B2','#64748B']

const fmtShort = (d) => {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TourList({ tours, venues, auth, onSelectTour, onAddTour, onEditTour, onDeleteTour, onOpenDrawer, onOpenSettings }) {
  const [search, setSearch] = useState('')

  const filtered = tours.filter(t =>
    !search ||
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.artist?.toLowerCase().includes(search.toLowerCase())
  )

  const venueCount     = (id) => venues.filter(v => v.tourId === id).length
  const contactedCount = (id) => venues.filter(v => v.tourId === id && v.status !== 'pending').length
  const nextShow = (id) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return venues
      .filter(v => v.tourId === id && v.showDate && new Date(v.showDate + 'T00:00:00') >= today)
      .sort((a, b) => new Date(a.showDate) - new Date(b.showDate))[0]
  }

  return (
    <div className="screen">
      {/* Header: hamburger | centered title | avatar */}
      <div className="header">
        <button className="hamburger-btn" onClick={onOpenDrawer} aria-label="Open menu">
          <span className="hamburger-icon">
            <span /><span /><span />
          </span>
        </button>
        <div className="header-center">
          <span className="header-title">VenueBooker</span>
        </div>
        <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings" style={{ width: '40px' }}>
          {auth?.picture
            ? <img src={auth.picture} className="avatar" alt={auth.name} onError={e => { e.target.style.display = 'none' }} />
            : <span>⚙️</span>
          }
        </button>
      </div>

      <div className="search-wrap">
        <div className="search-input-wrap">
          <span className="search-icon-inner">🔍</span>
          <input
            className="search-input" type="search" placeholder="Search tours…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="clear-btn" onClick={() => setSearch('')}>×</button>}
        </div>
      </div>

      <div className="scroll-content">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-emoji">🎤</div>
            <h3>{tours.length === 0 ? 'No tours yet' : 'No results'}</h3>
            <p>{tours.length === 0 ? 'Create your first tour to get started.' : 'Try a different search.'}</p>
            {tours.length === 0 && (
              <button className="btn-primary" onClick={onAddTour}>+ Create First Tour</button>
            )}
          </div>
        ) : (
          <div className="card-list">
            {filtered.map(tour => {
              const count     = venueCount(tour.id)
              const contacted = contactedCount(tour.id)
              const next      = nextShow(tour.id)
              const color     = tour.color || COLORS[0]
              return (
                <div key={tour.id} className="tour-card" onClick={() => onSelectTour(tour.id)}>
                  <div className="tour-card-bar" style={{ background: color }} />
                  <div className="tour-card-body">
                    <div className="tour-card-top">
                      <div className="tour-card-info">
                        <div className="tour-name">{tour.name}</div>
                        {tour.artist && <div className="tour-artist">🎤 {tour.artist}</div>}
                      </div>
                      <button
                        className="icon-btn-sm"
                        onClick={e => { e.stopPropagation(); onEditTour(tour) }}
                        aria-label="Edit tour"
                      >⋯</button>
                    </div>
                    <div className="tour-card-stats">
                      <div className="tour-stat">
                        <span className="tour-stat-num">{count}</span>
                        <span className="tour-stat-label">Venues</span>
                      </div>
                      <div className="tour-stat">
                        <span className="tour-stat-num">{contacted}</span>
                        <span className="tour-stat-label">Contacted</span>
                      </div>
                      {next && (
                        <div className="tour-stat">
                          <span className="tour-stat-num">{fmtShort(next.showDate)}</span>
                          <span className="tour-stat-label">Next Show</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="tour-card-arrow">›</div>
                </div>
              )
            })}
          </div>
        )}
        <div style={{ height: '80px' }} />
      </div>

      <button className="fab" onClick={onAddTour} aria-label="Add tour">+</button>
    </div>
  )
}
