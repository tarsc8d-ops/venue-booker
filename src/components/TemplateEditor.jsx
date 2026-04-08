import { useState, useRef } from 'react'

const FIELDS = [
  { tag: '{{venue_name}}',   label: 'Venue' },
  { tag: '{{contact_name}}', label: 'Contact' },
  { tag: '{{artist}}',       label: 'Artist' },
  { tag: '{{date}}',         label: 'Date' },
  { tag: '{{time}}',         label: 'Time' },
  { tag: '{{city}}',         label: 'City' },
  { tag: '{{survey_link}}',  label: 'Survey' },
]

export default function TemplateEditor({ template, onSave, onClose }) {
  const [name,    setName]    = useState(template?.name    || '')
  const [subject, setSubject] = useState(template?.subject || '')
  const [body,    setBody]    = useState(template?.body    || '')
  const bodyRef = useRef(null)

  const insertField = (tag) => {
    const el = bodyRef.current
    if (!el) { setBody(b => b + tag); return }
    const start = el.selectionStart
    const end   = el.selectionEnd
    setBody(body.slice(0, start) + tag + body.slice(end))
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + tag.length, start + tag.length)
    }, 0)
  }

  const handleSave = () => {
    if (!name.trim() || !body.trim()) return
    onSave({
      id: template?.id || `custom-${Date.now()}`,
      name: name.trim(),
      subject: subject.trim(),
      body: body.trim(),
      isDefault: false,
      createdAt: template?.createdAt || new Date().toISOString(),
    })
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet-tall" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>{template ? 'Edit Template' : 'New Template'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
          <div className="field">
            <label>Template Name *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Tour Announcement" autoFocus
            />
          </div>
          <div className="field">
            <label>Email Subject</label>
            <input
              type="text" value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Upcoming Show: {{artist}} @ {{venue_name}}"
            />
          </div>
          <div className="field">
            <label>Insert Field</label>
            <div className="field-chips-scroll">
              {FIELDS.map(f => (
                <button key={f.tag} type="button" className="field-chip" onClick={() => insertField(f.tag)}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{fontSize:'12px', color:'var(--text-3)', marginTop:'6px'}}>
              Tap a field to insert it at your cursor. It auto-fills with real data when you send.
            </div>
          </div>
          <div className="field">
            <label>Email Body *</label>
            <textarea
              ref={bodyRef}
              className="email-body"
              style={{ minHeight: '220px' }}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder={`Hi {{contact_name}},\n\nWe're excited about an upcoming show at {{venue_name}}...\n\n{{survey_link}}`}
              rows={12}
            />
          </div>
        </div>
        <div className="sheet-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!name.trim() || !body.trim()} onClick={handleSave}>
            {template ? 'Save Changes' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  )
}
