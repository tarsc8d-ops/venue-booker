import { useState } from 'react'

const fmtDate = (d) => d ? new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}) : '[Date TBD]'
const fmtTime = (t) => { if(!t) return '[Time TBD]'; const [h,m]=t.split(':'); const hr=parseInt(h); return `${hr%12||12}:${m} ${hr>=12?'PM':'AM'}` }

const render = (text, venue, tour, surveyLink) =>
  (text || '')
    .replace(/{{venue_name}}/g,   venue.venueName   || '')
    .replace(/{{contact_name}}/g, venue.contactName || (venue.venueName + ' Team'))
    .replace(/{{artist}}/g,       tour?.artist       || '[Artist]')
    .replace(/{{date}}/g,         fmtDate(venue.showDate))
    .replace(/{{time}}/g,         fmtTime(venue.showTime))
    .replace(/{{city}}/g,         venue.city         || '')
    .replace(/{{survey_link}}/g,  surveyLink         || '[Add survey link in Settings]')

export default function EmailModal({ venue, tour, templates, surveyLink, accessToken, isTest, onReAuth, onSent, onClose }) {
  const pickTemplate = () => {
    if (tour?.emailTemplateId && templates?.length) {
      const t = templates.find(t => t.id === tour.emailTemplateId)
      if (t) return t
    }
    return templates?.[0] || null
  }

  const buildInitial = () => {
    const tpl = pickTemplate()
    if (tpl) {
      return {
        subject: render(tpl.subject, venue, tour, surveyLink),
        body:    render(tpl.body,    venue, tour, surveyLink),
      }
    }
    const artist   = tour?.artist || '[Artist]'
    const greeting = venue.contactName ? `Hi ${venue.contactName},` : `Hi ${venue.venueName} Team,`
    return {
      subject: `Upcoming Performance at ${venue.venueName}`,
      body: `${greeting}\n\nWe're reaching out about an upcoming performance at ${venue.venueName}.\n\n${artist} will be performing on ${fmtDate(venue.showDate)} at ${fmtTime(venue.showTime)}.\n\nPlease fill out our venue survey:\n\n${surveyLink || '[Add survey link in Settings]'}\n\nBest,\n[Your Name]\nArtist Management`,
    }
  }

  const initial = buildInitial()
  const [to,       setTo]       = useState(venue.contactEmail || '')
  const [subject,  setSubject]  = useState(initial.subject)
  const [body,     setBody]     = useState(initial.body)
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [error,    setError]    = useState('')
  const [showTpls, setShowTpls] = useState(false)

  const applyTemplate = (tpl) => {
    setSubject(render(tpl.subject, venue, tour, surveyLink))
    setBody(render(tpl.body, venue, tour, surveyLink))
    setShowTpls(false)
  }

  const send = async () => {
    if (!to) { setError('Please enter a recipient email.'); return }
    if (!accessToken) { setError('Google session expired.'); return }
    setSending(true); setError('')
    try {
      const res  = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, accessToken }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
        setTimeout(onSent, 1500)
      } else {
        const isExpired = data.error?.includes('invalid_token') || data.error?.includes('Token has been expired') || data.error?.includes('Invalid Credentials')
        setError(isExpired ? 'Session expired — tap Re-authenticate and try again.' : (data.error || 'Failed to send.'))
      }
    } catch { setError('Network error. Check your connection.') }
    finally { setSending(false) }
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet-tall" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>
            {isTest ? '🧪 Test Email' : `✉️ ${venue.venueName}`}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="sheet-body">
          {/* Test email notice */}
          {isTest && (
            <div style={{ background: 'linear-gradient(135deg, #EDE9FE, #DBEAFE)', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', marginBottom: '3px' }}>Sending to yourself</div>
              <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.5' }}>
                This previews exactly what venues will receive. The template fields are filled with sample data. Edit anything before sending.
              </div>
            </div>
          )}

          {/* Template switcher */}
          {templates?.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <button
                className="btn-sm-ghost"
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}
                onClick={() => setShowTpls(v => !v)}
              >
                <span>📋 Switch Template</span>
                <span style={{ fontSize: '11px' }}>{showTpls ? '▲' : '▼'}</span>
              </button>
              {showTpls && (
                <div style={{ background: 'var(--bg)', borderRadius: '0 0 10px 10px', overflow: 'hidden', border: '1px solid var(--border)', borderTop: 'none' }}>
                  {templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t)}
                      style={{ display: 'block', width: '100%', padding: '11px 14px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid var(--border)' }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="email-meta">
            <div className="email-meta-row">
              <span className="email-label">To</span>
              <input className="email-meta-input" type="email" inputMode="email" value={to} onChange={e => setTo(e.target.value)} placeholder="venue@example.com" />
            </div>
            <div className="email-meta-row">
              <span className="email-label">Re</span>
              <input className="email-meta-input" type="text" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
          </div>
          <textarea className="email-body" value={body} onChange={e => setBody(e.target.value)} rows={14} />

          {error && (
            <div className="alert-error">
              {error}
              {error.includes('expired') && (
                <button className="re-auth-btn" onClick={onReAuth}>Re-authenticate →</button>
              )}
            </div>
          )}
          {sent && (
            <div className="alert-success">
              {isTest ? '✅ Test email sent to your inbox!' : '✅ Email sent! Marking as Emailed…'}
            </div>
          )}
        </div>

        <div className="sheet-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={send} disabled={sending || sent}>
            {sending ? 'Sending…' : sent ? 'Sent ✓' : isTest ? '🧪 Send Test' : '📤 Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
