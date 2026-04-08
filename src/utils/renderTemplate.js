const fmtDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '[Date TBD]'

const fmtTime = (t) => {
  if (!t) return '[Time TBD]'
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

export function renderTemplate(template, venue, tour, surveyLink) {
  const fields = {
    '{{venueName}}':   venue?.venueName  || '',
    '{{contactName}}': venue?.contactName || (venue?.venueName ? venue.venueName + ' Team' : 'Team'),
    '{{artist}}':      venue?.artist || tour?.artist || '[Artist]',
    '{{date}}':        fmtDate(venue?.showDate),
    '{{time}}':        fmtTime(venue?.showTime),
    '{{surveyLink}}':  surveyLink || '[Add your survey link in Settings]',
    '{{city}}':        venue?.city || '',
  }
  const fill = (str) => str ? Object.entries(fields).reduce((s, [k, v]) => s.split(k).join(v), str) : ''
  return { subject: fill(template.subject), body: fill(template.body) }
}

export const FIELD_CHIPS = [
  { label: 'Venue',    token: '{{venueName}}' },
  { label: 'Contact',  token: '{{contactName}}' },
  { label: 'Artist',   token: '{{artist}}' },
  { label: 'Date',     token: '{{date}}' },
  { label: 'Time',     token: '{{time}}' },
  { label: 'Survey',   token: '{{surveyLink}}' },
  { label: 'City',     token: '{{city}}' },
]
