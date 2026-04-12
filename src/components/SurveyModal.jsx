import { useState, useEffect } from 'react'
import { netlifyFunctionUrl } from '../lib/netlifyUrl'

export default function SurveyModal({ venue, onClose }) {
  const [loading, setLoading] = useState(true)
  const [headers, setHeaders] = useState([])
  const [rows,    setRows]    = useState([])
  const [error,   setError]   = useState('')
  const [filterOn, setFilterOn] = useState(true)

  const load = async (filter) => {
    setLoading(true); setError('')
    try {
      const qs = filter ? `?venue=${encodeURIComponent(venue.venueName)}` : ''
      const data = await fetch(`${netlifyFunctionUrl('/.netlify/functions/get-survey-results')}${qs}`).then(r => r.json())
      if (data.error) setError(data.error)
      else { setHeaders(data.headers || []); setRows(data.rows || []) }
    } catch { setError('Could not load results. Check your Google Sheets configuration.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load(filterOn) }, [filterOn])

  const exportCSV = () => {
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n')
    Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `${venue.venueName}-survey.csv`
    }).click()
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet-tall" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>📊 Survey Results</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="sheet-body">
          <div className="survey-controls">
            <label className="toggle-row">
              <input type="checkbox" checked={filterOn} onChange={e => setFilterOn(e.target.checked)} />
              <span>This venue only</span>
            </label>
            <button className="btn-sm-ghost" onClick={() => load(filterOn)}>🔄 Refresh</button>
          </div>
          {loading && <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>}
          {!loading && error && <div className="alert-error">{error}</div>}
          {!loading && !error && rows.length === 0 && (
            <div className="empty">
              <div className="empty-emoji">📋</div>
              <h3>No responses yet</h3>
              <p>Survey responses will appear here once submitted.</p>
            </div>
          )}
          {!loading && !error && rows.length > 0 && (
            <div>
              <p className="results-count">{rows.length} response{rows.length !== 1 ? 's' : ''}</p>
              <div className="response-cards">
                {rows.map((row, ri) => (
                  <div key={ri} className="response-card">
                    {headers.map((h, ci) => row[ci] ? (
                      <div key={ci} className="response-row">
                        <div className="response-q">{h}</div>
                        <div className="response-a">{row[ci]}</div>
                      </div>
                    ) : null)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="sheet-footer">
          <button className="btn-ghost" onClick={onClose}>Close</button>
          {rows.length > 0 && <button className="btn-secondary" onClick={exportCSV}>⬇️ CSV</button>}
        </div>
      </div>
    </div>
  )
}
