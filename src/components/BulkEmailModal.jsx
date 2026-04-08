import { useState } from 'react'

const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }) : '[Date TBD]'
const fmtTime = (t) => { if (!t) return '[Time TBD]'; const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}` }

const render = (text, venue, tour, surveyLink) =>
  (text || '')
    .replace(/{{venue_name}}/g,   venue.venueName   || '')
    .replace(/{{contact_name}}/g, venue.contactName || 'Team')
    .replace(/{{artist}}/g,       tour?.artist       || '[Artist]')
    .replace(/{{date}}/g,         fmtDate(venue.showDate))
    .replace(/{{time}}/g,         fmtTime(venue.showTime))
    .replace(/{{city}}/g,         venue.city         || '')
    .replace(/{{survey_link}}/g,  surveyLink         || '[Survey Link]')

const STATUS_ICON = { idle:'📧', sending:'⏳', sent:'✅', error:'❌', skipped:'⚠️' }
const STATUS_LABEL = { idle:'Pending', sending:'Sending…', sent:'Sent', error:'Failed', skipped:'No email' }

export default function BulkEmailModal({ venues, tour, templates, surveyLink, accessToken, onReAuth, onSent, onClose }) {
  const defaultTplId = tour?.emailTemplateId || templates[0]?.id || ''
  const [templateId, setTemplateId] = useState(defaultTplId)
  const [phase,      setPhase]      = useState('preview') // 'preview' | 'sending' | 'done'
  const [statuses,   setStatuses]   = useState({})        // { venueId: 'idle'|'sending'|'sent'|'error'|'skipped' }
  const [current,    setCurrent]    = useState(0)

  const tpl = templates.find(t => t.id === templateId) || templates[0]
  const sendable = venues.filter(v => v.contactEmail)
  const skipped  = venues.filter(v => !v.contactEmail)

  const sentCount  = Object.values(statuses).filter(s => s === 'sent').length
  const errorCount = Object.values(statuses).filter(s => s === 'error').length

  const runBulkSend = async () => {
    if (!accessToken || !tpl) return
    setPhase('sending')

    const init = {}
    venues.forEach(v => { init[v.id] = v.contactEmail ? 'idle' : 'skipped' })
    setStatuses(init)

    for (let i = 0; i < sendable.length; i++) {
      const venue = sendable[i]
      setCurrent(i + 1)
      setStatuses(s => ({ ...s, [venue.id]: 'sending' }))

      try {
        const body    = render(tpl.body,    venue, tour, surveyLink)
        const subject = render(tpl.subject || `Booking: ${venue.venueName}`, venue, tour, surveyLink)

        const res  = await fetch('/.netlify/functions/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: venue.contactEmail, subject, body, accessToken }),
        })
        const data = await res.json()

        setStatuses(s => ({ ...s, [venue.id]: data.success ? 'sent' : 'error' }))
      } catch {
        setStatuses(s => ({ ...s, [venue.id]: 'error' }))
      }

      if (i < sendable.length - 1) await new Promise(r => setTimeout(r, 700))
    }

    setPhase('done')
  }

  const handleDone = () => {
    const sentIds = venues.filter(v => statuses[v.id] === 'sent').map(v => v.id)
    onSent(sentIds)
  }

  return (
    <div className="sheet-overlay" onClick={phase === 'preview' ? onClose : undefined}>
      <div className="bottom-sheet bottom-sheet-tall" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>📤 Bulk Email — {venues.length} Venue{venues.length !== 1 ? 's' : ''}</h2>
          <button className="close-btn" onClick={onClose} disabled={phase === 'sending'}>×</button>
        </div>

        <div className="sheet-body">
          {!accessToken && (
            <div className="alert-error" style={{ marginBottom:'12px' }}>
              Google session expired.
              <button className="re-auth-btn" onClick={onReAuth}>Re-authenticate →</button>
            </div>
          )}

          {/* ── PREVIEW PHASE ── */}
          {phase === 'preview' && (
            <>
              <div className="field">
                <label>Email Template</label>
                <select value={templateId} onChange={e => setTemplateId(e.target.value)}>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {tpl && sendable.length > 0 && (
                <div className="field">
                  <label>Preview (using: {sendable[0].venueName})</label>
                  <div style={{ background:'var(--bg)', borderRadius:'10px', padding:'12px', fontSize:'12px', color:'var(--text-2)', lineHeight:'1.6', maxHeight:'130px', overflow:'auto' }}>
                    <div style={{ fontWeight:600, color:'var(--text)', marginBottom:'6px', fontSize:'13px' }}>
                      {render(tpl.subject, sendable[0], tour, surveyLink)}
                    </div>
                    <div style={{ whiteSpace:'pre-wrap' }}>
                      {render(tpl.body, sendable[0], tour, surveyLink).slice(0, 280)}…
                    </div>
                  </div>
                </div>
              )}

              <div className="field">
                <label>Recipients ({sendable.length} of {venues.length})</label>
                <div style={{ background:'var(--bg)', borderRadius:'10px', overflow:'hidden' }}>
                  {venues.map((v, i) => (
                    <div key={v.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderBottom: i < venues.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize:'16px', flexShrink:0 }}>{v.contactEmail ? '📧' : '⚠️'}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:500, fontSize:'14px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{v.venueName}</div>
                        <div style={{ fontSize:'12px', color: v.contactEmail ? 'var(--text-2)' : 'var(--danger)' }}>
                          {v.contactEmail || 'No email — will be skipped'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {skipped.length > 0 && (
                <div className="alert-error" style={{ marginBottom:'4px' }}>
                  ⚠️ {skipped.length} venue{skipped.length !== 1 ? 's' : ''} without an email address will be skipped.
                </div>
              )}
            </>
          )}

          {/* ── SENDING / DONE PHASE ── */}
          {(phase === 'sending' || phase === 'done') && (
            <div>
              {phase === 'sending' ? (
                <div style={{ textAlign:'center', padding:'16px 0 20px' }}>
                  <div className="spinner" style={{ margin:'0 auto 12px' }} />
                  <div style={{ fontSize:'16px', fontWeight:'600' }}>Sending {current} of {sendable.length}…</div>
                  <div style={{ fontSize:'13px', color:'var(--text-2)', marginTop:'4px' }}>Don't close this screen</div>
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'16px 0 20px' }}>
                  <div style={{ fontSize:'44px', marginBottom:'8px' }}>✅</div>
                  <div style={{ fontSize:'18px', fontWeight:'700' }}>All done!</div>
                  <div style={{ fontSize:'14px', color:'var(--text-2)', marginTop:'4px' }}>
                    {sentCount} sent{errorCount > 0 ? `, ${errorCount} failed` : ''}
                    {skipped.length > 0 ? `, ${skipped.length} skipped` : ''}
                  </div>
                </div>
              )}

              <div style={{ borderRadius:'12px', overflow:'hidden', background:'var(--bg)' }}>
                {venues.map((v, i) => {
                  const s = statuses[v.id] || 'idle'
                  return (
                    <div key={v.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px', borderBottom: i < venues.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize:'18px', width:'24px', textAlign:'center', flexShrink:0 }}>
                        {STATUS_ICON[s]}
                      </span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:500, fontSize:'14px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{v.venueName}</div>
                        <div style={{ fontSize:'12px', color:'var(--text-3)' }}>{v.contactEmail || 'No email'}</div>
                      </div>
                      <div style={{ fontSize:'12px', fontWeight:500, flexShrink:0, color: s === 'sent' ? '#059669' : s === 'error' ? '#DC2626' : s === 'sending' ? 'var(--accent)' : 'var(--text-3)' }}>
                        {STATUS_LABEL[s]}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="sheet-footer">
          {phase === 'preview' && (
            <>
              <button className="btn-ghost" onClick={onClose}>Cancel</button>
              <button
                className="btn-primary"
                disabled={!accessToken || !tpl || sendable.length === 0}
                onClick={runBulkSend}
              >
                📤 Send to {sendable.length} Venue{sendable.length !== 1 ? 's' : ''}
              </button>
            </>
          )}
          {phase === 'done' && (
            <button className="btn-primary" style={{ flex:1 }} onClick={handleDone}>Done</button>
          )}
        </div>
      </div>
    </div>
  )
}
