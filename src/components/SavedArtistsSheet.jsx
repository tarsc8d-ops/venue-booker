import { useState } from 'react'

function ArtistForm({ artist, onSave, onClose }) {
  const [form, setForm] = useState(artist ? { ...artist } : { name: '', genre: '', notes: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>{artist ? 'Edit Artist' : 'Add Artist'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
          <div className="field">
            <label>Artist / Act Name *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. DJ Marcus" autoFocus />
          </div>
          <div className="field">
            <label>Genre</label>
            <input type="text" value={form.genre} onChange={e => set('genre', e.target.value)} placeholder="e.g. Hip-Hop, R&B" />
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Stage requirements, rider notes..." rows={3} />
          </div>
        </div>
        <div className="sheet-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!form.name.trim()} onClick={() => form.name.trim() && onSave(form)}>
            {artist ? 'Save Changes' : 'Add Artist'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SavedArtistsSheet({ savedArtists, onSave, onDelete, onClose }) {
  const [editing, setEditing] = useState(null)

  if (editing !== null) {
    return (
      <ArtistForm
        artist={editing.id ? editing : null}
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
          <h2>🎤 Saved Artists</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '14px', lineHeight: '1.5' }}>
            Save your artists so you can quickly select them when creating tours.
          </p>
          <button className="btn-secondary" style={{ width: '100%', marginBottom: '14px', textAlign: 'center', padding: '12px' }}
            onClick={() => setEditing({})}>
            + Add Artist
          </button>
          {savedArtists.length === 0 ? (
            <div className="empty" style={{ padding: '32px 0' }}>
              <div className="empty-emoji">🎤</div>
              <h3>No saved artists</h3>
              <p>Add your artists or acts to quickly select them when creating tours.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {savedArtists.map(a => (
                <div key={a.id} className="saved-item-card">
                  <div className="saved-item-info">
                    <div className="saved-item-name">{a.name}</div>
                    {a.genre && <div className="saved-item-sub">{a.genre}</div>}
                    {a.notes && <div className="saved-item-sub" style={{ fontStyle: 'italic' }}>{a.notes}</div>}
                  </div>
                  <div className="saved-item-actions">
                    <button className="template-action-btn" onClick={() => setEditing(a)}>✏️</button>
                    <button className="template-action-btn" onClick={() => { if (confirm(`Remove "${a.name}"?`)) onDelete(a.id) }}>🗑️</button>
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
