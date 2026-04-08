const nodemailer = require('nodemailer')

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { to, subject, body } = JSON.parse(event.body)

    if (!to || !subject || !body) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields: to, subject, body' }) }
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    })

    await transporter.sendMail({
      from: `"Artist Management" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text: body,
      html: body.split('\n').map(line => `<p>${line}</p>`).join(''),
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Email sent successfully' }),
    }
  } catch (error) {
    console.error('send-email error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    }
  }
}
