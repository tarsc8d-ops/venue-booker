import { useState, useEffect, useCallback, useRef } from 'react'
import { db } from './lib/db'
import LoginScreen from './components/LoginScreen'
import TourList from './components/TourList'
import VenueList from './components/VenueList'
import TourModal from './components/TourModal'
import VenueModal from './components/VenueModal'
import EmailModal from './components/EmailModal'
import SurveyModal from './components/SurveyModal'
import SettingsModal from './components/SettingsModal'
import BulkEmailModal from './components/BulkEmailModal'
import Drawer from './components/Drawer'
import SavedVenuesSheet from './components/SavedVenuesSheet'
import SavedArtistsSheet from './components/SavedArtistsSheet'
import EmailTemplatesSheet from './components/EmailTemplatesSheet'
import SurveyLinkSheet from './components/SurveyLinkSheet'

const GIS_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ')

const ls = {
  get: (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} },
}

export const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-standard',
    name: '📋 Standard Booking',
    subject: 'Upcoming Performance at {{venue_name}} — {{artist}}',
    body: `Hi {{contact_name}},\n\nWe're excited to reach out about an upcoming performance at {{venue_name}}.\n\n{{artist}} will be performing on {{date}} at {{time}}.\n\nTo help us prepare and make this the best possible show, we'd love for your team to fill out our quick venue survey covering sound requirements, load-in logistics, and a few questions about your space:\n\n{{survey_link}}\n\nDon't hesitate to reach out with any questions — we're looking forward to working with you!\n\nBest regards,\nArtist Management`,
    isDefault: true,
  },
  {
    id: 'tpl-inquiry',
    name: '🎤 Booking Inquiry',
    subject: 'Booking Inquiry: {{artist}} at {{venue_name}}',
    body: `Hi {{contact_name}},\n\nMy name is [Your Name] and I represent {{artist}}. We're currently booking shows for our upcoming tour and would love to bring the act to {{venue_name}} in {{city}}.\n\nWe're looking at {{date}} — would that date work for your venue?\n\nPlease fill out our venue information form so we can get the details we need:\n\n{{survey_link}}\n\nLooking forward to hearing from you!\n\nBest,\n[Your Name]\nArtist Management`,
    isDefault: true,
  },
  {
    id: 'tpl-followup',
    name: '🔁 Follow-Up',
    subject: 'Following Up — {{artist}} at {{venue_name}}',
    body: `Hi {{contact_name}},\n\nJust following up on my previous email about {{artist}} performing at {{venue_name}} on {{date}}.\n\nIf you haven't had a chance to fill out our venue survey yet, here's the link:\n\n{{survey_link}}\n\nPlease let us know if you have any questions. We're excited about the possibility of working together!\n\nBest,\n[Your Name]\nArtist Management`,
    isDefault: true,
  },
]

