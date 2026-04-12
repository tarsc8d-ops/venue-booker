import { useState } from 'react'
import { SearchIcon, XIcon } from './Icons'

const EMPTY = { venueName: '', contactName: '', contactEmail: '', city: '', capacity: '', notes: '' }

function VenueForm({ venue, onSave, onClose }) {
  const [form, setForm] = useState(venue ? { ...venue } : { ...EMPTY })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="mobile-page mobile-page-form">
      <div className="mobile-page-header">
        <button type="button" className="back-btn" onClick={onClose} aria-label="Back">‹</button>
        <h1 className="mobile-page-title">{venue ? 'Edit venue' : 'Add venue'}</h1>
      </div>
      <div className="mobile-page-body">
        <div className="field">
          <label>Venue Name *</label>
          <input type="text" value={form.venueName} onChange={(e) => set('venueName', e.target.value)} placeholder="e.g. The Roxy Theatre" />
        </div>
        <div className="field">
          <label>City</label>
          <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Atlanta, GA" />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Contact Name</label>
            <input type="text" value={form.contactName} onChange={(e) => set('contactName', e.target.value)} />
          </div>
          <div className="field">
            <label>Capacity</label>
            <input type="number" inputMode="numeric" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Contact Email</label>
          <input type="email" inputMode="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
        </div>
        <div className="field">
          <label>Notes</label>
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} />
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ width: '100%', marginTop: '12px' }}
          disabled={!form.venueName.trim()}
          onClick={() => form.venueName.trim() && onSave(venue ? { ...venue, ...form } : form)}
        >
          {venue ? 'Save' : 'Add to library'}
        </button>
      </div>
    </div>
  )
}

export default function MobileVenuesPage({ savedVenues, onSave, onDelete }) {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)

  const filtered = savedVenues.filter((v) =>
    !search
    || v.venueName?.toLowerCase().includes(search.toLowerCase())
    || v.city?.toLowerCase().includes(search.toLowerCase()))

  if (editing !== null) {
    return (
      <VenueForm
        venue={editing.id ? editing : null}
        onSave={(data) => { onSave(editing.id ? { ...editing, ...data } : data); setEditing(null) }}
        onClose={() => setEditing(null)}
      />
    )
  }

  const openMapsDiscover = () => {
    window.open('https://www.google.com/maps/search/music+venues+near+me/', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="mobile-page">
      <div className="mobile-page-header">
        <h1 className="mobile-page-title">Venues</h1>
      </div>
      <div className="mobile-page-body mobile-page-scroll">
        <div className="mobile-discover-card">
          <div className="mobile-discover-title">Discover venues</div>
          <p className="mobile-discover-copy">
            Search nearby music venues on Google Maps. Saved venues you add below sync across your devices.
          </p>
          <button type="button" className="btn-primary mobile-discover-btn" onClick={openMapsDiscover}>
            Open Google Maps
          </button>
        </div>

        <div className="mobile-section-label">Your library</div>
        <button type="button" className="btn-secondary" style={{ width: '100%', marginBottom: '12px', padding: '12px' }} onClick={() => setEditing({})}>
          + Add venue to library
        </button>

        <div className="search-input-wrap" style={{ marginBottom: '12px' }}>
          <span className="search-icon-inner"><SearchIcon width={15} height={15} /></span>
          <input
            className="search-input"
            type="search"
            placeholder="Search saved venues…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="clear-btn" onClick={() => setSearch('')}><XIcon width={16} height={16} /></button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="empty" style={{ padding: '40px 0' }}>
            <div className="empty-emoji">🏟️</div>
            <h3>No saved venues</h3>
            <p>Add venues you book often for quick access when building tours.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((v) => (
              <div key={v.id} className="saved-item-card">
                <div className="saved-item-info">
                  <div className="saved-item-name">{v.venueName}</div>
                  <div className="saved-item-sub">
                    {[v.city, v.contactName, v.capacity ? `Cap: ${v.capacity}` : null].filter(Boolean).join(' · ')}
                  </div>
                  {v.contactEmail && <div className="saved-item-email">{v.contactEmail}</div>}
                </div>
                <div className="saved-item-actions">
                  <button type="button" className="template-action-btn" onClick={() => setEditing(v)}>✏️</button>
                  <button
                    type="button"
                    className="template-action-btn"
                    onClick={() => { if (confirm(`Remove "${v.venueName}"?`)) onDelete(v.id) }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mobile-page-bottom-spacer" aria-hidden />
      </div>
    </div>
  )
}
