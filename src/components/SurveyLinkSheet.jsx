export default function SurveyLinkSheet({ surveyLink, sheetId, onSurveyLinkChange, onSheetIdChange, onClose }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet-tall" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>🔗 Survey Link</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">

          {/* Google Form */}
          <div className="settings-section">
            <div className="settings-label">Google Form URL</div>
            <input
              type="url"
              inputMode="url"
              className="settings-input"
              value={surveyLink}
              onChange={e => onSurveyLinkChange(e.target.value)}
              placeholder="https://forms.gle/..."
            />
            <p className="settings-hint">
              This is the Google Form you send to venues to collect their information — sound setup, load-in times, contact details, etc.
            </p>
          </div>

          {/* Google Sheets */}
          <div className="settings-section">
            <div className="settings-label">Google Sheet ID (Survey Results)</div>
            <input
              type="text"
              className="settings-input"
              value={sheetId}
              onChange={e => onSheetIdChange(e.target.value)}
              placeholder="Paste the Sheet ID from the URL"
            />
            <p className="settings-hint">
              Found in your Google Sheet URL:{' '}
              <code style={{ background: 'var(--bg)', padding: '1px 5px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                /spreadsheets/d/<strong>THIS_PART</strong>/edit
              </code>
              <br />Used to pull survey responses inside the app.
            </p>
          </div>

          {/* How to use in templates */}
          <div style={{ background: 'var(--accent-light)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', marginBottom: '10px' }}>
              📋 Adding the Survey to an Email Template
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.6', marginBottom: '10px' }}>
              In any email template body, type or insert:
            </p>
            <div style={{
              background: 'var(--surface)', borderRadius: '8px', padding: '10px 14px',
              fontFamily: 'monospace', fontSize: '14px', fontWeight: '600',
              color: 'var(--accent)', letterSpacing: '0.3px', marginBottom: '10px',
              textAlign: 'center',
            }}>
              {'{{survey_link}}'}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.6' }}>
              When you send the email, it automatically replaces <code style={{ fontFamily: 'monospace', fontSize: '12px' }}>{'{{survey_link}}'}</code> with your Google Form URL above.
              Use the <strong>Survey</strong> chip button in the Template Editor to insert it at your cursor.
            </p>
          </div>
        </div>
        <div className="sheet-footer">
          <button className="btn-primary" style={{ width: '100%', textAlign: 'center' }} onClick={onClose}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
