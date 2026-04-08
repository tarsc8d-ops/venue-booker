# 🎵 VenueBooker

Artist management tool for booking venues — send custom emails, track survey responses, and stay organized.

## Features

- 📋 **Venue Dashboard** — track all venues with status, dates, contacts
- ✉️ **Custom Email Sender** — auto-filled templates sent via Gmail API
- 📊 **Survey Results** — pull responses from Google Sheets in real time
- ⬇️ **CSV Export** — download survey results
- 💾 **Local Storage** — all venue data saved in the browser

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/tarsc8d-ops/venue-booker.git
cd venue-booker
npm install
```

### 2. Gmail OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Gmail API**
3. Create **OAuth 2.0 Client ID** (Desktop app type)
4. Use [OAuth Playground](https://developers.google.com/oauthplayground/) to get a refresh token:
   - Authorize `https://mail.google.com/`
   - Exchange for tokens → copy the **Refresh Token**

### 3. Google Sheets (Survey Results)

1. Create a **Google Form** — this auto-generates a linked Google Sheet
2. In Google Cloud Console → **Service Accounts** → create one, download the JSON key
3. Share your Google Sheet with the service account email address
4. Copy the **Sheet ID** from the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/`

### 4. Netlify Environment Variables

In Netlify → Site Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `GMAIL_USER` | your-email@gmail.com |
| `GMAIL_CLIENT_ID` | from Google Cloud OAuth credentials |
| `GMAIL_CLIENT_SECRET` | from Google Cloud OAuth credentials |
| `GMAIL_REFRESH_TOKEN` | from OAuth Playground |
| `GOOGLE_SHEETS_ID` | ID from your Google Sheet URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | service account email |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | private key from service account JSON (paste the full key, newlines as `\n`) |

### 5. Deploy to Netlify

Connect this repo to Netlify — it will auto-detect the build settings from `netlify.toml`.

Or deploy via Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## Local Development

```bash
npm run dev        # Vite dev server (port 5173)
netlify dev        # Full stack with Netlify functions (port 8888)
```

---

## App Settings

Click **⚙️ Settings** in the top right to set:
- **Artist / Act Name** — auto-fills outgoing email templates
- **Google Form Survey Link** — included in every email

---

## Tech Stack

- **Frontend**: React + Vite
- **Hosting**: Netlify
- **Email**: Gmail API via Nodemailer (Netlify Function)
- **Survey Data**: Google Sheets API (Netlify Function)
- **Storage**: Browser localStorage
