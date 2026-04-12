import NativeDeviceSection from './NativeDeviceSection'

export default function MobileAccountPage({ auth, onSignOut }) {
  return (
    <div className="mobile-page">
      <div className="mobile-page-header">
        <h1 className="mobile-page-title">Account</h1>
      </div>
      <div className="mobile-page-body mobile-page-scroll">
        <div className="settings-section">
          <div className="settings-label">Signed in as</div>
          <div className="account-row" style={{ marginTop: '8px' }}>
            {auth?.picture && (
              <img src={auth.picture} className="avatar-lg" alt="" onError={(e) => { e.target.style.display = 'none' }} />
            )}
            <div>
              <div className="account-name">{auth?.name}</div>
              <div className="account-email">{auth?.email}</div>
            </div>
          </div>
        </div>

        <NativeDeviceSection />

        <div className="settings-section">
          <p className="settings-hint" style={{ marginBottom: '14px', lineHeight: 1.5 }}>
            Your Gmail account is used to send booking emails from your address. You may need to re-authenticate after about an hour.
          </p>
          <button
            type="button"
            className="btn-danger"
            style={{ width: '100%', textAlign: 'center' }}
            onClick={() => { if (confirm('Sign out?')) onSignOut() }}
          >
            Sign out
          </button>
        </div>
        <div className="mobile-page-bottom-spacer" aria-hidden />
      </div>
    </div>
  )
}
