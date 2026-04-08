import { useState } from 'react'
import TemplateEditor from './TemplateEditor'

// Read-only preview of a template
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
            <div style={{
              background: 'var(--bg)', borderRadius: '10px', padding: '12px 14px',
              fontSize: '14px', fontWeight: '500', color: 'var(--text)',
            }}>
              {template.subject || '(no subject)'}
            </div>
          </div>
          <div>
            <div className="settings-label">Body</div>
            <div style={{
              background: 'var(--bg)', borderRadius: '10px', padding: '14px',
              fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap',
              color: 'var(--text)', fontFamily: 'monospace',
            }}>
              {template.body}
            </div>
          </div>
          <div style={{ marginTop: '16px', padding: '12px 14px', background: 'var(--accent-light)', borderRadius: '10px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', lineHeight: '1.5' }}>
              💡 Fields like <code style={{ background: 'rgba(124,58,237,0.1)', padding: '1px 4px', borderRadius: '3px' }}>{'{{venue_name}}'}</code>, <code style={{ background: 'rgba(124,58,237,0.1)', padding: '1px 4px', borderRadius: '3px' }}>{'{{artist}}'}</code>, and <code style={{ background: 'rgba(124,58,237,0.1)', padding: '1px 4px', borderRadius: '3px' }}>{'{{survey_link}}'}</code> auto-fill with real data when you send an email.
            </p>
          </div>
        </div>
        <div className="sheet-footer" style={{ flexDirection: 'column', gap: '8px' }}>
          {isDefault ? (
            <button className="btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={onDuplicate}>
              📋 Duplicate & Customize
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button className="btn-ghost" style={{ flex: 1, textAlign: 'center' }}
                onClick={() => { if (confirm(`Delete "${template.name}"?`)) onDelete() }}>
                🗑️ Delete
              </button>
              <button className="btn-primary" style={{ flex: 2, textAlign: 'center' }} onClick={onEdit}>
                ✏️ Edit Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EmailTemplatesSheet({
  customTemplates, defaultTemplates,
  onSaveTemplate, onDeleteTemplate,
  onClose,
}) {
  const [viewing,  setViewing]  = useState(null)  // template obj being previewed
  const [editing,  setEditing]  = useState(null)  // null | 'new' | template obj

  // When duplicating a built-in, pre-fill the editor with its content (minus the id)
  const handleDuplicate = (tpl) => {
    setViewing(null)
    setEditing({ name: `${tpl.name} (Copy)`, subject: tpl.subject, body: tpl.body, isDefault: false })
  }

  const handleEdit = (tpl) => {
    setViewing(null)
    setEditing(tpl)
  }

  const handleDelete = (tpl) => {
    onDeleteTemplate(tpl.id)
    setViewing(null)
  }

  // ── EDITING / CREATING ──
  if (editing) {
    return (
      <TemplateEditor
        template={editing === 'new' ? null : editing}
        onSave={(t) => { onSaveTemplate(t); setEditing(null) }}
        onClose={() => setEditing(null)}
      />
    )
  }

  // ── VIEWING A TEMPLATE ──
  if (viewing) {
    const isDefault = defaultTemplates.some(t => t.id === viewing.id)
    return (
      <TemplatePreview
        template={viewing}
        isDefault={isDefault}
        onEdit={() => handleEdit(viewing)}
        onDuplicate={() => handleDuplicate(viewing)}
        onDelete={() => handleDelete(viewing)}
        onClose={() => setViewing(null)}
      />
    )
  }

  // ── TEMPLATE LIST ──
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet-tall" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>✉️ Email Templates</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '16px', lineHeight: '1.5' }}>
            Tap any template to view or edit it. Assign a template to a tour so emails auto-fill when you send.
          </p>

          {/* ── BUILT-IN TEMPLATES ── */}
          <div className="template-group-label">Built-In Templates</div>
          {defaultTemplates.map(t => (
            <button
              key={t.id}
              className="template-list-item"
              style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none' }}
              onClick={() => setViewing(t)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="template-item-name">{t.name}</div>
                <div className="template-item-preview">{t.subject}</div>
              </div>
              <span style={{ color: 'var(--text-3)', fontSize: '18px', flexShrink: 0 }}>›</span>
            </button>
          ))}

          {/* ── MY TEMPLATES ── */}
          <div className="template-group-label" style={{ marginTop: '20px' }}>My Templates</div>
          {customTemplates.length > 0 ? (
            customTemplates.map(t => (
              <button
                key={t.id}
                className="template-list-item"
                style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none' }}
                onClick={() => setViewing(t)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="template-item-name">{t.name}</div>
                  <div className="template-item-preview">{t.subject || 'No subject'}</div>
                </div>
                <span style={{ color: 'var(--text-3)', fontSize: '18px', flexShrink: 0 }}>›</span>
              </button>
            ))
          ) : (
            <div style={{
              textAlign: 'center', padding: '20px', color: 'var(--text-3)',
              fontSize: '13px', background: 'var(--bg)', borderRadius: '12px',
            }}>
              No custom templates yet.<br />
              <span style={{ color: 'var(--text-2)' }}>Tap "New Template" or duplicate a built-in.</span>
            </div>
          )}
        </div>
        <div className="sheet-footer">
          <button className="btn-primary" style={{ width: '100%', textAlign: 'center' }}
            onClick={() => setEditing('new')}>
            + New Template
          </button>
        </div>
      </div>
    </div>
  )
}
