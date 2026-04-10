import { VenBookLogo, ToursIcon, VenueIcon, ArtistIcon, MailIcon, LinkIcon, SettingsIcon, XIcon } from './Icons'

export default function Drawer({ isOpen, onClose, auth, onNav, onSignOut }) {
  const items = [
    { Icon: ToursIcon,  label: 'Tours',           key: 'tours'         },
    { Icon: VenueIcon,  label: 'Saved Venues',    key: 'saved-venues'  },
    { Icon: ArtistIcon, label: 'Saved Artists',   key: 'saved-artists' },
    { Icon: MailIcon,   label: 'Email Templates', key: 'templates'     },
    { Icon: LinkIcon,   label: 'Survey Links',    key: 'survey'        },
    { Icon: SettingsIcon, label: 'Account',       key: 'settings'      },
  ]

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <VenBookLogo size={28} />
            <span className="drawer-brand">VenBook</span>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <XIcon width={16} height={16} />
          </button>
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
          {items.map(({ Icon, label, key }) => (
            <button key={key} className="drawer-item" onClick={() => { onNav(key); onClose() }}>
              <span className="drawer-item-icon"><Icon width={18} height={18} /></span>
              <span className="drawer-item-label">{label}</span>
              <span className="drawer-item-arrow" style={{ fontSize: '16px', opacity: 0.4 }}>›</span>
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
