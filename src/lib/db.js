// Supabase Edge Function — secure backend that verifies Google token + talks to DB
const DB_URL = 'https://ganzedlyvnwayhtipylh.supabase.co/functions/v1/venue-data'

async function call(action, payload, accessToken) {
  if (!accessToken) throw Object.assign(new Error('Session expired'), { status: 401 })
  const res = await fetch(DB_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action, ...payload }),
  })
  const result = await res.json()
  if (!res.ok) {
    const err = new Error(result.error || 'Database error')
    err.status = res.status
    throw err
  }
  return result.data
}

export const db = {
  /** Load all data for the current user */
  loadAll: (token) =>
    call('load_all', {}, token),

  /** Create or update a record (matched by id) */
  upsert: (table, data, token) =>
    call('upsert', { table, data }, token),

  /** Delete a record by id */
  delete: (table, id, token) =>
    call('delete', { table, id }, token),

  /** Save user settings (survey link, sheet id) */
  saveSettings: (data, token) =>
    call('save_settings', { data }, token),
}
