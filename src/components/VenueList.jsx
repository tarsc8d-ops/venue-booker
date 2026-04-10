import { useState } from 'react'
import { SearchIcon, XIcon, SendIcon, BarChartIcon, EditIcon, TrashIcon, FlaskIcon, SelectIcon } from './Icons'

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

export default function VenueList({ tour, venues, templates, auth, onBack, onAddVenue, onEditVenue, onDeleteVenue, onSendEmail, onViewSurvey, onBulkEmail, onTestEmail }) {
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState('all')
  const [expanded,    setExpanded]    = useState(null)
  const [selectMode,  setSelectMode]  = useState(false)
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
      <div className="header">
        {selectMode ? (
          <>
            <button className="back-btn" onClick={clearSelect} style={{ fontSize: '14px', fontWeight: '600', width: '56px', color: 'var(--text-2)' }}>Cancel</button>
            <div className="header-center">
              <div className="header-title">{selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select Venues'}</div>
            </div>
            <button onClick={selectAll} style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', border: 'none', background: 'none', cursor: 'pointer', padding: '8px', width: '56px' }}>All</button>
          </>
        ) : (
          <>
            <button className="back-btn" onClick={onBack} aria-label="Back">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div className="header-center">
              <div className="header-title">{tour?.name || 'Venues'}</div>
              {tour?.artist && <div className="header-sub">{tour.artist}</div>}
            </div>
            <button
              className="icon-btn"
              onClick={() => { setSelectMode(true); setExpanded(null) }}
              title="Select venues for bulk email"
            >
              <SelectIcon width={19} height={19} />
            </button>
          </>
        )}
      </div>

      {!selectMode && (
        <button onClick={onTestEmail} style={{ width: '100%', padding: '10px 16px', background: 'var(--surface)', border: 'none', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0, textAlign: 'left' }}>
          <span style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FlaskIcon width={15} height={15} style={{ color: 'var(--accent)' }} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Send Test Email</div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Preview the template — sends to {auth?.email || 'your inbox'}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3 }}><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}

      <div className="stats-strip">
        {FILTERS.map(([val, label]) => (
          <div key={val} className={`stat-chip ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
            <span>{counts[val] ?? 0}</span>
            {label}
          </div>
        ))}
      </div>

      <div className="search-wrap">
        <div className="search-input-wrap">
          <span className="search-icon-inner"><SearchIcon width={15} height={15} /></span>
          <input className="search-input" type="search" placeholder="Search venues..."
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="clear-btn" onClick={() => setSearch('')}><XIcon width={16} height={16} /></button>}
        </div>
      </div>

      <div className="scroll-content">
        {visible.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
                <path d="M3 21h18M4 21V8l8-5 8 5v13" /><rect x="9" y="14" width="6" height="7" />
              </svg>
            </div>
            <h3>{venues.length === 0 ? 'No venues yet' : 'No matches'}</h3>
            <p>{venues.length === 0 ? 'Add your first venue to this tour.' : 'Try a different search or filter.'}</p>
            {venues.length === 0 && <button className="btn-primary" onClick={onAddVenue}>Add First Venue</button>}
          </div>
        ) : (
          <div className="card-list">
            {visible.map(venue => {
              const st       = STATUS[venue.status] || STATUS.pending
              const isOpen   = !selectMode && expanded === venue.id
              const isSelected = selectedIds.has(venue.id)
              const date = fmtDate(venue.showDate)
              const time = fmtTime(venue.showTime)

              return (
                <div key={venue.id} className="venue-card">
                  <div className="venue-card-main" onClick={() => selectMode ? toggleSelect(venue.id) : toggle(venue.id)}>
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
                        {!venue.city && !date && <span style={{ color: 'var(--text-3)' }}>No date set</span>}
                      </div>
                      {venue.contactName && (
                        <div className="venue-card-contact">{venue.contactName}{venue.contactEmail ? ` · ${venue.contactEmail}` : ''}</div>
                      )}
                    </div>
                    {!selectMode && (
                      <div className="venue-chevron" style={{ transform: isOpen ? 'rotate(90deg)' : '', opacity: 0.3 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                      </div>
                    )}
                  </div>

                  {isOpen && (
                    <div className="venue-card-actions" onClick={e => e.stopPropagation()}>
                      {venue.notes && <p className="venue-notes">{venue.notes}</p>}
                      <div className="action-row">
                        <button className="action-chip action-email" onClick={() => onSendEmail(venue)}>
                          <SendIcon width={13} height={13} /> Email
                        </button>
                        <button className="action-chip action-survey" onClick={() => onViewSurvey(venue)}>
                          <BarChartIcon width={13} height={13} /> Results
                        </button>
                        <button className="action-chip action-edit" onClick={() => onEditVenue(venue)}>
                          <EditIcon width={13} height={13} /> Edit
                        </button>
                        <button className="action-chip action-delete"
                          onClick={() => { if (confirm(`Delete "${venue.venueName}"?`)) onDeleteVenue(venue.id) }}>
                          <TrashIcon width={13} height={13} />
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

      {selectMode && selectedIds.size > 0 && (
        <div className="bulk-bar">
          <button className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '14px', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }} onClick={() => onBulkEmail(selectedVenues)}>
            Send Email to {selectedIds.size} Venue{selectedIds.size !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {!selectMode && (
        <button className="fab" onClick={onAddVenue} aria-label="Add venue">+</button>
      )}
    </div>
  )
}
