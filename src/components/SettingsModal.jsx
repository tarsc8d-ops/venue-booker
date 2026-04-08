import { useState } from 'react'
import TemplateEditor from './TemplateEditor'

export default function SettingsModal({
  auth, surveyLink, onSurveyLinkChange,
  customTemplates, defaultTemplates,
  onSaveTemplate, onDeleteTemplate,
  onSignOut, onClose,
}) {
  const [tab, setTab] = useState('account')
  const [editing, setEditing] = useState(null) // null | 'new' | template obj

  if (editing) {
    return (
      <TemplateEditor
        template={editing === 'new' ? null : editing}
        onSave={(t) => { onSaveTemplate(t); setEditing(null) }}
        onClose={() => setEditing(null)}
      />
    )
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet-tall" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-tabs">
          {[['account','👤 Account'], ['survey','🔗 Survey'], ['templates','✉️ Templates']].map(([id, lbl]) => (
            <button key={id} className={`settings-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {lbl}
            </button>
          ))}
        </div>

        <div className="sheet-body">

          {/* ── ACCOUNT ── */}
          {tab === 'account' && (
            <>
              <div className="settings-section">
                <div className="settings-label">Signed In As</div>
                <div className="account-row">
                  {auth?.picture && (
                    <img src={auth.picture} className="avatar-lg" alt={auth.name} onError={e => { e.target.style.display='none' }} />
                  )}
                  <div>
                    <div className="account-name">{auth?.name}</div>
                    <div className="account-email">{auth?.email}</div>
                  </div>
                </div>
              </div>
              <div className="settings-section">
                <button
                  className="btn-danger"
                  style={{ width: '100%', textAlign: 'center' }}
                  onClick={() => { if (confirm('Sign out?')) { onSignOut(); onClose() } }}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}

          {/* ── SURVEY ── */}
          {tab === 'survey' && (
            <div className="settings-section">
              <div className="settings-label">Google Form Survey Link</div>
              <input
                type="url" inputMode="url"
                className="settings-input"
                value={surveyLink}
                onChange={e => onSurveyLinkChange(e.target.value)}
                placeholder="https://forms.gle/..."
              />
              <p className="settings-hint">
                Included in every email via the <code style={{background:'var(--bg)',padding:'1px 5px',borderRadius:'4px',fontSize:'12px'}}>{'{{survey_link}}'}</code> placeholder.
              </p>
            </div>
          )}

          {/* ── TEMPLATES ── */}
          {tab === 'templates' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                <div className="settings-label" style={{ margin: 0 }}>Email Templates</div>
                <button
                  className="btn-secondary"
                  style={{ padding:'7px 12px', fontSize:'13px', borderRadius:'8px' }}
                  onClick={() => setEditing('new')}
                >
                  + New Template
                </button>
              </div>

              <p style={{ fontSize:'12px', color:'var(--text-2)', marginBottom:'14px', lineHeight:'1.5' }}>
                Use <code style={{background:'var(--bg)',padding:'1px 4px',borderRadius:'3px',fontFamily:'monospace',fontSize:'11px'}}>{'{{venue_name}}'}</code>{' '}
                <code style={{background:'var(--bg)',padding:'1px 4px',borderRadius:'3px',fontFamily:'monospace',fontSize:'11px'}}>{'{{artist}}'}</code>{' '}
                <code style={{background:'var(--bg)',padding:'1px 4px',borderRadius:'3px',fontFamily:'monospace',fontSize:'11px'}}>{'{{date}}'}</code>{' '}
                and more — they auto-fill when you send.
              </p>

              <div className="template-group-label">Built-In Templates</div>
              {defaultTemplates.map(t => (
                <div key={t.id} className="template-list-item">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="template-item-name">{t.name}</div>
                    <div className="template-item-preview">{t.subject}</div>
                  </div>
                </div>
              ))}

              {customTemplates.length > 0 && (
                <>
                  <div className="template-group-label" style={{ marginTop: '18px' }}>My Templates</div>
                  {customTemplates.map(t => (
                    <div key={t.id} className="template-list-item">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="template-item-name">{t.name}</div>
                        <div className="template-item-preview">{t.subject || 'No subject'}</div>
                      </div>
                      <div style={{ display:'flex', gap:'6px', flexShrink:0, marginLeft:'8px' }}>
                        <button className="template-action-btn" onClick={() => setEditing(t)}>✏️</button>
                        <button className="template-action-btn" onClick={() => { if (confirm(`Delete "${t.name}"?`)) onDeleteTemplate(t.id) }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {customTemplates.length === 0 && (
                <div style={{ textAlign:'center', padding:'24px', color:'var(--text-3)', fontSize:'13px', background:'var(--bg)', borderRadius:'12px', marginTop:'12px' }}>
                  No custom templates yet.<br />Tap <strong>+ New Template</strong> to create one.
                </div>
              )}
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
