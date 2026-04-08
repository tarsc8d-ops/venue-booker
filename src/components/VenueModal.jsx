import { useState, useEffect } from 'react'

const EMPTY = { venueName: '', contactName: '', contactEmail: '', city: '', showDate: '', showTime: '', capacity: '', notes: '', status: 'pending' }

export default function VenueModal({ venue, tourId, savedVenues, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY })
  const [saveToLib, setSaveToLib] = useState(false)

  useEffect(() => { setForm(venue ? { ...EMPTY, ...venue } : { ...EMPTY }) }, [venue])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const ok = form.venueName.trim() && form.showDate

  // Pre-fill form from a saved venue
  const applySaved = (id) => {
    if (!id) return
    const sv = savedVenues?.find(v => v.id === id)
    if (!sv) return
    setForm(f => ({
      ...f,
      venueName:    sv.venueName    || f.venueName,
      city:         sv.city         || f.city,
      contactName:  sv.contactName  || f.contactName,
      contactEmail: sv.contactEmail || f.contactEmail,
      capacity:     sv.capacity     || f.capacity,
      notes:        sv.notes        || f.notes,
    }))
  }

  const handleSave = () => {
    if (!ok) return
    onSave({ ...form, tourId, _saveToLib: !venue && saveToLib })
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet-tall" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>{venue ? 'Edit Venue' : 'Add Venue'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">

          {/* Saved venue picker — only show when creating new */}
          {!venue && savedVenues?.length > 0 && (
            <div className="field">
              <label>Use Saved Venue</label>
              <select defaultValue="" onChange={e => applySaved(e.target.value)}>
                <option value="">— Pick from your library —</option>
                {savedVenues.map(sv => (
                  <option key={sv.id} value={sv.id}>
                    {sv.venueName}{sv.city ? ` · ${sv.city}` : ''}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '5px' }}>
                Selecting fills in the details below. You can still edit them.
              </p>
            </div>
          )}

          <div className="field">
            <label>Venue Name *</label>
            <input type="text" value={form.venueName} onChange={e => set('venueName', e.target.value)} placeholder="e.g. The Roxy Theatre" />
          </div>
          <div className="field-row">
            <div className="field"><label>Show Date *</label><input type="date" value={form.showDate} onChange={e => set('showDate', e.target.value)} /></div>
            <div className="field"><label>Show Time</label><input type="time" value={form.showTime} onChange={e => set('showTime', e.target.value)} /></div>
          </div>
          <div className="field">
            <label>City</label>
            <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Atlanta, GA" />
          </div>
          <div className="field-row">
            <div className="field"><label>Contact Name</label><input type="text" value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Booking manager" /></div>
            <div className="field"><label>Capacity</label><input type="number" inputMode="numeric" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="500" /></div>
          </div>
          <div className="field">
            <label>Contact Email</label>
            <input type="email" inputMode="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="booking@venue.com" />
          </div>
          {venue && (
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="email_sent">Email Sent</option>
                <option value="confirmed">Confirmed ✓</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
          <div className="field">
            <label>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Load-in, parking, requirements…" rows={3} />
          </div>

          {/* Save to library checkbox — only on new venues */}
          {!venue && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-2)', marginTop: '4px', cursor: 'pointer' }}>
              <input type="checkbox" checked={saveToLib} onChange={e => setSaveToLib(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              Also save this venue to my library
            </label>
          )}
        </div>
        <div className="sheet-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!ok} onClick={handleSave}>
            {venue ? 'Save Changes' : 'Add Venue'}
          </button>
        </div>
      </div>
    </div>
  )
}
