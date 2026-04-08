export default function Drawer({ isOpen, onClose, auth, onNav, onSignOut }) {
  const items = [
    { icon: '🏟️', label: 'Saved Venues',    key: 'saved-venues'   },
    { icon: '🎤', label: 'Saved Artists',   key: 'saved-artists'  },
    { icon: '✉️', label: 'Email Templates', key: 'templates'      },
    { icon: '🔗', label: 'Survey Link',     key: 'survey'         },
    { icon: '⚙️', label: 'Account',         key: 'settings'       },
  ]

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-brand">🎵 VenueBooker</div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        {auth && (
          <div className="drawer-user">
            {auth.picture && (
              <img src={auth.picture} className="drawer-avatar" alt={auth.name}
                onError={e => { e.target.style.display = 'none' }} />
            )}
            <div className="drawer-user-info">
              <div className="drawer-user-name">{auth.name}</div>
              <div className="drawer-user-email">{auth.email}</div>
            </div>
          </div>
        )}

        <div className="drawer-divider" />

        <nav className="drawer-nav">
          {items.map(({ icon, label, key }) => (
            <button key={key} className="drawer-item" onClick={() => { onNav(key); onClose() }}>
              <span className="drawer-item-icon">{icon}</span>
              <span className="drawer-item-label">{label}</span>
              <span className="drawer-item-arrow">›</span>
            </button>
          ))}
        </nav>

        <div className="drawer-spacer" />

        <button
          className="drawer-signout"
          onClick={() => { if (confirm('Sign out?')) { onSignOut(); onClose() } }}
        >
          Sign Out
        </button>
      </div>
    </>
  )
}
