import { useState, useEffect } from 'react'

const COLORS = ['#7C3AED','#2563EB','#059669','#D97706','#DC2626','#DB2777','#0891B2','#64748B']

export default function TourModal({ tour, templates, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    name: '', artist: '', description: '', color: COLORS[0], emailTemplateId: '',
  })

  useEffect(() => {
    if (tour) setForm({
      name:             tour.name            || '',
      artist:           tour.artist          || '',
      description:      tour.description     || '',
      color:            tour.color           || COLORS[0],
      emailTemplateId:  tour.emailTemplateId || '',
    })
  }, [tour])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>{tour ? 'Edit Tour' : 'New Tour'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
          <div className="field">
            <label>Tour Name *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Summer 2026 Tour" autoFocus />
          </div>
          <div className="field">
            <label>Artist / Act</label>
            <input type="text" value={form.artist} onChange={e => set('artist', e.target.value)} placeholder="Artist or group name" />
          </div>

          {templates && templates.length > 0 && (
            <div className="field">
              <label>Default Email Template</label>
              <select value={form.emailTemplateId} onChange={e => set('emailTemplateId', e.target.value)}>
                <option value="">— Pick a template —</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <p style={{ fontSize:'12px', color:'var(--text-3)', marginTop:'5px' }}>
                Pre-fills emails when sending to venues in this tour.
              </p>
            </div>
          )}

          <div className="field">
            <label>Notes</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Anything notable about this tour…" rows={2} />
          </div>
          <div className="field">
            <label>Tour Color</label>
            <div className="color-row">
              {COLORS.map(c => (
                <button key={c} type="button"
                  className={`color-dot ${form.color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => set('color', c)}
                />
              ))}
            </div>
          </div>
          {tour && onDelete && (
            <button type="button"
              style={{ background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:'10px', padding:'12px 16px', width:'100%', fontSize:'14px', fontWeight:'600', cursor:'pointer', marginTop:'8px' }}
              onClick={() => { if (confirm(`Delete "${tour.name}" and all its venues?`)) onDelete() }}
            >
              🗑️ Delete Tour
            </button>
          )}
        </div>
        <div className="sheet-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!form.name} onClick={() => { if (form.name) onSave(form) }}>
            {tour ? 'Save' : 'Create Tour'}
          </button>
        </div>
      </div>
    </div>
  )
}
