import { useState, useEffect } from 'react'

export default function SurveyResultsModal({ venue, onClose }) {
  const [loading,   setLoading]   = useState(true)
  const [headers,   setHeaders]   = useState([])
  const [rows,      setRows]      = useState([])
  const [error,     setError]     = useState('')
  const [filterOn,  setFilterOn]  = useState(true)

  const fetchData = async (filter) => {
    setLoading(true)
    setError('')
    try {
      const qs = filter ? `?venue=${encodeURIComponent(venue.venueName)}` : ''
      const res = await fetch(`/.netlify/functions/get-survey-results${qs}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setHeaders(data.headers || [])
        setRows(data.rows || [])
      }
    } catch {
      setError('Could not connect to survey results. Check your Google Sheets Netlify configuration.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(filterOn) }, [filterOn])

  const exportCSV = () => {
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `${venue.venueName.replace(/\s+/g, '-')}-survey-results.csv`,
    })
    a.click()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-xlarge" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Survey Results — {venue.venueName}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="results-controls">
            <label className="toggle-label">
              <input type="checkbox" checked={filterOn} onChange={e => setFilterOn(e.target.checked)} />
              Show only responses for this venue
            </label>
            <button className="btn btn-ghost btn-sm" onClick={() => fetchData(filterOn)}>🔄 Refresh</button>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Fetching survey responses...</p>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-error">
              <strong>⚠️ Error:</strong> {error}
              <p className="error-hint">
                Make sure GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and
                GOOGLE_SERVICE_ACCOUNT_KEY are set in your Netlify environment variables.
              </p>
            </div>
          )}

          {!loading && !error && rows.length === 0 && (
            <div className="empty-state" style={{padding:'40px 24px'}}>
              <div className="empty-icon">📋</div>
              <h3>No responses yet</h3>
              <p>Responses for {venue.venueName} will appear here once venues submit the survey.</p>
            </div>
          )}

          {!loading && !error && rows.length > 0 && (
            <div>
              <p className="results-count">{rows.length} response{rows.length !== 1 ? 's' : ''} found</p>
              <div className="table-scroll">
                <table className="results-table">
                  <thead>
                    <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri}>
                        {headers.map((_, ci) => <td key={ci} title={row[ci]}>{row[ci] || '—'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {rows.length > 0 && (
            <button className="btn btn-secondary" onClick={exportCSV}>⬇️ Export CSV</button>
          )}
        </div>
      </div>
    </div>
  )
}
