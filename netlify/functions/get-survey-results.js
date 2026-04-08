const { google } = require('googleapis')

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const venueFilter = event.queryStringParameters?.venue || ''

    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Sheet1',
    })

    const rows = response.data.values || []

    if (rows.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ headers: [], rows: [], total: 0 }),
      }
    }

    const sheetHeaders = rows[0]
    let dataRows = rows.slice(1)

    // Filter by venue name if requested
    if (venueFilter) {
      const venueColIndex = sheetHeaders.findIndex(h =>
        h.toLowerCase().includes('venue')
      )
      if (venueColIndex !== -1) {
        dataRows = dataRows.filter(row =>
          row[venueColIndex]?.toLowerCase().includes(venueFilter.toLowerCase())
        )
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        headers: sheetHeaders,
        rows: dataRows,
        total: dataRows.length,
      }),
    }
  } catch (error) {
    console.error('get-survey-results error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
