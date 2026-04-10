import { useState, useEffect, useCallback } from 'react'
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
import DesktopSidebar from './components/DesktopSidebar'
import DesktopSection from './components/DesktopSection'
import SavedVenuesSheet from './components/SavedVenuesSheet'
import SavedArtistsSheet from './components/SavedArtistsSheet'
import EmailTemplatesSheet from './components/EmailTemplatesSheet'
import SurveyLinksSheet from './components/SurveyLinksSheet'

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
    name: 'Standard Booking',
    subject: 'Upcoming Performance at {{venue_name}}',
    body: `Hi {{contact_name}},\n\nWe're excited to reach out about an upcoming performance at {{venue_name}}.\n\n{{artist}} will be performing on {{date}} at {{time}}.\n\nTo help us prepare and make this the best possible show, we'd love for your team to fill out our quick venue survey covering sound requirements, load-in logistics, and a few questions about your space:\n\n{{survey_link}}\n\nDon't hesitate to reach out with any questions — we're looking forward to working with you!\n\nBest regards,\nArtist Management`,
    isDefault: true,
  },
  {
    id: 'tpl-inquiry',
    name: 'Booking Inquiry',
    subject: 'Booking Inquiry: {{artist}} at {{venue_name}}',
    body: `Hi {{contact_name}},\n\nMy name is [Your Name] and I represent {{artist}}. We're currently booking shows for our upcoming tour and would love to bring the act to {{venue_name}} in {{city}}.\n\nWe're looking at {{date}} — would that date work for your venue?\n\nPlease fill out our venue information form so we can get the details we need:\n\n{{survey_link}}\n\nLooking forward to hearing from you!\n\nBest,\n[Your Name]\nArtist Management`,
    isDefault: true,
  },
  {
    id: 'tpl-followup',
    name: 'Follow-Up',
    subject: 'Following Up: {{artist}} at {{venue_name}}',
    body: `Hi {{contact_name}},\n\nJust following up on my previous email about {{artist}} performing at {{venue_name}} on {{date}}.\n\nIf you haven't had a chance to fill out our venue survey yet, here's the link:\n\n{{survey_link}}\n\nPlease let us know if you have any questions. We're excited about the possibility of working together!\n\nBest,\n[Your Name]\nArtist Management`,
    isDefault: true,
  },
]

const SECTION_KEYS = ['saved-venues', 'saved-artists', 'templates', 'survey', 'settings']

