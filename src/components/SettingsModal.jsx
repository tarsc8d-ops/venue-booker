export default function SettingsModal({ auth, onSignOut, onClose }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>⚙️ Account</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
          <div className="settings-section">
            <div className="settings-label">Signed In As</div>
            <div className="account-row">
              {auth?.picture && (
                <img src={auth.picture} className="avatar-lg" alt={auth.name}
                  onError={e => { e.target.style.display = 'none' }} />
              )}
              <div>
                <div className="account-name">{auth?.name}</div>
                <div className="account-email">{auth?.email}</div>
              </div>
            </div>
          </div>
          <div className="settings-section">
            <p className="settings-hint" style={{ marginBottom: '14px' }}>
              Your Gmail account is used to send booking emails directly from your address.
              You'll be asked to re-authenticate after about 1 hour.
            </p>
            <button
              className="btn-danger"
              style={{ width: '100%', textAlign: 'center' }}
              onClick={() => { if (confirm('Sign out?')) { onSignOut(); onClose() } }}
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="sheet-footer">
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}
