import { useState } from 'react'

const fmtTime = (t) => {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

const fmtDate = (d) => {
  if (!d) return '[Date TBD]'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const buildBody = ({ venueName, contactName, artistName, showDate, showTime, surveyLink }) => {
  const greeting = contactName ? `Hi ${contactName},` : `Hi ${venueName} Team,`
  return `${greeting}

We're excited to reach out regarding an upcoming performance at ${venueName}.

${artistName || '[Artist Name]'} will be performing on ${fmtDate(showDate)} at ${fmtTime(showTime) || '[Time TBD]'}.

To help us prepare and make this the best possible show for everyone involved, we'd love for your team to complete our venue survey. It covers sound requirements, load-in logistics, and a few quick questions about your space.

Please complete the survey here:
${surveyLink || '[Add your Google Form link in Settings]'}

Feel free to reach out with any questions. We're looking forward to working with you!

Warm regards,
[Your Name]
Artist Management`
}

export default function EmailModal({ venue, artistName, surveyLink, onSent, onClose }) {
  const artist = venue.artistName || artistName || '[Artist Name]'
  const [to, setTo]         = useState(venue.contactEmail || '')
  const [subject, setSubject] = useState(`Upcoming Performance at ${venue.venueName} — ${artist}`)
  const [body, setBody]     = useState(() => buildBody({ ...venue, artistName: artist, surveyLink }))
  const [sending, setSending] = useState(false)
  const [result, setResult]   = useState(null) // 'success' | 'error'
  const [errMsg, setErrMsg]   = useState('')

  const handleSend = async () => {
    if (!to) { setErrMsg('Please enter a recipient email address.'); return }
    setSending(true)
    setResult(null)
    setErrMsg('')
    try {
      const res = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      })
      const data = await res.json()
      if (data.success) {
        setResult('success')
        setTimeout(onSent, 1800)
      } else {
        setResult('error')
        setErrMsg(data.error || 'Failed to send email.')
      }
    } catch {
      setResult('error')
      setErrMsg('Network error. Make sure the Netlify function is configured correctly.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✉️ Send Email — {venue.venueName}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>To</label>
            <input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="booking@venue.com" />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Message — feel free to edit before sending</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={18} className="email-body-textarea" />
          </div>
          {errMsg && <div className="alert alert-error">⚠️ {errMsg}</div>}
          {result === 'success' && <div className="alert alert-success">✅ Email sent! Updating venue status...</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSend} disabled={sending || result === 'success'}>
            {sending ? '⏳ Sending...' : '📤 Send Email'}
          </button>
        </div>
      </div>
    </div>
  )
}
