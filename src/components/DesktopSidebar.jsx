export default function DesktopSidebar({ auth, currentPage, onNav, onSignOut }) {
  const navItems = [
    { icon: '🗺️',  label: 'Tours',           key: 'tours'         },
    { icon: '🏟️',  label: 'Saved Venues',    key: 'saved-venues'  },
    { icon: '🎤',  label: 'Saved Artists',   key: 'saved-artists' },
    { icon: '✉️',  label: 'Email Templates', key: 'templates'     },
    { icon: '🔗',  label: 'Survey Links',    key: 'survey'        },
  ]

  return (
    <aside className="desktop-sidebar">
      {/* Brand */}
      <div className="ds-brand">
        <span className="ds-brand-icon">🎵</span>
        <span className="ds-brand-name">VenueBooker</span>
      </div>

      {/* Nav */}
      <nav className="ds-nav">
        {navItems.map(({ icon, label, key }) => (
          <button
            key={key}
            className={`ds-nav-item ${currentPage === key ? 'active' : ''}`}
            onClick={() => onNav(key)}
          >
            <span className="ds-nav-icon">{icon}</span>
            <span className="ds-nav-label">{label}</span>
          </button>
        ))}
      </nav>

      <div className="ds-spacer" />

      {/* User + Account */}
      <div className="ds-footer">
        <button className="ds-nav-item" onClick={() => onNav('settings')}>
          <span className="ds-nav-icon">⚙️</span>
          <span className="ds-nav-label">Account</span>
        </button>
        {auth && (
          <div className="ds-user">
            {auth.picture && (
              <img src={auth.picture} className="ds-avatar" alt={auth.name}
                onError={e => { e.target.style.display = 'none' }} />
            )}
            <div className="ds-user-info">
              <div className="ds-user-name">{auth.name}</div>
              <div className="ds-user-email">{auth.email}</div>
            </div>
          </div>
        )}
        <button className="ds-signout" onClick={() => { if (confirm('Sign out?')) onSignOut() }}>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
