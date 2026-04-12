import { VenueIcon, UserGroupIcon, HomeIcon } from './Icons'

function AccountTabIcon({ auth }) {
  if (auth?.picture) {
    return (
      <img src={auth.picture} alt="" className="mbnav-avatar" onError={(e) => { e.target.style.display = 'none' }} />
    )
  }
  const initial = (auth?.name || auth?.email || '?')[0]?.toUpperCase() || '?'
  return <span className="mbnav-avatar-fallback">{initial}</span>
}

export default function MobileBottomNav({ tab, onTab, auth, hidden }) {
  if (hidden) return null

  const Item = ({ id, label, icon }) => (
    <button
      type="button"
      className={`mbnav-item ${tab === id ? 'active' : ''}`}
      onClick={() => onTab(id)}
      aria-current={tab === id ? 'page' : undefined}
    >
      <span className="mbnav-icon">{icon}</span>
      <span className="mbnav-label">{label}</span>
    </button>
  )

  return (
    <div className="mbnav-pill-outer" aria-label="Main">
      <nav className="mbnav-pill">
        <Item id="tours" label="Tours" icon={<HomeIcon width={20} height={20} />} />
        <Item id="venues" label="Venues" icon={<VenueIcon width={20} height={20} />} />
        <Item id="teams" label="Teams" icon={<UserGroupIcon width={20} height={20} />} />
        <Item id="account" label="Account" icon={<AccountTabIcon auth={auth} />} />
      </nav>
    </div>
  )
}
