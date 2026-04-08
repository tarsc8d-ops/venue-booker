import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import AddVenueModal from './components/AddVenueModal'
import EmailModal from './components/EmailModal'
import SurveyResultsModal from './components/SurveyResultsModal'

const STORAGE_KEY = 'venue_booker_venues'

export default function App() {
  const [venues, setVenues] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null)
  const [emailVenue, setEmailVenue] = useState(null)
  const [resultsVenue, setResultsVenue] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [artistName, setArtistName] = useState(() => localStorage.getItem('vb_artist') || '')
  const [surveyLink, setSurveyLink] = useState(() => localStorage.getItem('vb_survey') || '')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(venues))
  }, [venues])

  const addVenue = (data) => {
    setVenues(prev => [...prev, { ...data, id: Date.now(), status: 'pending', createdAt: new Date().toISOString() }])
  }

  const updateVenue = (id, updates) => {
    setVenues(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v))
  }

  const deleteVenue = (id) => setVenues(prev => prev.filter(v => v.id !== id))

  const markEmailSent = (id) => updateVenue(id, { status: 'email_sent', emailSentAt: new Date().toISOString() })

  return (
    <div>
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">🎵 VenueBooker</div>
          <span className="tagline">Artist Management Platform</span>
        </div>
        <div className="header-right">
          <button className="btn btn-ghost" onClick={() => setSettingsOpen(true)}>⚙️ Settings</button>
          <button className="btn btn-primary" onClick={() => { setEditingVenue(null); setShowAddModal(true) }}>+ Add Venue</button>
        </div>
      </header>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="modal modal-medium" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚙️ Settings</h2>
              <button className="close-btn" onClick={() => setSettingsOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Artist / Act Name</label>
                <input
                  type="text"
                  value={artistName}
                  onChange={e => { setArtistName(e.target.value); localStorage.setItem('vb_artist', e.target.value) }}
                  placeholder="e.g. DJ Marcus, The Midnight Collective"
                />
              </div>
              <div className="form-group">
                <label>Google Form Survey Link</label>
                <input
                  type="url"
                  value={surveyLink}
                  onChange={e => { setSurveyLink(e.target.value); localStorage.setItem('vb_survey', e.target.value) }}
                  placeholder="https://forms.gle/..."
                />
              </div>
              <p className="settings-note">
                📌 These auto-fill your outgoing emails. Gmail & Google Sheets credentials
                are configured via Netlify Environment Variables — see README for setup.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSettingsOpen(false)}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="app-main">
        <Dashboard
          venues={venues}
          onAdd={() => { setEditingVenue(null); setShowAddModal(true) }}
          onEdit={(v) => { setEditingVenue(v); setShowAddModal(true) }}
          onDelete={deleteVenue}
          onSendEmail={setEmailVenue}
          onViewResults={setResultsVenue}
        />
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddVenueModal
          venue={editingVenue}
          defaultArtist={artistName}
          onSave={(data) => {
            if (editingVenue) updateVenue(editingVenue.id, data)
            else addVenue(data)
            setShowAddModal(false)
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {emailVenue && (
        <EmailModal
          venue={emailVenue}
          artistName={artistName}
          surveyLink={surveyLink}
          onSent={() => { markEmailSent(emailVenue.id); setEmailVenue(null) }}
          onClose={() => setEmailVenue(null)}
        />
      )}

      {resultsVenue && (
        <SurveyResultsModal
          venue={resultsVenue}
          onClose={() => setResultsVenue(null)}
        />
      )}
    </div>
  )
}
