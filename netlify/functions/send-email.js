const { google } = require('googleapis')

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{}' }

  try {
    const { to, subject, body, accessToken } = JSON.parse(event.body)

    if (!to || !subject || !body) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing to, subject, or body.' }) }
    }
    if (!accessToken) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'No Google access token provided. Please sign in.' }) }
    }

    // Use the signed-in user's access token — no server-side secrets needed for sending
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: accessToken })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Build RFC 2822 email message
    const messageParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: quoted-printable',
      '',
      body,
    ]
    const raw = Buffer.from(messageParts.join('\r\n')).toString('base64url')

    await gmail.users.messages.send({ userId: 'me', requestBody: { raw } })

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
  } catch (error) {
    console.error('send-email error:', error.message)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    }
  }
}
