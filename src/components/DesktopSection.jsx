import { useState } from 'react'
import TemplateEditor from './TemplateEditor'

// ── Shared page shell ────────────────────────────────────────────────────────
function PageShell({ icon, title, action, children }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Page header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '22px 28px 0', flexShrink: 0,
      }}>
        <div style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.3px' }}>
          {icon} {title}
        </div>
        {action}
      </div>
      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 28px 32px' }}>
        {children}
      </div>
    </div>
  )
}

// ── Saved Venues ─────────────────────────────────────────────────────────────
function VenueForm({ venue, onSave, onClose }) {
  const EMPTY = { venueName: '', contactName: '', contactEmail: '', city: '', capacity: '', notes: '' }
  const [form, setForm] = useState(venue ? { ...venue } : EMPTY)
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
          <div className="field"><label>Venue Name *</label>
            <input type="text" value={form.venueName} onChange={e => set('venueName', e.target.value)} placeholder="e.g. The Roxy Theatre" autoFocus /></div>
          <div className="field"><label>City</label>
            <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Atlanta, GA" /></div>
          <div className="field-row">
            <div className="field"><label>Contact Name</label>
              <input type="text" value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Booking manager" /></div>
            <div className="field"><label>Capacity</label>
              <input type="number" inputMode="numeric" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="500" /></div>
          </div>
          <div className="field"><label>Contact Email</label>
            <input type="email" inputMode="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="booking@venue.com" /></div>
          <div className="field"><label>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Load-in, parking, requirements..." rows={3} /></div>
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

function SavedVenuesPage({ savedVenues, onSave, onDelete }) {
  const [editing, setEditing] = useState(null)
  return (
    <PageShell icon="🏟️" title="Saved Venues"
      action={<button className="btn-primary" style={{ padding: '10px 18px', fontSize: '14px', borderRadius: '10px' }} onClick={() => setEditing({})}>+ Add Venue</button>}>
      {editing !== null && (
        <VenueForm
          venue={editing.id ? editing : null}
          onSave={(data) => { onSave(editing.id ? { ...editing, ...data } : data); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
      <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '16px', lineHeight: '1.5' }}>
        Your venue library — pull from here when adding a venue to a tour to pre-fill details.
      </p>
      {savedVenues.length === 0 ? (
        <div className="empty"><div className="empty-emoji">🏟️</div><h3>No saved venues</h3>
          <p>Add venues you work with regularly for fast access when booking.</p>
          <button className="btn-primary" onClick={() => setEditing({})}>+ Add First Venue</button></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
          {savedVenues.map(v => (
            <div key={v.id} className="saved-item-card">
              <div className="saved-item-info">
                <div className="saved-item-name">{v.venueName}</div>
                <div className="saved-item-sub">{[v.city, v.contactName, v.capacity ? `Cap: ${v.capacity}` : null].filter(Boolean).join(' · ')}</div>
                {v.contactEmail && <div className="saved-item-email">{v.contactEmail}</div>}
              </div>
              <div className="saved-item-actions">
                <button className="template-action-btn" onClick={() => setEditing(v)}>✏️</button>
                <button className="template-action-btn" onClick={() => { if (confirm(`Remove "${v.venueName}"?`)) onDelete(v.id) }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}

// ── Saved Artists ────────────────────────────────────────────────────────────
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
          <div className="field"><label>Artist / Act Name *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Artist or group name" autoFocus /></div>
          <div className="field"><label>Genre</label>
            <input type="text" value={form.genre} onChange={e => set('genre', e.target.value)} placeholder="Hip-hop, R&B, Pop..." /></div>
          <div className="field"><label>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Bio, requirements, links..." rows={3} /></div>
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

function SavedArtistsPage({ savedArtists, onSave, onDelete }) {
  const [editing, setEditing] = useState(null)
  return (
    <PageShell icon="🎤" title="Saved Artists"
      action={<button className="btn-primary" style={{ padding: '10px 18px', fontSize: '14px', borderRadius: '10px' }} onClick={() => setEditing({})}>+ Add Artist</button>}>
      {editing !== null && (
        <ArtistForm
          artist={editing.id ? editing : null}
          onSave={(data) => { onSave(editing.id ? { ...editing, ...data } : data); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
      <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '16px', lineHeight: '1.5' }}>
        Artists you manage or work with — quickly assign them to tours.
      </p>
      {savedArtists.length === 0 ? (
        <div className="empty"><div className="empty-emoji">🎤</div><h3>No artists yet</h3>
          <p>Add artists you manage so you can quickly assign them to tours.</p>
          <button className="btn-primary" onClick={() => setEditing({})}>+ Add First Artist</button></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
          {savedArtists.map(a => (
            <div key={a.id} className="saved-item-card">
              <div className="saved-item-info">
                <div className="saved-item-name">{a.name}</div>
                {a.genre && <div className="saved-item-sub">{a.genre}</div>}
                {a.notes && <div className="saved-item-sub" style={{ fontStyle: 'italic' }}>{a.notes.slice(0, 60)}{a.notes.length > 60 ? '…' : ''}</div>}
              </div>
              <div className="saved-item-actions">
                <button className="template-action-btn" onClick={() => setEditing(a)}>✏️</button>
                <button className="template-action-btn" onClick={() => { if (confirm(`Remove "${a.name}"?`)) onDelete(a.id) }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}

// ── Email Templates ──────────────────────────────────────────────────────────
function TemplatePreview({ template, isDefault, onEdit, onDuplicate, onDelete, onClose }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet-tall" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <button className="back-btn" style={{ fontSize: '22px', marginLeft: '-6px' }} onClick={onClose}>‹</button>
          <h2 style={{ flex: 1, fontSize: '16px' }}>{template.name}</h2>
          <div style={{ width: '40px' }} />
        </div>
        <div className="sheet-body">
          <div style={{ marginBottom: '16px' }}>
            <div className="settings-label">Subject</div>
            <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', fontWeight: '500' }}>{template.subject || '(no subject)'}</div>
          </div>
          <div>
            <div className="settings-label">Body</div>
            <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '14px', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{template.body}</div>
          </div>
          <div style={{ marginTop: '16px', padding: '12px 14px', background: 'var(--accent-light)', borderRadius: '10px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', lineHeight: '1.5' }}>
              Fields like <code style={{ background: 'rgba(124,58,237,0.1)', padding: '1px 4px', borderRadius: '3px' }}>{'{{venue_name}}'}</code>, <code style={{ background: 'rgba(124,58,237,0.1)', padding: '1px 4px', borderRadius: '3px' }}>{'{{artist}}'}</code>, and <code style={{ background: 'rgba(124,58,237,0.1)', padding: '1px 4px', borderRadius: '3px' }}>{'{{survey_link}}'}</code> auto-fill when you send.
            </p>
          </div>
        </div>
        <div className="sheet-footer" style={{ flexDirection: 'column', gap: '8px' }}>
          {isDefault ? (
            <button className="btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={onDuplicate}>📋 Duplicate & Customize</button>
          ) : (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { if (confirm(`Delete "${template.name}"?`)) onDelete() }}>🗑️ Delete</button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={onEdit}>✏️ Edit Template</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const DEFAULT_TEMPLATE_IDS = ['tpl-standard', 'tpl-inquiry', 'tpl-followup']

function EmailTemplatesPage({ customTemplates, defaultTemplates, onSaveTemplate, onDeleteTemplate }) {
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)

  const handleDuplicate = (tpl) => {
    setViewing(null)
    setEditing({ name: `${tpl.name} (Copy)`, subject: tpl.subject, body: tpl.body, isDefault: false })
  }

  if (editing) {
    return (
      <TemplateEditor
        template={editing.id ? editing : (editing.name ? editing : null)}
        onSave={(t) => { onSaveTemplate(t); setEditing(null) }}
        onClose={() => setEditing(null)}
      />
    )
  }

  if (viewing) {
    const isDefault = DEFAULT_TEMPLATE_IDS.includes(viewing.id)
    return (
      <TemplatePreview
        template={viewing} isDefault={isDefault}
        onEdit={() => { setViewing(null); setEditing(viewing) }}
        onDuplicate={() => handleDuplicate(viewing)}
        onDelete={() => { onDeleteTemplate(viewing.id); setViewing(null) }}
        onClose={() => setViewing(null)}
      />
    )
  }

  return (
    <PageShell icon="✉️" title="Email Templates"
      action={<button className="btn-primary" style={{ padding: '10px 18px', fontSize: '14px', borderRadius: '10px' }} onClick={() => setEditing('new')}>+ New Template</button>}>
      <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '20px', lineHeight: '1.5' }}>
        Tap any template to view or edit it. Assign a template to a tour so emails auto-fill when you send.
      </p>

      <div className="template-group-label">Built-In Templates</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        {defaultTemplates.map(t => (
          <button key={t.id} className="template-list-item" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none' }} onClick={() => setViewing(t)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="template-item-name">{t.name}</div>
              <div className="template-item-preview">{t.subject}</div>
            </div>
            <span style={{ color: 'var(--text-3)', fontSize: '18px' }}>›</span>
          </button>
        ))}
      </div>

      <div className="template-group-label">My Templates</div>
      {customTemplates.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {customTemplates.map(t => (
            <button key={t.id} className="template-list-item" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none' }} onClick={() => setViewing(t)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="template-item-name">{t.name}</div>
                <div className="template-item-preview">{t.subject || 'No subject'}</div>
              </div>
              <span style={{ color: 'var(--text-3)', fontSize: '18px' }}>›</span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-3)', fontSize: '13px', background: 'var(--surface)', borderRadius: '12px' }}>
          No custom templates yet.<br />
          <span style={{ color: 'var(--text-2)' }}>Click "New Template" or duplicate a built-in.</span>
        </div>
      )}
    </PageShell>
  )
}

// ── Survey Links ─────────────────────────────────────────────────────────────
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
          <div className="field"><label>Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Summer Tour Survey" autoFocus /></div>
          <div className="field"><label>Google Form URL *</label>
            <input type="url" inputMode="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://forms.gle/..." /></div>
          <div className="field"><label>Google Sheet ID (optional)</label>
            <input type="text" value={sheetId} onChange={e => setSheetId(e.target.value)} placeholder="ID from your linked Sheet URL" />
            <p className="settings-hint">Found in Sheet URL: /spreadsheets/d/<strong>THIS_PART</strong>/edit</p></div>
          <div style={{ background: 'var(--accent-light)', borderRadius: '12px', padding: '14px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', lineHeight: '1.6' }}>
              Use <code style={{ background: 'rgba(124,58,237,0.12)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>{'{{survey_link}}'}</code> in email templates — it auto-fills with this URL when you send.
            </p>
          </div>
        </div>
        <div className="sheet-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!ok} onClick={() => ok && onSave({ name: name.trim(), url: url.trim(), sheetId: sheetId.trim() })}>
            {link ? 'Save Changes' : 'Add Survey Link'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SurveyLinksPage({ surveyLinks, onSave, onDelete }) {
  const [editing, setEditing] = useState(null)
  return (
    <PageShell icon="🔗" title="Survey Links"
      action={<button className="btn-primary" style={{ padding: '10px 18px', fontSize: '14px', borderRadius: '10px' }} onClick={() => setEditing({})}>+ Add Survey Link</button>}>
      {editing !== null && (
        <SurveyLinkForm
          link={editing.id ? editing : null}
          onSave={(data) => { onSave(editing.id ? { ...editing, ...data } : data); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
      <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '16px', lineHeight: '1.5' }}>
        Save your Google Form links with names. Assign a specific survey to each tour so the right link goes into every email automatically.
      </p>
      {surveyLinks.length === 0 ? (
        <div className="empty"><div className="empty-emoji">🔗</div><h3>No survey links yet</h3>
          <p>Add your Google Form links so you can assign them to specific tours.</p>
          <button className="btn-primary" onClick={() => setEditing({})}>+ Add First Survey Link</button></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '10px' }}>
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
                <button className="template-action-btn" onClick={() => { if (confirm(`Delete "${link.name}"?`)) onDelete(link.id) }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}

// ── Account ──────────────────────────────────────────────────────────────────
function AccountPage({ auth, onSignOut }) {
  return (
    <PageShell icon="⚙️" title="Account">
      <div style={{ maxWidth: '480px' }}>
        <div className="settings-section">
          <div className="settings-label">Signed In As</div>
          <div className="account-row">
            {auth?.picture && (
              <img src={auth.picture} className="avatar-lg" alt={auth.name} onError={e => { e.target.style.display = 'none' }} />
            )}
            <div>
              <div className="account-name">{auth?.name}</div>
              <div className="account-email">{auth?.email}</div>
            </div>
          </div>
        </div>
        <div className="settings-section">
          <p className="settings-hint" style={{ marginBottom: '14px', lineHeight: '1.6' }}>
            Your Gmail account is used to send booking emails directly from your address. You'll be asked to re-authenticate after about 1 hour.
          </p>
          <button className="btn-danger" style={{ width: '100%', textAlign: 'center' }}
            onClick={() => { if (confirm('Sign out?')) onSignOut() }}>
            Sign Out
          </button>
        </div>
      </div>
    </PageShell>
  )
}

// ── Router ───────────────────────────────────────────────────────────────────
export default function DesktopSection({ section, ...props }) {
  switch (section) {
    case 'saved-venues':  return <SavedVenuesPage   {...props} />
    case 'saved-artists': return <SavedArtistsPage  {...props} />
    case 'templates':     return <EmailTemplatesPage {...props} />
    case 'survey':        return <SurveyLinksPage   {...props} />
    case 'settings':      return <AccountPage       {...props} />
    default:              return null
  }
}