export default function App() {
  const [gisReady, setGisReady] = useState(false)
  const [auth, setAuth] = useState(() => ls.get('vb_auth', null))
  const [dbReady, setDbReady] = useState(false)

  // App data — seeded from localStorage until DB loads
  const [tours,           setTours]           = useState(() => ls.get('vb_tours', []))
  const [venues,          setVenues]          = useState(() => ls.get('vb_venues', []))
  const [surveyLink,      setSurveyLink]      = useState(() => localStorage.getItem('vb_survey') || '')
  const [sheetId,         setSheetId]         = useState(() => localStorage.getItem('vb_sheet_id') || '')
  const [customTemplates, setCustomTemplates] = useState(() => ls.get('vb_templates', []))
  const [savedVenues,     setSavedVenues]     = useState(() => ls.get('vb_saved_venues', []))
  const [savedArtists,    setSavedArtists]    = useState(() => ls.get('vb_saved_artists', []))

  // UI state
  const [currentTourId, setCurrentTourId] = useState(null)
  const [modal,         setModal]         = useState(null)
  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const [showSavedVenues,  setShowSavedVenues]  = useState(false)
  const [showSavedArtists, setShowSavedArtists] = useState(false)
  const [showTemplates,    setShowTemplates]    = useState(false)
  const [showSurveyLink,   setShowSurveyLink]   = useState(false)

  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates]

  // ─── Google Identity Services ───────────────────────────────────────────────
  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => setGisReady(true)
    document.head.appendChild(s)
  }, [])

  // ─── Sync state from Supabase ────────────────────────────────────────────────
  const syncFromDB = useCallback(async (accessToken) => {
    try {
      const remote = await db.loadAll(accessToken)

      // Auto-migrate localStorage → Supabase on first use (if DB empty)
      const isEmpty = remote.tours.length === 0 && remote.venues.length === 0
      const localTours   = ls.get('vb_tours', [])
      const localVenues  = ls.get('vb_venues', [])

      if (isEmpty && (localTours.length > 0 || localVenues.length > 0)) {
        // Migrate all local data to DB silently
        const migrate = async () => {
          const localSavedV  = ls.get('vb_saved_venues', [])
          const localSavedA  = ls.get('vb_saved_artists', [])
          const localTpls    = ls.get('vb_templates', [])
          const lSurvey      = localStorage.getItem('vb_survey') || ''
          const lSheetId     = localStorage.getItem('vb_sheet_id') || ''

          await Promise.allSettled([
            ...localTours.map(t   => db.upsert('tours',           t,  accessToken)),
            ...localVenues.map(v  => db.upsert('venues',          v,  accessToken)),
            ...localSavedV.map(v  => db.upsert('saved_venues',    v,  accessToken)),
            ...localSavedA.map(a  => db.upsert('saved_artists',   a,  accessToken)),
            ...localTpls.map(t    => db.upsert('email_templates', t,  accessToken)),
            (lSurvey || lSheetId)
              ? db.saveSettings({ surveyLink: lSurvey, sheetId: lSheetId }, accessToken)
              : Promise.resolve(),
          ])
          // Reload after migration
          return db.loadAll(accessToken)
        }
        const migrated = await migrate()
        applyRemote(migrated)
      } else {
        applyRemote(remote)
      }
    } catch (err) {
      console.warn('DB sync failed, using local data:', err.message)
    } finally {
      setDbReady(true)
    }
  }, [])

  const applyRemote = (remote) => {
    if (remote.tours?.length)           setTours(remote.tours)
    if (remote.venues?.length)          setVenues(remote.venues)
    if (remote.savedVenues?.length)     setSavedVenues(remote.savedVenues)
    if (remote.savedArtists?.length)    setSavedArtists(remote.savedArtists)
    if (remote.templates?.length)       setCustomTemplates(remote.templates)
    if (remote.settings?.surveyLink)    setSurveyLink(remote.settings.surveyLink)
    if (remote.settings?.sheetId)       setSheetId(remote.settings.sheetId)
  }

  // When auth changes (sign-in), load from DB
  useEffect(() => {
    if (auth?.accessToken) syncFromDB(auth.accessToken)
  }, [auth?.accessToken])

  // ─── Auth ────────────────────────────────────────────────────────────────────
  const signIn = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!window.google || !clientId) {
      alert('Add VITE_GOOGLE_CLIENT_ID to your Netlify environment variables.')
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
          ls.set('vb_auth', authData)
        } catch (e) { console.error('Failed to get user info:', e) }
      },
    })
    client.requestAccessToken()
  }, [gisReady])

  const signOut = () => {
    localStorage.removeItem('vb_auth')
    setAuth(null); setCurrentTourId(null); setModal(null)
    setDrawerOpen(false); setDbReady(false)
  }

  const getToken = useCallback(() => {
    if (!auth?.accessToken) return null
    if (auth.expiresAt && Date.now() > auth.expiresAt - 120000) return null
    return auth.accessToken
  }, [auth])

  // ─── Helper: fire-and-forget DB write (optimistic) ───────────────────────────
  const persist = (fn) => { fn().catch(e => console.warn('DB write failed:', e.message)) }

  // ─── Tours ───────────────────────────────────────────────────────────────────
  const addTour = (d) => {
    const t = { ...d, id: `t_${Date.now()}`, createdAt: new Date().toISOString() }
    setTours(prev => [...prev, t])
    persist(() => db.upsert('tours', t, getToken()))
  }
  const updateTour = (id, d) => {
    setTours(prev => {
      const updated = prev.map(x => x.id === id ? { ...x, ...d } : x)
      const tour = updated.find(x => x.id === id)
      persist(() => db.upsert('tours', tour, getToken()))
      return updated
    })
  }
  const deleteTour = (id) => {
    setTours(t => t.filter(x => x.id !== id))
    setVenues(v => v.filter(x => x.tourId !== id))
    if (currentTourId === id) setCurrentTourId(null)
    persist(() => db.delete('tours', id, getToken()))
  }

  // ─── Venues ──────────────────────────────────────────────────────────────────
  const addVenue = (d) => {
    const { _saveToLib, ...venueData } = d
    const v = { ...venueData, id: `v_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }
    setVenues(prev => [...prev, v])
    persist(() => db.upsert('venues', v, getToken()))
    if (_saveToLib) {
      const entry = { id: `sv_${Date.now()}`, venueName: d.venueName, city: d.city, contactName: d.contactName, contactEmail: d.contactEmail, capacity: d.capacity, notes: d.notes }
      setSavedVenues(prev => [...prev, entry])
      persist(() => db.upsert('saved_venues', entry, getToken()))
    }
  }
  const updateVenue = (id, d) => {
    setVenues(prev => {
      const updated = prev.map(x => x.id === id ? { ...x, ...d } : x)
      const venue = updated.find(x => x.id === id)
      persist(() => db.upsert('venues', venue, getToken()))
      return updated
    })
  }
  const deleteVenue = (id) => {
    setVenues(v => v.filter(x => x.id !== id))
    persist(() => db.delete('venues', id, getToken()))
  }
  const markEmailSent = (id) => updateVenue(id, { status: 'email_sent', emailSentAt: new Date().toISOString() })

  // ─── Templates ───────────────────────────────────────────────────────────────
  const saveTemplate = (t) => {
    setCustomTemplates(prev => {
      const exists = prev.find(x => x.id === t.id)
      const updated = exists ? prev.map(x => x.id === t.id ? t : x) : [...prev, t]
      persist(() => db.upsert('email_templates', t, getToken()))
      return updated
    })
  }
  const deleteTemplate = (id) => {
    setCustomTemplates(prev => prev.filter(x => x.id !== id))
    persist(() => db.delete('email_templates', id, getToken()))
  }

  // ─── Saved Venues ────────────────────────────────────────────────────────────
  const saveSavedVenue = (v) => {
    setSavedVenues(prev => {
      const e = prev.find(x => x.id === v.id)
      const entry = e ? v : { ...v, id: `sv_${Date.now()}` }
      const updated = e ? prev.map(x => x.id === v.id ? entry : x) : [...prev, entry]
      persist(() => db.upsert('saved_venues', entry, getToken()))
      return updated
    })
  }
  const deleteSavedVenue = (id) => {
    setSavedVenues(prev => prev.filter(x => x.id !== id))
    persist(() => db.delete('saved_venues', id, getToken()))
  }

  // ─── Saved Artists ───────────────────────────────────────────────────────────
  const saveSavedArtist = (a) => {
    setSavedArtists(prev => {
      const e = prev.find(x => x.id === a.id)
      const entry = e ? a : { ...a, id: `sa_${Date.now()}` }
      const updated = e ? prev.map(x => x.id === a.id ? entry : x) : [...prev, entry]
      persist(() => db.upsert('saved_artists', entry, getToken()))
      return updated
    })
  }
  const deleteSavedArtist = (id) => {
    setSavedArtists(prev => prev.filter(x => x.id !== id))
    persist(() => db.delete('saved_artists', id, getToken()))
  }

  // ─── Settings ────────────────────────────────────────────────────────────────
  const handleSurveyLinkChange = (v) => {
    setSurveyLink(v)
    localStorage.setItem('vb_survey', v)
    persist(() => db.saveSettings({ surveyLink: v, sheetId }, getToken()))
  }
  const handleSheetIdChange = (v) => {
    setSheetId(v)
    localStorage.setItem('vb_sheet_id', v)
    persist(() => db.saveSettings({ surveyLink, sheetId: v }, getToken()))
  }

  // ─── Drawer navigation ───────────────────────────────────────────────────────
  const handleDrawerNav = (key) => {
    if (key === 'saved-venues')  { setShowSavedVenues(true);  return }
    if (key === 'saved-artists') { setShowSavedArtists(true); return }
    if (key === 'templates')     { setShowTemplates(true);    return }
    if (key === 'survey')        { setShowSurveyLink(true);   return }
    if (key === 'settings')      { setModal({ type: 'settings' }); return }
  }

  const close = () => setModal(null)
  const currentTour   = tours.find(t => t.id === currentTourId)
  const currentVenues = venues.filter(v => v.tourId === currentTourId)

  if (!auth) return <LoginScreen onSignIn={signIn} loading={!gisReady} />

  // Loading screen while DB syncs (only shown on first load, not on every refresh)
  if (!dbReady) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: '16px' }}>
        <div style={{ fontSize: '40px' }}>🎵</div>
        <div className="spinner" />
        <div style={{ fontSize: '14px', color: 'var(--text-2)' }}>Loading your data…</div>
      </div>
    )
  }

  return (
    <div className="app">
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} auth={auth} onNav={handleDrawerNav} onSignOut={signOut} />

      {currentTourId ? (
        <VenueList
          tour={currentTour} venues={currentVenues} templates={allTemplates}
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
          tours={tours} venues={venues} auth={auth}
          onSelectTour={setCurrentTourId}
          onAddTour={() => setModal({ type: 'tour', data: null })}
          onEditTour={(t) => setModal({ type: 'tour', data: t })}
          onDeleteTour={deleteTour}
          onOpenDrawer={() => setDrawerOpen(true)}
          onOpenSettings={() => setModal({ type: 'settings' })}
        />
      )}

      {modal?.type === 'tour' && (
        <TourModal tour={modal.data} templates={allTemplates} savedArtists={savedArtists}
          onSave={(d) => { modal.data ? updateTour(modal.data.id, d) : addTour(d); close() }}
          onDelete={modal.data ? () => { deleteTour(modal.data.id); close() } : null}
          onClose={close} />
      )}
      {modal?.type === 'venue' && (
        <VenueModal venue={modal.data} tourId={currentTourId} savedVenues={savedVenues}
          onSave={(d) => { modal.data ? updateVenue(modal.data.id, d) : addVenue(d); close() }}
          onClose={close} />
      )}
      {modal?.type === 'email' && (
        <EmailModal venue={modal.data} tour={currentTour} templates={allTemplates}
          surveyLink={surveyLink} accessToken={getToken()}
          onReAuth={signIn} onSent={() => { markEmailSent(modal.data.id); close() }} onClose={close} />
      )}
      {modal?.type === 'bulk' && (
        <BulkEmailModal venues={modal.data} tour={currentTour} templates={allTemplates}
          surveyLink={surveyLink} accessToken={getToken()}
          onReAuth={signIn} onSent={(ids) => { ids.forEach(id => markEmailSent(id)); close() }} onClose={close} />
      )}
      {modal?.type === 'survey' && <SurveyModal venue={modal.data} onClose={close} />}
      {modal?.type === 'settings' && <SettingsModal auth={auth} onSignOut={signOut} onClose={close} />}

      {showSavedVenues  && <SavedVenuesSheet  savedVenues={savedVenues}   onSave={saveSavedVenue}   onDelete={deleteSavedVenue}   onClose={() => setShowSavedVenues(false)} />}
      {showSavedArtists && <SavedArtistsSheet savedArtists={savedArtists} onSave={saveSavedArtist}  onDelete={deleteSavedArtist}  onClose={() => setShowSavedArtists(false)} />}
      {showTemplates    && <EmailTemplatesSheet customTemplates={customTemplates} defaultTemplates={DEFAULT_TEMPLATES} onSaveTemplate={saveTemplate} onDeleteTemplate={deleteTemplate} onClose={() => setShowTemplates(false)} />}
      {showSurveyLink   && <SurveyLinkSheet surveyLink={surveyLink} sheetId={sheetId} onSurveyLinkChange={handleSurveyLinkChange} onSheetIdChange={handleSheetIdChange} onClose={() => setShowSurveyLink(false)} />}
    </div>
  )
}
