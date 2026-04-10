import { useState } from 'react'
import { MenuIcon, MicIcon, SearchIcon, XIcon } from './Icons'

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
              {tour.artist && <div className="tour-artist">{tour.artist}</div>}
            </div>
            <button
              className="icon-btn-sm"
              onClick={e => { e.stopPropagation(); onEditTour(tour) }}
              aria-label="Edit tour"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
              </svg>
            </button>
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
        <div className="tour-card-arrow" style={{ opacity: 0.3, paddingRight: '14px', display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* DESKTOP */}
      <div className="desktop-topbar">
        <div className="desktop-topbar-title">Tours</div>
        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '10px' }} onClick={onAddTour}>
          + New Tour
        </button>
      </div>

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

      <div className="desktop-search-bar">
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <span className="search-icon-inner"><SearchIcon width={15} height={15} /></span>
          <input className="search-input" type="search" placeholder="Search tours..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="clear-btn" onClick={() => setSearch('')}><XIcon width={16} height={16} /></button>}
        </div>
      </div>

      <div className="desktop-tour-grid">
        {filtered.length === 0 ? (
          <div className="desktop-empty-center">
            <div className="empty">
              <div className="empty-icon"><MicIcon width={48} height={48} style={{ opacity: 0.2 }} /></div>
              <h3>{tours.length === 0 ? 'No tours yet' : 'No results'}</h3>
              <p>{tours.length === 0 ? 'Create your first tour to get started.' : 'Try a different search.'}</p>
              {tours.length === 0 && <button className="btn-primary" onClick={onAddTour}>New Tour</button>}
            </div>
          </div>
        ) : (
          filtered.map(tour => <TourCard key={tour.id} tour={tour} />)
        )}
      </div>

      {/* MOBILE */}
      <div className="mobile-tour-list screen">
        <div className="header">
          <button className="hamburger-btn" onClick={onOpenDrawer} aria-label="Open menu">
            <MenuIcon width={20} height={20} />
          </button>
          <div className="header-center">
            <span className="header-title">VenBook</span>
          </div>
          <button className="icon-btn" onClick={onOpenSettings} aria-label="Account" style={{ width: '40px' }}>
            {auth?.picture
              ? <img src={auth.picture} className="avatar" alt={auth.name} onError={e => { e.target.style.display = 'none' }} />
              : <SettingsIcon width={20} height={20} />}
          </button>
        </div>

        <div className="search-wrap">
          <div className="search-input-wrap">
            <span className="search-icon-inner"><SearchIcon width={15} height={15} /></span>
            <input className="search-input" type="search" placeholder="Search tours..."
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="clear-btn" onClick={() => setSearch('')}><XIcon width={16} height={16} /></button>}
          </div>
        </div>

        <div className="scroll-content">
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><MicIcon width={48} height={48} style={{ opacity: 0.2 }} /></div>
              <h3>{tours.length === 0 ? 'No tours yet' : 'No results'}</h3>
              <p>{tours.length === 0 ? 'Create your first tour to get started.' : 'Try a different search.'}</p>
              {tours.length === 0 && <button className="btn-primary" onClick={onAddTour}>New Tour</button>}
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

function SettingsIcon({ width, height }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}
