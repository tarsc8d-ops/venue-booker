import { useState } from 'react'

const STATUS = {
  pending:    { label: 'Pending',   dot: '#AEAEB2' },
  email_sent: { label: 'Emailed',   dot: '#007AFF' },
  confirmed:  { label: 'Confirmed', dot: '#34C759' },
  cancelled:  { label: 'Cancelled', dot: '#FF3B30' },
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

export default function VenueList({ tour, venues, templates, onBack, onAddVenue, onEditVenue, onDeleteVenue, onSendEmail, onViewSurvey, onBulkEmail }) {
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')
  const [expanded,   setExpanded]   = useState(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())

  const counts = {
    all:        venues.length,
    pending:    venues.filter(v => v.status === 'pending').length,
    email_sent: venues.filter(v => v.status === 'email_sent').length,
    confirmed:  venues.filter(v => v.status === 'confirmed').length,
  }

  const visible = venues
    .filter(v => {
      const q = search.toLowerCase()
      const matchQ = !q || v.venueName?.toLowerCase().includes(q) || v.city?.toLowerCase().includes(q) || v.contactName?.toLowerCase().includes(q)
      return matchQ && (filter === 'all' || v.status === filter)
    })
    .sort((a, b) => {
      if (!a.showDate) return 1
      if (!b.showDate) return -1
      return new Date(a.showDate) - new Date(b.showDate)
    })

  const toggle       = (id) => setExpanded(prev => prev === id ? null : id)
  const toggleSelect = (id) => setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const selectAll    = () => setSelectedIds(new Set(visible.map(v => v.id)))
  const clearSelect  = () => { setSelectedIds(new Set()); setSelectMode(false) }

  const selectedVenues = visible.filter(v => selectedIds.has(v.id))

  return (
    <div className="screen">
      {/* Header */}
      <div className="header">
        {selectMode ? (
          <>
            <button className="back-btn" onClick={clearSelect} style={{ fontSize:'16px', width:'56px' }}>Cancel</button>
            <div className="header-center">
              <div className="header-title">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select Venues'}
              </div>
            </div>
            <button
              onClick={selectAll}
              style={{ fontSize:'14px', fontWeight:'600', color:'var(--accent)', border:'none', background:'none', cursor:'pointer', padding:'8px', width:'56px' }}
            >
              All
            </button>
          </>
        ) : (
          <>
            <button className="back-btn" onClick={onBack} aria-label="Back">‹</button>
            <div className="header-center">
              <div className="header-title">{tour?.name || 'Venues'}</div>
              {tour?.artist && <div className="header-sub">🎤 {tour.artist}</div>}
            </div>
            <button
              className="icon-btn"
              onClick={() => { setSelectMode(true); setExpanded(null) }}
              title="Select venues"
              style={{ fontSize:'20px' }}
            >
              ☑️
            </button>
          </>
        )}
      </div>

      {/* Stats strip */}
      <div className="stats-strip">
        {FILTERS.map(([val, label]) => (
          <div key={val} className={`stat-chip ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
            <span>{counts[val] ?? 0}</span>
            {label}
          </div>
        ))}
      </div>

      {/* Search */}
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

      {/* Venue list */}
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
              const st     = STATUS[venue.status] || STATUS.pending
              const isOpen = !selectMode && expanded === venue.id
              const isSelected = selectedIds.has(venue.id)
              const date = fmtDate(venue.showDate)
              const time = fmtTime(venue.showTime)

              return (
                <div key={venue.id} className="venue-card">
                  <div
                    className="venue-card-main"
                    onClick={() => selectMode ? toggleSelect(venue.id) : toggle(venue.id)}
                  >
                    {selectMode ? (
                      <div className={`venue-checkbox ${isSelected ? 'checked' : ''}`} />
                    ) : (
                      <div className="venue-status-dot" style={{ background: st.dot }} />
                    )}
                    <div className="venue-card-info">
                      <div className="venue-card-name">{venue.venueName}</div>
                      <div className="venue-card-meta">
                        {venue.city && <span>{venue.city}</span>}
                        {venue.city && date && <span className="meta-sep">·</span>}
                        {date && <span>{date}{time ? ` at ${time}` : ''}</span>}
                        {!venue.city && !date && <span style={{ color:'var(--text-3)' }}>No date set</span>}
                      </div>
                      {venue.contactName && (
                        <div className="venue-card-contact">
                          {venue.contactName}{venue.contactEmail ? ` · ${venue.contactEmail}` : ''}
                        </div>
                      )}
                    </div>
                    {!selectMode && (
                      <div className="venue-chevron" style={{ transform: isOpen ? 'rotate(90deg)' : '' }}>›</div>
                    )}
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
        <div style={{ height: '100px' }} />
      </div>

      {/* Bulk email action bar */}
      {selectMode && selectedIds.size > 0 && (
        <div className="bulk-bar">
          <button
            className="btn-primary"
            style={{ width:'100%', padding:'15px', fontSize:'16px', borderRadius:'14px', boxShadow:'0 4px 20px rgba(124,58,237,0.4)' }}
            onClick={() => onBulkEmail(selectedVenues)}
          >
            📤 Send Email to {selectedIds.size} Venue{selectedIds.size !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* FAB — hidden in select mode */}
      {!selectMode && (
        <button className="fab" onClick={onAddVenue} aria-label="Add venue">+</button>
      )}
    </div>
  )
}
