import { useState, useMemo } from 'react'
import { db } from '../lib/db'

function membersForTeam(teamMembers, teamId) {
  return (teamMembers || []).filter((m) => m.team_id === teamId)
}

function sharesForTeam(teamShares, teamId) {
  return (teamShares || []).filter((s) => String(s.team_id) === String(teamId))
}

function hasShare(shares, teamId, type, resourceId) {
  return shares.some(
    (s) =>
      String(s.team_id) === String(teamId)
      && s.resource_type === type
      && s.resource_id === resourceId,
  )
}

export default function TeamsScreen({
  teamsList,
  teamMembers,
  teamShares,
  tours,
  customTemplates,
  savedArtists,
  getToken,
  onRefresh,
}) {
  const [name, setName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [openId, setOpenId] = useState(null)

  const token = getToken()

  const createTeam = async () => {
    const n = name.trim()
    if (!n || !token) return
    setBusy(true); setErr('')
    try {
      await db.teamCreate(n, token)
      setName('')
      await onRefresh()
    } catch (e) {
      setErr(e.message || 'Could not create team')
    } finally { setBusy(false) }
  }

  const joinTeam = async () => {
    const c = joinCode.trim().toUpperCase()
    if (!c || !token) return
    setBusy(true); setErr('')
    try {
      await db.teamJoin(c, token)
      setJoinCode('')
      await onRefresh()
    } catch (e) {
      setErr(e.message || 'Invalid code')
    } finally { setBusy(false) }
  }

  const copyInviteLink = (code) => {
    const u = new URL(window.location.href)
    u.searchParams.set('joinTeam', code)
    navigator.clipboard.writeText(u.toString()).then(() => {}).catch(() => {})
  }

  const toggleShare = async (teamId, resourceType, resourceId, on) => {
    if (!token) return
    setBusy(true); setErr('')
    try {
      if (on) await db.teamShare(teamId, resourceType, resourceId, token)
      else await db.teamUnshare(teamId, resourceType, resourceId, token)
      await onRefresh()
    } catch (e) {
      setErr(e.message || 'Share failed')
    } finally { setBusy(false) }
  }

  const ownTours = useMemo(() => tours.filter((t) => !t._shared), [tours])
  const ownTpls = useMemo(() => customTemplates.filter((t) => !t._shared), [customTemplates])
  const ownArtists = useMemo(() => savedArtists.filter((a) => !a._shared), [savedArtists])

  return (
    <div className="mobile-page">
      <div className="mobile-page-header">
        <h1 className="mobile-page-title">Teams</h1>
      </div>
      <div className="mobile-page-body mobile-page-scroll">
        <p className="teams-intro">
          Create a team, share invite link with collaborators, then share tours, email templates, and artists.
        </p>

        {err && <div className="alert-error" style={{ marginBottom: '12px' }}>{err}</div>}

        <div className="teams-card">
          <div className="settings-label">New team</div>
          <input
            className="search-input"
            style={{ width: '100%', marginTop: '8px' }}
            placeholder="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="button" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={busy || !name.trim()} onClick={createTeam}>
            Create team
          </button>
        </div>

        <div className="teams-card" style={{ marginTop: '14px' }}>
          <div className="settings-label">Join with code</div>
          <input
            className="search-input"
            style={{ width: '100%', marginTop: '8px' }}
            placeholder="Invite code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
          <button type="button" className="btn-secondary" style={{ width: '100%', marginTop: '10px' }} disabled={busy || !joinCode.trim()} onClick={joinTeam}>
            Join team
          </button>
        </div>

        <div className="mobile-section-label" style={{ marginTop: '22px' }}>Your teams</div>
        {(!teamsList || teamsList.length === 0) ? (
          <div className="empty" style={{ padding: '32px 0' }}>
            <p>No teams yet. Create one or join with a code.</p>
          </div>
        ) : (
          <div className="teams-list">
            {teamsList.map((team) => {
              const tid = team.id
              const expanded = openId === tid
              const members = membersForTeam(teamMembers, tid)
              const shares = sharesForTeam(teamShares, tid)
              return (
                <div key={tid} className="teams-team-card">
                  <button
                    type="button"
                    className="teams-team-header"
                    onClick={() => setOpenId(expanded ? null : tid)}
                  >
                    <span className="teams-team-name">{team.name}</span>
                    <span className="teams-team-meta">{team.role === 'owner' ? 'Owner' : 'Member'} · {members.length} people</span>
                  </button>
                  {expanded && (
                    <div className="teams-team-body">
                      <div className="teams-invite-row">
                        <span className="teams-code">{team.inviteCode}</span>
                        <button type="button" className="btn-sm-ghost" onClick={() => copyInviteLink(team.inviteCode)}>Copy link</button>
                      </div>
                      <div className="settings-label" style={{ marginTop: '12px' }}>Members</div>
                      <ul className="teams-members">
                        {members.map((m) => (
                          <li key={`${m.team_id}-${m.user_id}`}>{m.email || m.user_id}</li>
                        ))}
                      </ul>

                      <div className="settings-label" style={{ marginTop: '14px' }}>Share with team</div>
                      <div className="teams-share-group">
                        <div className="teams-share-label">Tours</div>
                        {ownTours.length === 0 && <p className="teams-share-empty">No tours to share</p>}
                        {ownTours.map((t) => (
                          <label key={t.id} className="teams-share-row">
                            <input
                              type="checkbox"
                              checked={hasShare(shares, tid, 'tour', t.id)}
                              disabled={busy}
                              onChange={(e) => toggleShare(tid, 'tour', t.id, e.target.checked)}
                            />
                            <span>{t.name}</span>
                          </label>
                        ))}
                      </div>
                      <div className="teams-share-group">
                        <div className="teams-share-label">Email templates</div>
                        {ownTpls.length === 0 && <p className="teams-share-empty">No custom templates</p>}
                        {ownTpls.map((t) => (
                          <label key={t.id} className="teams-share-row">
                            <input
                              type="checkbox"
                              checked={hasShare(shares, tid, 'email_template', t.id)}
                              disabled={busy}
                              onChange={(e) => toggleShare(tid, 'email_template', t.id, e.target.checked)}
                            />
                            <span>{t.name}</span>
                          </label>
                        ))}
                      </div>
                      <div className="teams-share-group">
                        <div className="teams-share-label">Artists</div>
                        {ownArtists.length === 0 && <p className="teams-share-empty">No saved artists</p>}
                        {ownArtists.map((a) => (
                          <label key={a.id} className="teams-share-row">
                            <input
                              type="checkbox"
                              checked={hasShare(shares, tid, 'saved_artist', a.id)}
                              disabled={busy}
                              onChange={(e) => toggleShare(tid, 'saved_artist', a.id, e.target.checked)}
                            />
                            <span>{a.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        <div className="mobile-page-bottom-spacer" aria-hidden />
      </div>
    </div>
  )
}
