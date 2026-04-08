import { useState, useEffect } from 'react'

const EMPTY = {
  venueName: '', contactName: '', contactEmail: '',
  city: '', showDate: '', showTime: '', artistName: '', notes: '', status: 'pending',
}

export default function AddVenueModal({ venue, defaultArtist, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY, artistName: defaultArtist || '' })

  useEffect(() => {
    if (venue) setForm(venue)
  }, [venue])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-medium" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{venue ? '✏️ Edit Venue' : '➕ Add New Venue'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form className="modal-body" onSubmit={e => { e.preventDefault(); if (form.venueName && form.showDate) onSave(form) }}>
          <div className="form-row">
            <div className="form-group">
              <label>Venue Name <span className="required">*</span></label>
              <input type="text" value={form.venueName} onChange={e => set('venueName', e.target.value)} placeholder="e.g. The Roxy Theatre" required />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Atlanta, GA" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Name</label>
              <input type="text" value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Booking Manager" />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="booking@venue.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Show Date <span className="required">*</span></label>
              <input type="date" value={form.showDate} onChange={e => set('showDate', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Show Time</label>
              <input type="time" value={form.showTime} onChange={e => set('showTime', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Artist / Act Name</label>
            <input type="text" value={form.artistName} onChange={e => set('artistName', e.target.value)} placeholder="Performing artist name" />
          </div>
          {venue && (
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="email_sent">Email Sent</option>
                <option value="survey_received">Survey Received</option>
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Load-in time, parking, special requirements..." rows={3} />
          </div>
          <div className="modal-footer" style={{padding:'0',paddingTop:'16px',marginTop:'8px'}}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{venue ? 'Save Changes' : 'Add Venue'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
