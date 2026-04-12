// Clean SVG icon set for VenBook — Heroicons outline style (stroke-based, currentColor)
// All icons: 20x20 viewBox, strokeWidth 1.6, no fill

const props = (extra = {}) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  width: 18, height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.6',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  ...extra,
})

export const VenBookLogo = ({ size = 28, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#7C3AED" />
    <path d="M8 9l5.5 14L19 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 9l5 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 17h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

export const ToursIcon = (p) => (
  <svg {...props(p)}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
)

export const VenueIcon = (p) => (
  <svg {...props(p)}>
    <path d="M3 21h18M4 21V8l8-5 8 5v13" />
    <rect x="9" y="14" width="6" height="7" rx="0.5" />
    <path d="M9 10h.01M15 10h.01" />
  </svg>
)

export const ArtistIcon = (p) => (
  <svg {...props(p)}>
    <path d="M12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13z" />
    <path d="M12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path d="M12 12v3" />
    <path d="M9.5 18.5V21M14.5 18.5V21" />
  </svg>
)

export const MailIcon = (p) => (
  <svg {...props(p)}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
)

export const LinkIcon = (p) => (
  <svg {...props(p)}>
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
)

export const SettingsIcon = (p) => (
  <svg {...props(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

export const PlusIcon = (p) => (
  <svg {...props(p)}><path d="M12 5v14M5 12h14" /></svg>
)

/** Teams / groups — three people */
export const UserGroupIcon = (p) => (
  <svg {...props(p)}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
)

export const HomeIcon = (p) => (
  <svg {...props(p)}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
  </svg>
)

export const ChartBarIcon = (p) => (
  <svg {...props(p)}>
    <path d="M4 19V5M10 19v-6M16 19V9M22 19v-9" />
  </svg>
)

export const TrashIcon = (p) => (
  <svg {...props(p)}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)

export const EditIcon = (p) => (
  <svg {...props(p)}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

export const SearchIcon = (p) => (
  <svg {...props(p)}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
)

export const ChevronRightIcon = (p) => (
  <svg {...props(p)}><polyline points="9 18 15 12 9 6" /></svg>
)

export const ChevronLeftIcon = (p) => (
  <svg {...props(p)}><polyline points="15 18 9 12 15 6" /></svg>
)

export const XIcon = (p) => (
  <svg {...props(p)}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
)

export const MenuIcon = (p) => (
  <svg {...props(p)}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
)

export const SendIcon = (p) => (
  <svg {...props(p)}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

export const BarChartIcon = (p) => (
  <svg {...props(p)}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
)

export const FlaskIcon = (p) => (
  <svg {...props(p)}>
    <path d="M9 3h6M9 3v8l-4.5 9a1 1 0 00.9 1.5h13.2a1 1 0 00.9-1.5L15 11V3" />
    <path d="M7.5 17h9" />
  </svg>
)

export const CheckIcon = (p) => (
  <svg {...props(p)}><polyline points="20 6 9 17 4 12" /></svg>
)

export const SelectIcon = (p) => (
  <svg {...props(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

export const ArrowLeftIcon = (p) => (
  <svg {...props(p)}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

export const UserIcon = (p) => (
  <svg {...props(p)}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export const MicIcon = (p) => (
  <svg {...props(p)}>
    <path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8" />
  </svg>
)

export const MoreHorizontalIcon = (p) => (
  <svg {...props(p)}>
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
    <circle cx="5" cy="12" r="1" fill="currentColor" />
  </svg>
)

export const CopyIcon = (p) => (
  <svg {...props(p)}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
)

export const CalendarIcon = (p) => (
  <svg {...props(p)}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

export const LogOutIcon = (p) => (
  <svg {...props(p)}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)
