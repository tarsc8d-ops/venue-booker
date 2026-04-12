import { PlusIcon } from './Icons'

const ACTIONS = [
  { key: 'tour', label: 'Add tour', sub: 'New tour', emoji: '🎤' },
  { key: 'artist', label: 'Add artist', sub: 'Saved artist', emoji: '🎵' },
  { key: 'template', label: 'Email template', sub: 'Create template', emoji: '✉️' },
  { key: 'survey', label: 'Survey link', sub: 'Create link', emoji: '🔗' },
]

export default function MobileFab({ open, onToggle, onAction }) {
  return (
    <>
      <button
        type="button"
        className={`mbfab-btn ${open ? 'open' : ''}`}
        onClick={() => onToggle(!open)}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Add'}
      >
        {open ? <span className="mbfab-x">×</span> : <PlusIcon width={26} height={26} />}
      </button>

      {open && (
        <div className="mbfab-backdrop" onClick={() => onToggle(false)} role="presentation">
          <div className="mbfab-grid" onClick={(e) => e.stopPropagation()}>
            {ACTIONS.map((a) => (
              <button
                key={a.key}
                type="button"
                className="mbfab-card"
                onClick={() => { onAction(a.key); onToggle(false) }}
              >
                <span className="mbfab-emoji" aria-hidden>{a.emoji}</span>
                <span className="mbfab-card-title">{a.label}</span>
                <span className="mbfab-card-sub">{a.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
