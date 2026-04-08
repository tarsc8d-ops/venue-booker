import { useState } from 'react'

const STATUS = {
  pending:      { label: 'Pending',   dot: '#AEAEB2' },
  email_sent:   { label: 'Emailed',   dot: '#007AFF' },
  confirmed:    { label: 'Confirmed', dot: '#34C759' },
  cancelled:    { label: 'Cancelled', dot: '#FF3B30' },
}

const FILTERS = [
  ['all', 'All'],
  ['pending', 'Pending'],
  ['email_sent', 'Emailed'],
  ['confirmed', 'Confirmed'],
]

const fmtDate = (d) => {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
const fmtTime = (t) => {
  if (!t) return null
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

export default function VenueList({ tour, venues, onBack, onAddVenue, onEditVenue, onDeleteVenue, onSendEmail, onViewSurvey }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const counts = {
    all: venues.length,
    pending: venues.filter(v => v.status === 'pending').length,
    email_sent: venues.filter(v => v.status === 'email_sent').length,
    confirmed: venues.filter(v => v.status === 'confirmed').length,
  }

  const visible = venues
    .filter(v => {
      const q = search.toLowerCase()
      const matchQ = !q ||
        v.venueName?.toLowerCase().includes(q) ||
        v.city?.toLowerCase().includes(q) ||
        v.contactName?.toLowerCase().includes(q)
      return matchQ && (filter === 'all' || v.status === filter)
    })
    .sort((a, b) => {
      if (!a.showDate) return 1
      if (!b.showDate) return -1
      return new Date(a.showDate) - new Date(b.showDate)
    })

  const toggle = (id) => setExpanded(prev => prev === id ? null : id)

  return (
    <div className="screen">
      <div className="header">
        <button className="back-btn" onClick={onBack} aria-label="Back">‹</button>
        <div className="header-center">
          <div className="header-title">{tour?.name || 'Venues'}</div>
          {tour?.artist && <div className="header-sub">🎤 {tour.artist}</div>}
        </div>
        <div style={{ width: '40px' }} />
      </div>

      <div className="stats-strip">
        {FILTERS.map(([val, label]) => (
          <div
            key={val}
            className={`stat-chip ${filter === val ? 'active' : ''}`}
            onClick={() => setFilter(val)}
          >
            <span>{counts[val] ?? 0}</span>
            {label}
          </div>
        ))}
      </div>

      <div className="search-wrap">
        <div className="search-input-wrap">
          <span className="search-icon-inner">🔍</span>
          <input
            className="search-input" type="search" placeholder="Search venues…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="clear-btn" onClick={() => setSearch('')}>×</button>}
        </div>
      </div>

      <div className="scroll-content">
        {visible.length === 0 ? (
          <div className="empty">
            <div className="empty-emoji">🏟️</div>
            <h3>{venues.length === 0 ? 'No venues yet' : 'No matches'}</h3>
            <p>{venues.length === 0 ? 'Add your first venue to this tour.' : 'Try a different search or filter.'}</p>
            {venues.length === 0 && (
              <button className="btn-primary" onClick={onAddVenue}>+ Add First Venue</button>
            )}
          </div>
        ) : (
          <div className="card-list">
            {visible.map(venue => {
              const st = STATUS[venue.status] || STATUS.pending
              const isOpen = expanded === venue.id
              const date = fmtDate(venue.showDate)
              const time = fmtTime(venue.showTime)
              return (
                <div key={venue.id} className="venue-card">
                  <div className="venue-card-main" onClick={() => toggle(venue.id)}>
                    <div className="venue-status-dot" style={{ background: st.dot }} />
                    <div className="venue-card-info">
                      <div className="venue-card-name">{venue.venueName}</div>
                      <div className="venue-card-meta">
                        {venue.city && <span>{venue.city}</span>}
                        {venue.city && date && <span className="meta-sep">·</span>}
                        {date && <span>{date}{time ? ` at ${time}` : ''}</span>}
                        {!venue.city && !date && <span style={{color:'var(--text-3)'}}>No date set</span>}
                      </div>
                      {venue.contactName && (
                        <div className="venue-card-contact">
                          {venue.contactName}{venue.contactEmail ? ` · ${venue.contactEmail}` : ''}
                        </div>
                      )}
                    </div>
                    <div className="venue-chevron" style={{ transform: isOpen ? 'rotate(90deg)' : '' }}>›</div>
                  </div>

                  {isOpen && (
                    <div className="venue-card-actions" onClick={e => e.stopPropagation()}>
                      {venue.notes && <p className="venue-notes">{venue.notes}</p>}
                      <div className="action-row">
                        <button className="action-chip action-email"  onClick={() => onSendEmail(venue)}>✉️ Email</button>
                        <button className="action-chip action-survey" onClick={() => onViewSurvey(venue)}>📊 Results</button>
                        <button className="action-chip action-edit"   onClick={() => onEditVenue(venue)}>✏️ Edit</button>
                        <button className="action-chip action-delete"
                          onClick={() => { if (confirm(`Delete "${venue.venueName}"?`)) onDeleteVenue(venue.id) }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        <div style={{ height: '80px' }} />
      </div>

      <button className="fab" onClick={onAddVenue} aria-label="Add venue">+</button>
    </div>
  )
}
