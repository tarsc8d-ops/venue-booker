import { VenBookLogo, ToursIcon, VenueIcon, ArtistIcon, MailIcon, LinkIcon, SettingsIcon } from './Icons'

export default function DesktopSidebar({ auth, currentPage, onNav, onSignOut }) {
  const navItems = [
    { Icon: ToursIcon,   label: 'Tours',           key: 'tours'         },
    { Icon: VenueIcon,   label: 'Saved Venues',    key: 'saved-venues'  },
    { Icon: ArtistIcon,  label: 'Saved Artists',   key: 'saved-artists' },
    { Icon: MailIcon,    label: 'Email Templates', key: 'templates'     },
    { Icon: LinkIcon,    label: 'Survey Links',    key: 'survey'        },
  ]

  return (
    <aside className="desktop-sidebar">
      <div className="ds-brand" onClick={() => onNav('tours')} style={{ cursor: 'pointer' }}>
        <VenBookLogo size={30} />
        <span className="ds-brand-name">VenBook</span>
      </div>

      <nav className="ds-nav">
        {navItems.map(({ Icon, label, key }) => (
          <button
            key={key}
            className={`ds-nav-item ${currentPage === key ? 'active' : ''}`}
            onClick={() => onNav(key)}
          >
            <span className="ds-nav-icon"><Icon width={17} height={17} /></span>
            <span className="ds-nav-label">{label}</span>
          </button>
        ))}
      </nav>

      <div className="ds-spacer" />

      <div className="ds-footer">
        <button className={`ds-nav-item ${currentPage === 'settings' ? 'active' : ''}`} onClick={() => onNav('settings')}>
          <span className="ds-nav-icon"><SettingsIcon width={17} height={17} /></span>
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
