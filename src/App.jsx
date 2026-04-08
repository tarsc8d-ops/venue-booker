import { useState, useEffect, useCallback } from 'react'
import LoginScreen from './components/LoginScreen'
import TourList from './components/TourList'
import VenueList from './components/VenueList'
import TourModal from './components/TourModal'
import VenueModal from './components/VenueModal'
import EmailModal from './components/EmailModal'
import SurveyModal from './components/SurveyModal'
import SettingsModal from './components/SettingsModal'

const GIS_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ')

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

export default function App() {
  const [gisReady, setGisReady] = useState(false)
  const [auth, setAuth]     = useState(() => load('vb_auth', null))
  const [tours, setTours]   = useState(() => load('vb_tours', []))
  const [venues, setVenues] = useState(() => load('vb_venues', []))
  const [surveyLink, setSurveyLink] = useState(() => localStorage.getItem('vb_survey') || '')

  const [currentTourId, setCurrentTourId] = useState(null)
  const [modal, setModal] = useState(null) // { type, data }

  useEffect(() => { localStorage.setItem('vb_tours', JSON.stringify(tours)) }, [tours])
  useEffect(() => { localStorage.setItem('vb_venues', JSON.stringify(venues)) }, [venues])

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
    // Warn if expiring within 2 min
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
  const addVenue    = (d) => setVenues(v => [...v, { ...d, id: Date.now(), status: 'pending', createdAt: new Date().toISOString() }])
  const updateVenue = (id, d) => setVenues(v => v.map(x => x.id === id ? { ...x, ...d } : x))
  const deleteVenue = (id) => setVenues(v => v.filter(x => x.id !== id))
  const markEmailSent = (id) => updateVenue(id, { status: 'email_sent', emailSentAt: new Date().toISOString() })

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
          onBack={() => setCurrentTourId(null)}
          onAddVenue={() => setModal({ type: 'venue', data: null })}
          onEditVenue={(v) => setModal({ type: 'venue', data: v })}
          onDeleteVenue={deleteVenue}
          onSendEmail={(v) => setModal({ type: 'email', data: v })}
          onViewSurvey={(v) => setModal({ type: 'survey', data: v })}
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
          surveyLink={surveyLink}
          accessToken={getAccessToken()}
          onReAuth={signIn}
          onSent={() => { markEmailSent(modal.data.id); close() }}
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
          onSignOut={signOut}
          onClose={close}
        />
      )}
    </div>
  )
}
