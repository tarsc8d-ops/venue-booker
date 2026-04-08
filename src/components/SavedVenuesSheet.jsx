import { useState } from 'react'

const EMPTY = { venueName: '', contactName: '', contactEmail: '', city: '', capacity: '', notes: '' }

function VenueForm({ venue, onSave, onClose }) {
  const [form, setForm] = useState(venue ? { ...venue } : { ...EMPTY })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet-tall" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>{venue ? 'Edit Saved Venue' : 'Add to Venue Library'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
          <div className="field">
            <label>Venue Name *</label>
            <input type="text" value={form.venueName} onChange={e => set('venueName', e.target.value)} placeholder="e.g. The Roxy Theatre" autoFocus />
          </div>
          <div className="field">
            <label>City</label>
            <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Atlanta, GA" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Contact Name</label>
              <input type="text" value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Booking manager" />
            </div>
            <div className="field">
              <label>Capacity</label>
              <input type="number" inputMode="numeric" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="500" />
            </div>
          </div>
          <div className="field">
            <label>Contact Email</label>
            <input type="email" inputMode="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="booking@venue.com" />
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Load-in, parking, requirements..." rows={3} />
          </div>
        </div>
        <div className="sheet-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!form.venueName.trim()} onClick={() => form.venueName.trim() && onSave(form)}>
            {venue ? 'Save Changes' : 'Add to Library'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SavedVenuesSheet({ savedVenues, onSave, onDelete, onClose }) {
  const [editing, setEditing] = useState(null) // null | {} (new) | venue obj (edit)

  if (editing !== null) {
    return (
      <VenueForm
        venue={editing.id ? editing : null}
        onSave={(data) => { onSave(editing.id ? { ...editing, ...data } : data); setEditing(null) }}
        onClose={() => setEditing(null)}
      />
    )
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet-tall" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>🏟️ Saved Venues</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '14px', lineHeight: '1.5' }}>
            Your venue library — pull from here when adding a venue to a tour to pre-fill all the details.
          </p>
          <button className="btn-secondary" style={{ width: '100%', marginBottom: '14px', textAlign: 'center', padding: '12px' }}
            onClick={() => setEditing({})}>
            + Add Venue to Library
          </button>
          {savedVenues.length === 0 ? (
            <div className="empty" style={{ padding: '32px 0' }}>
              <div className="empty-emoji">🏟️</div>
              <h3>No saved venues</h3>
              <p>Add venues you work with regularly for fast access when booking.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {savedVenues.map(v => (
                <div key={v.id} className="saved-item-card">
                  <div className="saved-item-info">
                    <div className="saved-item-name">{v.venueName}</div>
                    <div className="saved-item-sub">
                      {[v.city, v.contactName, v.capacity ? `Cap: ${v.capacity}` : null].filter(Boolean).join(' · ')}
                    </div>
                    {v.contactEmail && <div className="saved-item-email">{v.contactEmail}</div>}
                  </div>
                  <div className="saved-item-actions">
                    <button className="template-action-btn" onClick={() => setEditing(v)}>✏️</button>
                    <button className="template-action-btn" onClick={() => { if (confirm(`Remove "${v.venueName}" from library?`)) onDelete(v.id) }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sheet-footer">
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}
