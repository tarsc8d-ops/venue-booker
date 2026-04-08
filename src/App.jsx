import { useState, useEffect, useCallback } from 'react'
import LoginScreen from './components/LoginScreen'
import TourList from './components/TourList'
import VenueList from './components/VenueList'
import TourModal from './components/TourModal'
import VenueModal from './components/VenueModal'
import EmailModal from './components/EmailModal'
import SurveyModal from './components/SurveyModal'
import SettingsModal from './components/SettingsModal'
import BulkEmailModal from './components/BulkEmailModal'

const GIS_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ')

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

export const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-standard',
    name: '📋 Standard Booking',
    subject: 'Upcoming Performance at {{venue_name}} — {{artist}}',
    body: `Hi {{contact_name}},

We're excited to reach out about an upcoming performance at {{venue_name}}.

{{artist}} will be performing on {{date}} at {{time}}.

To help us prepare and make this the best possible show, we'd love for your team to fill out our quick venue survey covering sound requirements, load-in logistics, and a few questions about your space:

{{survey_link}}

Don't hesitate to reach out with any questions — we're looking forward to working with you!

Best regards,
Artist Management`,
    isDefault: true,
  },
  {
    id: 'tpl-inquiry',
    name: '🎤 Booking Inquiry',
    subject: 'Booking Inquiry: {{artist}} at {{venue_name}}',
    body: `Hi {{contact_name}},

My name is [Your Name] and I represent {{artist}}. We're currently booking shows for our upcoming tour and would love to bring the act to {{venue_name}} in {{city}}.

We're looking at {{date}} — would that date work for your venue?

Please fill out our venue information form so we can get the details we need:

{{survey_link}}

Looking forward to hearing from you!

Best,
[Your Name]
Artist Management`,
    isDefault: true,
  },
  {
    id: 'tpl-followup',
    name: '🔁 Follow-Up',
    subject: 'Following Up — {{artist}} at {{venue_name}}',
    body: `Hi {{contact_name}},

Just following up on my previous email about {{artist}} performing at {{venue_name}} on {{date}}.

If you haven't had a chance to fill out our venue survey yet, here's the link:

{{survey_link}}

Please let us know if you have any questions or need additional information. We're excited about the possibility of working together!

Best,
[Your Name]
Artist Management`,
    isDefault: true,
  },
]

