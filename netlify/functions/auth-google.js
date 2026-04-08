exports.handler = async () => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const siteUrl = process.env.URL || 'https://venue-booker.netlify.app'
  const redirectUri = `${siteUrl}/.netlify/functions/auth-callback`

  const scope = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ].join(' ')

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scope)
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')

  return { statusCode: 302, headers: { Location: url.toString() } }
}
