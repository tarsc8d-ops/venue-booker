const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: '{}' }

  try {
    const { to, subject, body, access_token } = JSON.parse(event.body)
    if (!to || !subject || !body) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing to, subject, or body' }) }
    if (!access_token) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'TOKEN_EXPIRED' }) }

    // Build RFC 2822 message and base64url-encode it
    const raw = Buffer.from(
      [`To: ${to}`, `Subject: ${subject}`, 'Content-Type: text/plain; charset=utf-8', '', body].join('\r\n')
    ).toString('base64url')

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    })

    if (res.status === 401) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'TOKEN_EXPIRED', code: 'TOKEN_EXPIRED' }) }

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Gmail API error')

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, id: data.id }) }
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
  }
}
