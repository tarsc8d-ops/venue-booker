import { useState } from 'react'
import { VenBookLogo, MicIcon, SearchIcon, XIcon } from './Icons'
import DateBar from './DateBar'

const fmtShort = (d) => {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TourList({ tours, venues, onSelectTour, onAddTour, onEditTour, onDeleteTour }) {
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
      <div
        className={`tour-card ${tour._shared ? 'tour-card--shared' : ''}`}
        onClick={() => { if (!tour._shared) onSelectTour(tour.id) }}
        style={tour._shared ? { cursor: 'default' } : undefined}
      >
        <div className="tour-card-bar" style={{ background: color }} />
        <div className="tour-card-body">
          <div className="tour-card-top">
            <div className="tour-card-info">
              <div className="tour-name">
                {tour.name}
                {tour._shared && <span className="tour-shared-badge">Shared</span>}
              </div>
              {tour.artist && <div className="tour-artist">{tour.artist}</div>}
            </div>
            {!tour._shared && (
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
            )}
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

      <div className="desktop-date-bar">
        <DateBar venues={venues} />
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
        <div className="desktop-tours-scroll-inner">
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
      </div>

      {/* MOBILE */}
      <div className="mobile-tour-list screen">

        {/* Cal AI–style header: icon + name left-aligned */}
        <div className="mobile-tours-header">
          <VenBookLogo size={36} />
          <span className="mobile-tours-brand-name">VenBook</span>
        </div>

        <DateBar venues={venues} />

        <div className="mobile-analytics-grid">
          <div className="mobile-stat-card">
            <div className="mobile-stat-value mobile-stat-value--accent">{tours.filter((t) => !t._shared).length}</div>
            <div className="mobile-stat-label">Tours</div>
          </div>
          <div className="mobile-stat-card">
            <div className="mobile-stat-value">{totalVenues}</div>
            <div className="mobile-stat-label">Venues</div>
          </div>
          <div className="mobile-stat-card">
            <div className="mobile-stat-value mobile-stat-value--violet">{emailedCount}</div>
            <div className="mobile-stat-label">Emailed</div>
          </div>
          <div className="mobile-stat-card">
            <div className="mobile-stat-value mobile-stat-value--purple-soft">{pendingCount}</div>
            <div className="mobile-stat-label">Pending</div>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-input-wrap">
            <span className="search-icon-inner"><SearchIcon width={15} height={15} /></span>
            <input className="search-input" type="search" placeholder="Search tours..."
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button type="button" className="clear-btn" onClick={() => setSearch('')}><XIcon width={16} height={16} /></button>}
          </div>
        </div>

        <div className="scroll-content">
          <div className="tours-scroll-inner">
            {filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-icon"><MicIcon width={48} height={48} style={{ opacity: 0.2 }} /></div>
                <h3>{tours.length === 0 ? 'No tours yet' : 'No results'}</h3>
                <p>{tours.length === 0 ? 'Create your first tour to get started.' : 'Try a different search.'}</p>
                {tours.length === 0 && <button type="button" className="btn-primary" onClick={onAddTour}>New Tour</button>}
              </div>
            ) : (
              <div className="card-list">
                {filtered.map(tour => <TourCard key={tour.id} tour={tour} />)}
              </div>
            )}
            <div className="tours-scroll-footer-spacer tours-scroll-footer-spacer--nav" aria-hidden />
          </div>
        </div>
      </div>
    </>
  )
}