export default function App() {
  const [gisReady, setGisReady] = useState(false)
  const [auth, setAuth]           = useState(() => load('vb_auth', null))
  const [tours, setTours]         = useState(() => load('vb_tours', []))
  const [venues, setVenues]       = useState(() => load('vb_venues', []))
  const [surveyLink, setSurveyLink]     = useState(() => localStorage.getItem('vb_survey') || '')
  const [customTemplates, setCustomTemplates] = useState(() => load('vb_templates', []))

  const [currentTourId, setCurrentTourId] = useState(null)
  const [modal, setModal] = useState(null)

  useEffect(() => { localStorage.setItem('vb_tours', JSON.stringify(tours)) }, [tours])
  useEffect(() => { localStorage.setItem('vb_venues', JSON.stringify(venues)) }, [venues])
  useEffect(() => { localStorage.setItem('vb_templates', JSON.stringify(customTemplates)) }, [customTemplates])

  // All templates: defaults first, then custom
  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates]

  // Load Google Identity Services
  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => setGisReady(true)
    document.head.appendChild(s)
  }, [])

  const signIn = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!window.google || !clientId) {
      alert('Add VITE_GOOGLE_CLIENT_ID to your Netlify environment variables to enable Google sign-in.')
      return
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GIS_SCOPES,
      callback: async (resp) => {
        if (resp.error) { console.error('OAuth error:', resp); return }
        try {
          const r = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${resp.access_token}` }
          })
          const user = await r.json()
          const authData = {
            accessToken: resp.access_token,
            email: user.email,
            name: user.name || user.email,
            picture: user.picture,
            expiresAt: Date.now() + resp.expires_in * 1000,
          }
          setAuth(authData)
          localStorage.setItem('vb_auth', JSON.stringify(authData))
        } catch (e) { console.error('Failed to get user info:', e) }
      },
    })
    client.requestAccessToken()
  }, [gisReady])

  const signOut = () => {
    localStorage.removeItem('vb_auth')
    setAuth(null)
    setCurrentTourId(null)
    setModal(null)
  }

  const getAccessToken = useCallback(() => {
    if (!auth?.accessToken) return null
    if (auth.expiresAt && Date.now() > auth.expiresAt - 120000) return null
    return auth.accessToken
  }, [auth])

  // ── Tours CRUD ──
  const addTour    = (d) => setTours(t => [...t, { ...d, id: Date.now(), createdAt: new Date().toISOString() }])
  const updateTour = (id, d) => setTours(t => t.map(x => x.id === id ? { ...x, ...d } : x))
  const deleteTour = (id) => {
    setTours(t => t.filter(x => x.id !== id))
    setVenues(v => v.filter(x => x.tourId !== id))
    if (currentTourId === id) setCurrentTourId(null)
  }

  // ── Venues CRUD ──
  const addVenue      = (d) => setVenues(v => [...v, { ...d, id: Date.now(), status: 'pending', createdAt: new Date().toISOString() }])
  const updateVenue   = (id, d) => setVenues(v => v.map(x => x.id === id ? { ...x, ...d } : x))
  const deleteVenue   = (id) => setVenues(v => v.filter(x => x.id !== id))
  const markEmailSent = (id) => updateVenue(id, { status: 'email_sent', emailSentAt: new Date().toISOString() })

  // ── Templates CRUD ──
  const saveTemplate   = (t) => setCustomTemplates(prev => {
    const exists = prev.find(x => x.id === t.id)
    return exists ? prev.map(x => x.id === t.id ? t : x) : [...prev, t]
  })
  const deleteTemplate = (id) => setCustomTemplates(prev => prev.filter(x => x.id !== id))

  const close = () => setModal(null)
  const currentTour   = tours.find(t => t.id === currentTourId)
  const currentVenues = venues.filter(v => v.tourId === currentTourId)

  if (!auth) return <LoginScreen onSignIn={signIn} loading={!gisReady} />

  return (
    <div className="app">
      {currentTourId ? (
        <VenueList
          tour={currentTour}
          venues={currentVenues}
          templates={allTemplates}
          onBack={() => setCurrentTourId(null)}
          onAddVenue={() => setModal({ type: 'venue', data: null })}
          onEditVenue={(v) => setModal({ type: 'venue', data: v })}
          onDeleteVenue={deleteVenue}
          onSendEmail={(v) => setModal({ type: 'email', data: v })}
          onViewSurvey={(v) => setModal({ type: 'survey', data: v })}
          onBulkEmail={(vs) => setModal({ type: 'bulk', data: vs })}
        />
      ) : (
        <TourList
          tours={tours}
          venues={venues}
          auth={auth}
          onSelectTour={setCurrentTourId}
          onAddTour={() => setModal({ type: 'tour', data: null })}
          onEditTour={(t) => setModal({ type: 'tour', data: t })}
          onDeleteTour={deleteTour}
          onOpenSettings={() => setModal({ type: 'settings' })}
        />
      )}

      {modal?.type === 'tour' && (
        <TourModal
          tour={modal.data}
          templates={allTemplates}
          onSave={(d) => { modal.data ? updateTour(modal.data.id, d) : addTour(d); close() }}
          onDelete={modal.data ? () => { deleteTour(modal.data.id); close() } : null}
          onClose={close}
        />
      )}
      {modal?.type === 'venue' && (
        <VenueModal
          venue={modal.data}
          tourId={currentTourId}
          defaultArtist={currentTour?.artist}
          onSave={(d) => { modal.data ? updateVenue(modal.data.id, d) : addVenue(d); close() }}
          onClose={close}
        />
      )}
      {modal?.type === 'email' && (
        <EmailModal
          venue={modal.data}
          tour={currentTour}
          templates={allTemplates}
          surveyLink={surveyLink}
          accessToken={getAccessToken()}
          onReAuth={signIn}
          onSent={() => { markEmailSent(modal.data.id); close() }}
          onClose={close}
        />
      )}
      {modal?.type === 'bulk' && (
        <BulkEmailModal
          venues={modal.data}
          tour={currentTour}
          templates={allTemplates}
          surveyLink={surveyLink}
          accessToken={getAccessToken()}
          onReAuth={signIn}
          onSent={(ids) => { ids.forEach(id => markEmailSent(id)); close() }}
          onClose={close}
        />
      )}
      {modal?.type === 'survey' && (
        <SurveyModal venue={modal.data} onClose={close} />
      )}
      {modal?.type === 'settings' && (
        <SettingsModal
          auth={auth}
          surveyLink={surveyLink}
          onSurveyLinkChange={(v) => { setSurveyLink(v); localStorage.setItem('vb_survey', v) }}
          customTemplates={customTemplates}
          defaultTemplates={DEFAULT_TEMPLATES}
          onSaveTemplate={saveTemplate}
          onDeleteTemplate={deleteTemplate}
          onSignOut={signOut}
          onClose={close}
        />
      )}
    </div>
  )
}
