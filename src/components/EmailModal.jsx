import { useState } from 'react'

const fmtDate = (d) => d ? new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}) : '[Date TBD]'
const fmtTime = (t) => { if(!t) return '[Time TBD]'; const [h,m]=t.split(':'); const hr=parseInt(h); return `${hr%12||12}:${m} ${hr>=12?'PM':'AM'}` }

const buildBody = (venue, tour, surveyLink) => {
  const artist = tour?.artist || '[Artist]'
  const greeting = venue.contactName ? `Hi ${venue.contactName},` : `Hi ${venue.venueName} Team,`
  return `${greeting}

We're reaching out about an upcoming performance at ${venue.venueName}.

${artist} will be performing on ${fmtDate(venue.showDate)} at ${fmtTime(venue.showTime)}.

To help us prepare and make this the best possible show, we'd love for your team to fill out our venue survey covering sound requirements, load-in logistics, and a few quick questions:

${surveyLink || '[Add your Google Form survey link in Settings]'}

Don't hesitate to reach out with any questions — we're looking forward to working with you!

Best,
[Your Name]
Artist Management`
}

export default function EmailModal({ venue, tour, surveyLink, accessToken, onReAuth, onSent, onClose }) {
  const [to,      setTo]      = useState(venue.contactEmail || '')
  const [subject, setSubject] = useState(`Upcoming Performance at ${venue.venueName}`)
  const [body,    setBody]    = useState(() => buildBody(venue, tour, surveyLink))
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const send = async () => {
    if (!to) { setError('Please enter a recipient email.'); return }
    if (!accessToken) { setError('Google session expired. Tap "Re-authenticate" below.'); return }
    setSending(true); setError('')
    try {
      const res  = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, accessToken }),
      })
      const data = await res.json()
      if (data.success) { setSent(true); setTimeout(onSent, 1500) }
      else {
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
          <h2>✉️ {venue.venueName}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
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
          <textarea className="email-body" value={body} onChange={e => setBody(e.target.value)} rows={16} />
          {error && (
            <div className="alert-error">
              {error}
              {error.includes('expired') && (
                <button className="re-auth-btn" onClick={onReAuth}>Re-authenticate →</button>
              )}
            </div>
          )}
          {sent && <div className="alert-success">✅ Email sent! Marking as Emailed…</div>}
        </div>
        <div className="sheet-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={send} disabled={sending || sent}>
            {sending ? 'Sending…' : sent ? 'Sent ✓' : '📤 Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
