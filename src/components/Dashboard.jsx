import { useState } from 'react'

const STATUS_CONFIG = {
  pending:          { label: 'Pending',         cls: 'status-pending'  },
  email_sent:       { label: 'Email Sent',       cls: 'status-sent'     },
  survey_received:  { label: 'Survey Received',  cls: 'status-received' },
}

const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const fmtTime = (t) => {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

export default function Dashboard({ venues, onAdd, onEdit, onDelete, onSendEmail, onViewResults }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const pending  = venues.filter(v => v.status === 'pending').length
  const sent     = venues.filter(v => v.status === 'email_sent').length
  const received = venues.filter(v => v.status === 'survey_received').length

  const visible = venues
    .filter(v => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        v.venueName?.toLowerCase().includes(q) ||
        v.contactName?.toLowerCase().includes(q) ||
        v.city?.toLowerCase().includes(q) ||
        v.artistName?.toLowerCase().includes(q)
      const matchFilter = filter === 'all' || v.status === filter
      return matchSearch && matchFilter
    })
    .sort((a, b) => {
      if (sortBy === 'date')   return new Date(a.showDate || 0) - new Date(b.showDate || 0)
      if (sortBy === 'name')   return a.venueName.localeCompare(b.venueName)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return 0
    })

  return (
    <div className="dashboard">
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{venues.length}</div>
          <div className="stat-label">Total Venues</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-number">{pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card stat-sent">
          <div className="stat-number">{sent}</div>
          <div className="stat-label">Emails Sent</div>
        </div>
        <div className="stat-card stat-received">
          <div className="stat-number">{received}</div>
          <div className="stat-label">Surveys In</div>
        </div>
      </div>

      {/* Controls */}
      <div className="table-controls">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search venues, contacts, cities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button style={{border:'none',background:'none',cursor:'pointer',color:'var(--text-muted)'}} onClick={() => setSearch('')}>×</button>}
        </div>
        <div className="filter-group">
          {[['all','All'], ['pending','Pending'], ['email_sent','Email Sent'], ['survey_received','Surveys In']].map(([val, label]) => (
            <button key={val} className={`filter-btn ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
              {label}
            </button>
          ))}
        </div>
        <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date">Sort: Date</option>
          <option value="name">Sort: Name</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      {/* Table or Empty */}
      {visible.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎵</div>
          <h3>{venues.length === 0 ? 'No venues yet' : 'No matches found'}</h3>
          <p>{venues.length === 0 ? 'Add your first venue to get started.' : 'Try adjusting your search or filter.'}</p>
          {venues.length === 0 && <button className="btn btn-primary" onClick={onAdd}>+ Add First Venue</button>}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="venue-table">
            <thead>
              <tr>
                <th>Venue</th>
                <th>Contact</th>
                <th>Date &amp; Time</th>
                <th>Artist</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(v => {
                const sc = STATUS_CONFIG[v.status] || STATUS_CONFIG.pending
                return (
                  <tr key={v.id}>
                    <td>
                      <div className="venue-name-cell">
                        <strong>{v.venueName}</strong>
                        {v.city && <span className="venue-city">{v.city}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <span>{v.contactName || '—'}</span>
                        {v.contactEmail && <span className="contact-email">{v.contactEmail}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="datetime-cell">
                        <span>{fmtDate(v.showDate)}</span>
                        <span className="show-time">{fmtTime(v.showTime)}</span>
                      </div>
                    </td>
                    <td>{v.artistName || '—'}</td>
                    <td><span className={`status-badge ${sc.cls}`}>{sc.label}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn action-email"   title="Send Email"          onClick={() => onSendEmail(v)}>✉️</button>
                        <button className="action-btn action-results" title="View Survey Results"  onClick={() => onViewResults(v)}>📊</button>
                        <button className="action-btn action-edit"    title="Edit"                 onClick={() => onEdit(v)}>✏️</button>
                        <button className="action-btn action-delete"  title="Delete"
                          onClick={() => { if (window.confirm(`Delete "${v.venueName}"?`)) onDelete(v.id) }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
