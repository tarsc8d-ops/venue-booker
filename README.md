# 🎵 VenueBooker v2

Mobile-first artist management tool. Organize tours, send booking emails via Gmail, pull survey results from Google Sheets.

## Features
- 🔐 **Sign in with Google** — uses your real Gmail to send emails
- 🗺️ **Tours** — group venues by tour/run of shows
- ✉️ **Custom Emails** — auto-filled templates, editable before sending
- 📊 **Survey Results** — pull Google Sheets responses per venue
- ✏️ **Full CRUD** — add, edit, delete tours and venues
- 📱 **Mobile-first** — designed to use on your phone

---

## Setup (2 env vars only)

### Step 1 — Google Cloud Console
1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a project → Enable **Gmail API** + **Google Sheets API**
3. Go to **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://venue-booker.netlify.app`
   - Leave redirect URIs blank (uses GIS popup flow)
4. Copy the **Client ID**

### Step 2 — Netlify Environment Variables
In Netlify → **Site configuration → Environment variables**, add:

| Variable | Value |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | your `...apps.googleusercontent.com` Client ID |

That's it. No client secret, no service account, no refresh tokens.

### Step 3 — App Settings (after deploy)
Open the app → tap **Settings**:
- Paste your **Google Form survey link** (included in every email)
- Paste your **Google Sheet ID** (for viewing survey responses)

Your Sheet ID is in the URL: `docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

---

## How it works

**Sign-in:** Uses Google Identity Services (GIS) popup — you authorize once per session (~1 hour). No passwords or tokens stored on any server.

**Email sending:** Your Gmail access token is passed to a Netlify Function which calls the Gmail REST API. Emails come from your own Gmail address.

**Survey results:** Your access token is also used to read your Google Sheet directly. Just make sure you're signed in with the same Google account that owns the Sheet.

---

## Local Dev

```bash
npm install
npm run dev
```

For functions, you need [Netlify CLI](https://docs.netlify.com/cli/get-started/):
```bash
netlify dev
```

Add a `.env` file with:
```
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

---

## Tech Stack
- React + Vite (frontend)
- Netlify (hosting + serverless functions)
- Gmail REST API (email)
- Google Sheets REST API (survey results)
- Google Identity Services (OAuth popup)
- localStorage (venue/tour data)
