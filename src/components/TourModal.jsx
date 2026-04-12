import { useState, useEffect, useRef } from 'react'
import { isNative } from '../lib/platform'

const COLORS = ['#7C3AED','#2563EB','#059669','#D97706','#DC2626','#DB2777','#0891B2','#64748B']

/** After bottom-sheet slideUp (0.28s in CSS), focus keyboard — avoids WKWebView toolbar constraint churn + delay when autoFocus races the animation. */
const NATIVE_NAME_FOCUS_MS = 320

export default function TourModal({ tour, templates, savedArtists, surveyLinks, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    name: '', artist: '', description: '', color: COLORS[0], emailTemplateId: '', surveyLinkId: '',
  })
  const nameInputRef = useRef(null)

  useEffect(() => {
    if (tour) setForm({
      name:            tour.name            || '',
      artist:          tour.artist          || '',
      description:     tour.description     || '',
      color:           tour.color           || COLORS[0],
      emailTemplateId: tour.emailTemplateId || '',
      surveyLinkId:    tour.surveyLinkId    || '',
    })
  }, [tour])

  useEffect(() => {
    if (!isNative()) return
    const id = window.setTimeout(() => {
      nameInputRef.current?.focus({ preventScroll: true })
    }, NATIVE_NAME_FOCUS_MS)
    return () => clearTimeout(id)
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
            <input ref={nameInputRef} type="text" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Summer 2026 Tour" autoFocus={!isNative()} />
          </div>

          <div className="field">
            <label>Artist / Act</label>
            {savedArtists?.length > 0 && (
              <div className="artist-chips-scroll" style={{ marginBottom: '8px' }}>
                {savedArtists.map(a => (
                  <button key={a.id} type="button"
                    className={`artist-chip ${form.artist === a.name ? 'selected' : ''}`}
                    onClick={() => set('artist', form.artist === a.name ? '' : a.name)}>
                    {a.name}
                  </button>
                ))}
              </div>
            )}
            <input type="text" value={form.artist} onChange={e => set('artist', e.target.value)}
              placeholder={savedArtists?.length > 0 ? 'Tap a chip above or type a name' : 'Artist or group name'} />
          </div>

          {templates?.length > 0 && (
            <div className="field">
              <label>Default Email Template</label>
              <select value={form.emailTemplateId} onChange={e => set('emailTemplateId', e.target.value)}>
                <option value="">— Pick a template —</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '5px' }}>
                Pre-fills emails when sending to venues in this tour.
              </p>
            </div>
          )}

          <div className="field">
            <label>Survey Link</label>
            <select value={form.surveyLinkId} onChange={e => set('surveyLinkId', e.target.value)}>
              <option value="">
                {surveyLinks?.length > 0 ? '— Pick a survey link —' : '— No saved survey links yet —'}
              </option>
              {surveyLinks?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '5px' }}>
              The Google Form URL included in emails for this tour. Add links via Survey Links in the menu.
            </p>
          </div>

          <div className="field">
            <label>Notes</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Anything notable about this tour…" rows={2} />
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
              style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '10px', padding: '12px 16px', width: '100%', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
              onClick={() => { if (confirm(`Delete "${tour.name}" and all its venues?`)) onDelete() }}>
              🗑️ Delete Tour
            </button>
          )}
        </div>
        <div className="sheet-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!form.name} onClick={() => form.name && onSave(form)}>
            {tour ? 'Save' : 'Create Tour'}
          </button>
        </div>
      </div>
    </div>
  )
}