export default function App() {
  const [gisReady, setGisReady] = useState(false)
  const [auth, setAuth]         = useState(() => ls.get('vb_auth', null))
  const [dbReady, setDbReady]   = useState(false)

  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768)
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const [tours,           setTours]           = useState([])
  const [venues,          setVenues]          = useState([])
  const [surveyLink,      setSurveyLink]      = useState('')
  const [sheetId,         setSheetId]         = useState('')
  const [customTemplates, setCustomTemplates] = useState([])
  const [savedVenues,     setSavedVenues]     = useState([])
  const [savedArtists,    setSavedArtists]    = useState([])
  const [surveyLinks,     setSurveyLinks]     = useState([])

  const [currentTourId,  setCurrentTourId]  = useState(null)
  const [desktopSection, setDesktopSection] = useState(null)
  const [modal,          setModal]          = useState(null)
  const [drawerOpen,     setDrawerOpen]     = useState(false)

  const [showSavedVenues,  setShowSavedVenues]  = useState(false)
  const [showSavedArtists, setShowSavedArtists] = useState(false)
  const [showTemplates,    setShowTemplates]    = useState(false)
  const [showSurveyLinks,  setShowSurveyLinks]  = useState(false)

  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates]

  const getSurveyUrl = useCallback((tour) => {
    if (tour?.surveyLinkId) {
      const found = surveyLinks.find(l => l.id === tour.surveyLinkId)
      if (found?.url) return found.url
    }
    return surveyLink
  }, [surveyLinks, surveyLink])

  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true; s.onload = () => setGisReady(true)
    document.head.appendChild(s)
  }, [])

  const applyRemote = useCallback((remote) => {
    setTours(remote.tours          ?? [])
    setVenues(remote.venues         ?? [])
    setSavedVenues(remote.savedVenues    ?? [])
    setSavedArtists(remote.savedArtists  ?? [])
    setCustomTemplates(remote.templates  ?? [])
    setSurveyLinks(remote.surveyLinks    ?? [])
    if (remote.settings?.surveyLink != null) setSurveyLink(remote.settings.surveyLink)
    if (remote.settings?.sheetId    != null) setSheetId(remote.settings.sheetId)
  }, [])

  // ── Clean sign-out: called when token is expired/invalid ─────────────────
  const signOut = useCallback(() => {
    localStorage.removeItem('vb_auth')
    setAuth(null); setCurrentTourId(null); setModal(null)
    setDrawerOpen(false); setDbReady(false)
    setDesktopSection(null); setTours([]); setVenues([])
  }, [])

  const syncFromDB = useCallback(async (token) => {
    if (!token) { setDbReady(true); return }
    try {
      const remote = await db.loadAll(token)
      const isEmpty = !remote.tours?.length && !remote.venues?.length
      const localTours  = ls.get('vb_tours', [])
      const localVenues = ls.get('vb_venues', [])
      if (isEmpty && (localTours.length || localVenues.length)) {
        const localSavedV = ls.get('vb_saved_venues', [])
        const localSavedA = ls.get('vb_saved_artists', [])
        const localTpls   = ls.get('vb_templates', [])
        const lSurvey     = localStorage.getItem('vb_survey') || ''
        const lSheetId    = localStorage.getItem('vb_sheet_id') || ''
        await Promise.allSettled([
          ...localTours.map(t  => db.upsert('tours',           t, token)),
          ...localVenues.map(v => db.upsert('venues',          v, token)),
          ...localSavedV.map(v => db.upsert('saved_venues',    v, token)),
          ...localSavedA.map(a => db.upsert('saved_artists',   a, token)),
          ...localTpls.map(t   => db.upsert('email_templates', t, token)),
          (lSurvey || lSheetId) ? db.saveSettings({ surveyLink: lSurvey, sheetId: lSheetId }, token) : Promise.resolve(),
        ])
        applyRemote(await db.loadAll(token))
      } else {
        applyRemote(remote)
      }
    } catch (err) {
      if (err.status === 401 || err.message?.includes('Invalid') || err.message?.includes('expired')) {
        // Token expired on initial load — sign out cleanly so user just logs in again
        signOut()
        return
      }
      // Non-auth failure: fall back to localStorage so app still works offline
      console.warn('DB sync failed:', err.message)
      setTours(ls.get('vb_tours', [])); setVenues(ls.get('vb_venues', []))
      setSavedVenues(ls.get('vb_saved_venues', [])); setSavedArtists(ls.get('vb_saved_artists', []))
      setCustomTemplates(ls.get('vb_templates', []))
      setSurveyLink(localStorage.getItem('vb_survey') || '')
      setSheetId(localStorage.getItem('vb_sheet_id') || '')
    } finally { setDbReady(true) }
  }, [applyRemote, signOut])

  useEffect(() => {
    if (auth?.accessToken) syncFromDB(auth.accessToken)
    else setDbReady(true)
  }, [auth?.accessToken])

  const signIn = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!window.google || !clientId) { alert('Add VITE_GOOGLE_CLIENT_ID to your Netlify env vars.'); return }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId, scope: GIS_SCOPES,
      callback: async (resp) => {
        if (resp.error) { console.error('OAuth error:', resp); return }
        try {
          const r = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${resp.access_token}` } })
          const user = await r.json()
          const authData = {
            accessToken: resp.access_token,
            email: user.email,
            name: user.name || user.email,
            picture: user.picture,
            expiresAt: Date.now() + resp.expires_in * 1000,
          }
          setAuth(authData); setDbReady(false)
          ls.set('vb_auth', authData)
        } catch (e) { console.error('Failed to get user info:', e) }
      },
    })
    client.requestAccessToken()
  }, [gisReady])

  const getToken = useCallback(() => auth?.accessToken || null, [auth])

  // persist: on 401, just sign out silently — no banner
  const persist = useCallback((fn) => {
    fn().catch(err => {
      if (err.status === 401 || err.message?.includes('Invalid') || err.message?.includes('expired')) {
        signOut() // Token expired mid-session — sign out, user logs back in
      } else {
        console.warn('DB write failed:', err.message)
      }
    })
  }, [signOut])

  // ── Data mutations ────────────────────────────────────────────────────────
  const addTour = (d) => {
    const t = { ...d, id: `t_${Date.now()}`, createdAt: new Date().toISOString() }
    setTours(prev => [...prev, t]); persist(() => db.upsert('tours', t, getToken()))
  }
  const updateTour = (id, d) => {
    setTours(prev => {
      const updated = prev.map(x => x.id === id ? { ...x, ...d } : x)
      persist(() => db.upsert('tours', updated.find(x => x.id === id), getToken()))
      return updated
    })
  }
  const deleteTour = (id) => {
    setTours(t => t.filter(x => x.id !== id)); setVenues(v => v.filter(x => x.tourId !== id))
    if (currentTourId === id) setCurrentTourId(null)
    persist(() => db.delete('tours', id, getToken()))
  }
  const addVenue = (d) => {
    const { _saveToLib, ...venueData } = d
    const v = { ...venueData, id: `v_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }
    setVenues(prev => [...prev, v]); persist(() => db.upsert('venues', v, getToken()))
    if (_saveToLib) {
      const entry = { id: `sv_${Date.now()}`, venueName: d.venueName, city: d.city, contactName: d.contactName, contactEmail: d.contactEmail, capacity: d.capacity, notes: d.notes }
      setSavedVenues(prev => [...prev, entry]); persist(() => db.upsert('saved_venues', entry, getToken()))
    }
  }
  const updateVenue = (id, d) => {
    setVenues(prev => {
      const updated = prev.map(x => x.id === id ? { ...x, ...d } : x)
      persist(() => db.upsert('venues', updated.find(x => x.id === id), getToken()))
      return updated
    })
  }
  const deleteVenue   = (id) => { setVenues(v => v.filter(x => x.id !== id)); persist(() => db.delete('venues', id, getToken())) }
  const markEmailSent = (id) => updateVenue(id, { status: 'email_sent', emailSentAt: new Date().toISOString() })

  const saveTemplate   = (t) => { setCustomTemplates(prev => { const e = prev.find(x => x.id === t.id); persist(() => db.upsert('email_templates', t, getToken())); return e ? prev.map(x => x.id === t.id ? t : x) : [...prev, t] }) }
  const deleteTemplate = (id) => { setCustomTemplates(prev => prev.filter(x => x.id !== id)); persist(() => db.delete('email_templates', id, getToken())) }
  const saveSavedVenue   = (v) => { setSavedVenues(prev => { const e = prev.find(x => x.id === v.id); const entry = e ? v : { ...v, id: `sv_${Date.now()}` }; persist(() => db.upsert('saved_venues', entry, getToken())); return e ? prev.map(x => x.id === v.id ? entry : x) : [...prev, entry] }) }
  const deleteSavedVenue = (id) => { setSavedVenues(prev => prev.filter(x => x.id !== id)); persist(() => db.delete('saved_venues', id, getToken())) }
  const saveSavedArtist   = (a) => { setSavedArtists(prev => { const e = prev.find(x => x.id === a.id); const entry = e ? a : { ...a, id: `sa_${Date.now()}` }; persist(() => db.upsert('saved_artists', entry, getToken())); return e ? prev.map(x => x.id === a.id ? entry : x) : [...prev, entry] }) }
  const deleteSavedArtist = (id) => { setSavedArtists(prev => prev.filter(x => x.id !== id)); persist(() => db.delete('saved_artists', id, getToken())) }
  const saveSurveyLink   = (l) => { setSurveyLinks(prev => { const e = prev.find(x => x.id === l.id); const entry = e ? l : { ...l, id: `sl_${Date.now()}`, createdAt: new Date().toISOString() }; persist(() => db.upsert('survey_links', entry, getToken())); return e ? prev.map(x => x.id === l.id ? entry : x) : [...prev, entry] }) }
  const deleteSurveyLink = (id) => { setSurveyLinks(prev => prev.filter(x => x.id !== id)); persist(() => db.delete('survey_links', id, getToken())) }

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNav = (key) => {
    if (key === 'tours') { setCurrentTourId(null); setDesktopSection(null); return }
    if (isDesktop && SECTION_KEYS.includes(key)) { setDesktopSection(key); setCurrentTourId(null); return }
    if (key === 'saved-venues')  { setShowSavedVenues(true);  return }
    if (key === 'saved-artists') { setShowSavedArtists(true); return }
    if (key === 'templates')     { setShowTemplates(true);    return }
    if (key === 'survey')        { setShowSurveyLinks(true);  return }
    if (key === 'settings')      { setModal({ type: 'settings' }); return }
  }

  const handleSelectTour = (id) => { setDesktopSection(null); setCurrentTourId(id) }

  const close = () => setModal(null)
  const currentTour   = tours.find(t => t.id === currentTourId)
  const currentVenues = venues.filter(v => v.tourId === currentTourId)
  const sidebarPage   = desktopSection || (currentTourId ? 'venues' : 'tours')

  if (!auth) return <LoginScreen onSignIn={signIn} loading={!gisReady} />

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
      {/* No session-expired banner — expired token just signs you out */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} auth={auth} onNav={handleNav} onSignOut={signOut} />
      <DesktopSidebar auth={auth} currentPage={sidebarPage} onNav={handleNav} onSignOut={signOut} />

      <div className="desktop-main">
        {isDesktop && desktopSection ? (
          <DesktopSection
            section={desktopSection}
            savedVenues={savedVenues}
            savedVenuesSave={saveSavedVenue}
            savedVenuesDelete={deleteSavedVenue}
            savedArtists={savedArtists}
            savedArtistsSave={saveSavedArtist}
            savedArtistsDelete={deleteSavedArtist}
            customTemplates={customTemplates}
            defaultTemplates={DEFAULT_TEMPLATES}
            onSaveTemplate={saveTemplate}
            onDeleteTemplate={deleteTemplate}
            surveyLinks={surveyLinks}
            surveyLinksSave={saveSurveyLink}
            surveyLinksDelete={deleteSurveyLink}
            auth={auth}
            onSignOut={signOut}
          />
        ) : currentTourId ? (
          <VenueList
            tour={currentTour} venues={currentVenues} templates={allTemplates} auth={auth}
            onBack={() => setCurrentTourId(null)}
            onAddVenue={() => setModal({ type: 'venue', data: null })}
            onEditVenue={(v) => setModal({ type: 'venue', data: v })}
            onDeleteVenue={deleteVenue}
            onSendEmail={(v) => setModal({ type: 'email', data: v })}
            onViewSurvey={(v) => setModal({ type: 'survey', data: v })}
            onBulkEmail={(vs) => setModal({ type: 'bulk', data: vs })}
            onTestEmail={() => setModal({ type: 'test-email' })}
          />
        ) : (
          <TourList
            tours={tours} venues={venues} auth={auth}
            onSelectTour={handleSelectTour}
            onAddTour={() => setModal({ type: 'tour', data: null })}
            onEditTour={(t) => setModal({ type: 'tour', data: t })}
            onDeleteTour={deleteTour}
            onOpenDrawer={() => setDrawerOpen(true)}
            onOpenSettings={() => isDesktop ? setDesktopSection('settings') : setModal({ type: 'settings' })}
          />
        )}
      </div>

      {modal?.type === 'tour' && (
        <TourModal tour={modal.data} templates={allTemplates} savedArtists={savedArtists} surveyLinks={surveyLinks}
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
          surveyLink={getSurveyUrl(currentTour)} accessToken={getToken()}
          onReAuth={signIn} onSent={() => { markEmailSent(modal.data.id); close() }} onClose={close} />
      )}
      {modal?.type === 'test-email' && (
        <EmailModal
          venue={{ venueName: 'Test Venue', contactName: auth?.name, contactEmail: auth?.email, showDate: new Date().toISOString().split('T')[0], showTime: '20:00' }}
          tour={currentTour} templates={allTemplates}
          surveyLink={getSurveyUrl(currentTour)} accessToken={getToken()}
          isTest onReAuth={signIn} onSent={close} onClose={close} />
      )}
      {modal?.type === 'bulk' && (
        <BulkEmailModal venues={modal.data} tour={currentTour} templates={allTemplates}
          surveyLink={getSurveyUrl(currentTour)} accessToken={getToken()}
          onReAuth={signIn} onSent={(ids) => { ids.forEach(id => markEmailSent(id)); close() }} onClose={close} />
      )}
      {modal?.type === 'survey' && <SurveyModal venue={modal.data} onClose={close} />}
      {modal?.type === 'settings' && <SettingsModal auth={auth} onSignOut={signOut} onClose={close} />}

      {showSavedVenues  && <SavedVenuesSheet  savedVenues={savedVenues}   onSave={saveSavedVenue}   onDelete={deleteSavedVenue}   onClose={() => setShowSavedVenues(false)} />}
      {showSavedArtists && <SavedArtistsSheet savedArtists={savedArtists} onSave={saveSavedArtist}  onDelete={deleteSavedArtist}  onClose={() => setShowSavedArtists(false)} />}
      {showTemplates    && <EmailTemplatesSheet customTemplates={customTemplates} defaultTemplates={DEFAULT_TEMPLATES} onSaveTemplate={saveTemplate} onDeleteTemplate={deleteTemplate} onClose={() => setShowTemplates(false)} />}
      {showSurveyLinks  && <SurveyLinksSheet surveyLinks={surveyLinks} onSave={saveSurveyLink} onDelete={deleteSurveyLink} onClose={() => setShowSurveyLinks(false)} />}
    </div>
  )
}
