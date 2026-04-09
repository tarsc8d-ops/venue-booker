import { useState } from 'react'

function SurveyLinkForm({ link, onSave, onClose }) {
  const [name,    setName]    = useState(link?.name    || '')
  const [url,     setUrl]     = useState(link?.url     || '')
  const [sheetId, setSheetId] = useState(link?.sheetId || '')
  const ok = name.trim() && url.trim()

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>{link ? 'Edit Survey Link' : 'Add Survey Link'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
          <div className="field">
            <label>Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Summer Tour Survey, General Venue Form" autoFocus />
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '5px' }}>
              A name so you can tell them apart when assigning to a tour.
            </p>
          </div>
          <div className="field">
            <label>Google Form URL *</label>
            <input type="url" inputMode="url" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://forms.gle/..." />
          </div>
          <div className="field">
            <label>Google Sheet ID (optional)</label>
            <input type="text" value={sheetId} onChange={e => setSheetId(e.target.value)}
              placeholder="ID from your linked Sheet URL" />
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '5px' }}>
              Found in the Sheet URL: /spreadsheets/d/<strong>THIS_PART</strong>/edit
            </p>
          </div>
          <div style={{ background: 'var(--accent-light)', borderRadius: '12px', padding: '14px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', lineHeight: '1.6' }}>
              Insert <code style={{ background: 'rgba(124,58,237,0.12)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>{'{{survey_link}}'}</code> in any email template — it auto-fills with this URL when you send.
            </p>
          </div>
        </div>
        <div className="sheet-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!ok}
            onClick={() => ok && onSave({ name: name.trim(), url: url.trim(), sheetId: sheetId.trim() })}>
            {link ? 'Save Changes' : 'Add Survey Link'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SurveyLinksSheet({ surveyLinks, onSave, onDelete, onClose }) {
  const [editing, setEditing] = useState(null)

  if (editing !== null) {
    return (
      <SurveyLinkForm
        link={editing.id ? editing : null}
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
          <h2>🔗 Survey Links</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '16px', lineHeight: '1.5' }}>
            Save your Google Form links with names. Assign a specific survey to each tour so the right link goes into every email automatically.
          </p>
          <button className="btn-secondary"
            style={{ width: '100%', textAlign: 'center', padding: '12px', marginBottom: '14px' }}
            onClick={() => setEditing({})}>
            + Add Survey Link
          </button>

          {surveyLinks.length === 0 ? (
            <div className="empty" style={{ padding: '32px 0' }}>
              <div className="empty-emoji">🔗</div>
              <h3>No survey links yet</h3>
              <p>Add your Google Form links so you can assign them to specific tours.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {surveyLinks.map(link => (
                <div key={link.id} className="saved-item-card">
                  <div className="saved-item-info">
                    <div className="saved-item-name">{link.name}</div>
                    <div className="saved-item-sub" style={{ color: 'var(--accent)', fontSize: '12px' }}>
                      {link.url.length > 44 ? link.url.slice(0, 44) + '…' : link.url}
                    </div>
                    {link.sheetId && <div className="saved-item-sub">Sheet: {link.sheetId.slice(0, 24)}…</div>}
                  </div>
                  <div className="saved-item-actions">
                    <button className="template-action-btn" onClick={() => setEditing(link)}>✏️</button>
                    <button className="template-action-btn"
                      onClick={() => { if (confirm(`Delete "${link.name}"?`)) onDelete(link.id) }}>🗑️</button>
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
