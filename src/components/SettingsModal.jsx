export default function SettingsModal({ auth, surveyLink, onSurveyLinkChange, onSignOut, onClose }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
          <div className="settings-section">
            <div className="settings-label">Account</div>
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
            <div className="settings-label">Survey Link</div>
            <input
              type="url" inputMode="url"
              className="settings-input"
              value={surveyLink}
              onChange={e => onSurveyLinkChange(e.target.value)}
              placeholder="https://forms.gle/..."
            />
            <p className="settings-hint">This link is included in every venue email you send.</p>
          </div>

          <div className="settings-section">
            <div className="settings-label">Environment Variables Needed</div>
            <div style={{ background:'var(--bg)', borderRadius:'12px', padding:'14px', fontSize:'13px', color:'var(--text-2)', lineHeight:'1.8' }}>
              <div>• <strong>VITE_GOOGLE_CLIENT_ID</strong> — Google OAuth client ID</div>
              <div>• <strong>GOOGLE_SHEETS_ID</strong> — Survey results spreadsheet</div>
              <div>• <strong>GOOGLE_SERVICE_ACCOUNT_EMAIL</strong></div>
              <div>• <strong>GOOGLE_SERVICE_ACCOUNT_KEY</strong></div>
              <div style={{marginTop:'8px', fontSize:'12px', color:'var(--text-3)'}}>Set these in Netlify → Site Settings → Environment Variables</div>
            </div>
          </div>
        </div>
        <div className="sheet-footer">
          <button className="btn-danger" onClick={() => { if (confirm('Sign out?')) { onSignOut(); onClose() } }}>Sign Out</button>
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}
