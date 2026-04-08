const fmtDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '[Date TBD]'

const fmtTime = (t) => {
  if (!t) return '[Time TBD]'
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

// Tokens use snake_case to match DEFAULT_TEMPLATES in App.jsx
export function renderTemplate(template, venue, tour, surveyLink) {
  const text = (str) =>
    (str || '')
      .replace(/{{venue_name}}/g,   venue?.venueName   || '')
      .replace(/{{contact_name}}/g, venue?.contactName || (venue?.venueName ? venue.venueName + ' Team' : 'Team'))
      .replace(/{{artist}}/g,       venue?.artist || tour?.artist || '[Artist]')
      .replace(/{{date}}/g,         fmtDate(venue?.showDate))
      .replace(/{{time}}/g,         fmtTime(venue?.showTime))
      .replace(/{{city}}/g,         venue?.city || '')
      .replace(/{{survey_link}}/g,  surveyLink || '[Add your survey link in Settings]')
  return { subject: text(template.subject), body: text(template.body) }
}

// Used by TemplateEditor for the "Insert Field" chip buttons
export const FIELD_CHIPS = [
  { label: 'Venue',   token: '{{venue_name}}' },
  { label: 'Contact', token: '{{contact_name}}' },
  { label: 'Artist',  token: '{{artist}}' },
  { label: 'Date',    token: '{{date}}' },
  { label: 'Time',    token: '{{time}}' },
  { label: 'Survey',  token: '{{survey_link}}' },
  { label: 'City',    token: '{{city}}' },
]
