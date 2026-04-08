const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' }

  try {
    const { access_token, sheet_id, venue } = event.queryStringParameters || {}

    if (!sheet_id) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No sheet_id provided' }) }
    if (!access_token) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'TOKEN_EXPIRED' }) }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheet_id}/values/Sheet1`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${access_token}` } })

    if (res.status === 401) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'TOKEN_EXPIRED' }) }
    if (!res.ok) {
      const e = await res.json()
      throw new Error(e.error?.message || 'Sheets API error')
    }

    const data = await res.json()
    const rows = data.values || []
    if (!rows.length) return { statusCode: 200, headers: CORS, body: JSON.stringify({ headers: [], rows: [], total: 0 }) }

    const sheetHeaders = rows[0]
    let dataRows = rows.slice(1)

    if (venue) {
      const vi = sheetHeaders.findIndex(h => h.toLowerCase().includes('venue'))
      if (vi !== -1) dataRows = dataRows.filter(r => r[vi]?.toLowerCase().includes(venue.toLowerCase()))
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ headers: sheetHeaders, rows: dataRows, total: dataRows.length }) }
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
  }
}
