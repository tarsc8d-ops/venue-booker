import { useState } from 'react'

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
  const nextShow       = (id) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return venues
      .filter(v => v.tourId === id && v.showDate && new Date(v.showDate + 'T00:00:00') >= today)
      .sort((a, b) => new Date(a.showDate) - new Date(b.showDate))[0]
  }

  // Global stats for desktop dashboard
  const totalVenues  = venues.length
  const emailedCount = venues.filter(v => v.status === 'email_sent' || v.status === 'confirmed').length
  const pendingCount = venues.filter(v => v.status === 'pending').length

  const TourCard = ({ tour }) => {
    const count     = venueCount(tour.id)
    const contacted = contactedCount(tour.id)
    const next      = nextShow(tour.id)
    const color     = tour.color || '#7C3AED'
    return (
      <div className="tour-card" onClick={() => onSelectTour(tour.id)}>
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
  }

  return (
    <>
      {/* ── DESKTOP LAYOUT ─────────────────────────────── */}
      {/* Top bar */}
      <div className="desktop-topbar">
        <div className="desktop-topbar-title">Tours</div>
        <div className="desktop-topbar-right">
          <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '10px' }} onClick={onAddTour}>
            + New Tour
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="desktop-stats">
        <div className="desktop-stat-card">
          <div className="desktop-stat-value">{tours.length}</div>
          <div className="desktop-stat-label">Active Tours</div>
        </div>
        <div className="desktop-stat-card">
          <div className="desktop-stat-value">{totalVenues}</div>
          <div className="desktop-stat-label">Total Venues</div>
        </div>
        <div className="desktop-stat-card">
          <div className="desktop-stat-value" style={{ color: '#2563EB' }}>{emailedCount}</div>
          <div className="desktop-stat-label">Emailed</div>
        </div>
        <div className="desktop-stat-card">
          <div className="desktop-stat-value" style={{ color: '#D97706' }}>{pendingCount}</div>
          <div className="desktop-stat-label">Pending</div>
        </div>
      </div>

      {/* Search on desktop */}
      <div className="desktop-search-bar">
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <span className="search-icon-inner">🔍</span>
          <input
            className="search-input" type="search" placeholder="Search tours…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="clear-btn" onClick={() => setSearch('')}>×</button>}
        </div>
      </div>

      {/* Desktop tour grid */}
      {filtered.length === 0 ? (
        <div className="desktop-tour-grid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="empty">
            <div className="empty-emoji">🎤</div>
            <h3>{tours.length === 0 ? 'No tours yet' : 'No results'}</h3>
            <p>{tours.length === 0 ? 'Create your first tour to get started.' : 'Try a different search.'}</p>
            {tours.length === 0 && <button className="btn-primary" onClick={onAddTour}>+ Create First Tour</button>}
          </div>
        </div>
      ) : (
        <div className="desktop-tour-grid">
          {filtered.map(tour => <TourCard key={tour.id} tour={tour} />)}
        </div>
      )}

      {/* ── MOBILE LAYOUT ──────────────────────────────── */}
      <div className="mobile-tour-list screen">
        <div className="header">
          <button className="hamburger-btn" onClick={onOpenDrawer} aria-label="Open menu">
            <span className="hamburger-icon"><span /><span /><span /></span>
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
              {tours.length === 0 && <button className="btn-primary" onClick={onAddTour}>+ Create First Tour</button>}
            </div>
          ) : (
            <div className="card-list">
              {filtered.map(tour => <TourCard key={tour.id} tour={tour} />)}
            </div>
          )}
          <div style={{ height: '80px' }} />
        </div>

        <button className="fab" onClick={onAddTour} aria-label="Add tour">+</button>
      </div>
    </>
  )
}
