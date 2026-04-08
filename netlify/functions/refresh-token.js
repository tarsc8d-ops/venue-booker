const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: '{}' }

  try {
    const { refresh_token } = JSON.parse(event.body)
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error_description || data.error)
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ access_token: data.access_token }) }
  } catch (err) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: err.message }) }
  }
}
