const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// RFC 2047 encode a subject line so emojis, em dashes, etc. survive email headers
function encodeSubject(str) {
  // If it's pure ASCII, no encoding needed
  if (/^[\x00-\x7F]*$/.test(str)) return str
  // Otherwise wrap as UTF-8 base64 encoded-word
  return `=?UTF-8?B?${Buffer.from(str, 'utf8').toString('base64')}?=`
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: '{}' }

  try {
    const payload = JSON.parse(event.body)
    const { to, subject, body } = payload
    const token = payload.accessToken || payload.access_token

    if (!to || !subject || !body) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing to, subject, or body' }) }
    if (!token) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'No access token. Please sign in.' }) }

    // Encode subject for non-ASCII characters (emojis, em dashes, accents, etc.)
    const encodedSubject = encodeSubject(subject)

    // Build RFC 2822 message and base64url-encode it
    const raw = Buffer.from(
      [
        `To: ${to}`,
        `Subject: ${encodedSubject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=utf-8',
        'Content-Transfer-Encoding: base64',
        '',
        Buffer.from(body, 'utf8').toString('base64'),
      ].join('\r\n')
    ).toString('base64url')

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    })

    if (res.status === 401) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'invalid_token — session expired' }) }

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Gmail API error')

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, id: data.id }) }
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
  }
}
