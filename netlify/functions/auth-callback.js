exports.handler = async (event) => {
  const { code, error } = event.queryStringParameters || {}
  const siteUrl = process.env.URL || 'https://venue-booker.netlify.app'
  const redirectUri = `${siteUrl}/.netlify/functions/auth-callback`

  if (error) return { statusCode: 302, headers: { Location: `${siteUrl}/#error=${encodeURIComponent(error)}` } }
  if (!code) return { statusCode: 302, headers: { Location: `${siteUrl}/#error=no_code` } }

  try {
    // Exchange auth code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (tokens.error) throw new Error(tokens.error_description || tokens.error)

    // Get user profile
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await userRes.json()

    const params = new URLSearchParams({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || '',
      email: profile.email || '',
      name: profile.name || '',
      avatar: profile.picture || '',
    })

    return { statusCode: 302, headers: { Location: `${siteUrl}/#${params}` } }
  } catch (err) {
    return { statusCode: 302, headers: { Location: `${siteUrl}/#error=${encodeURIComponent(err.message)}` } }
  }
}
