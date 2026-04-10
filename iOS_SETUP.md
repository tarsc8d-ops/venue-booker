# VenBook — iOS Setup Guide

Complete these steps once in your terminal and Xcode to get VenBook running as a native iOS app.

---

## Step 1 — Install dependencies

```bash
cd /path/to/venue-booker
npm install
```

---

## Step 2 — Create iOS OAuth Client in Google Cloud Console

You need a **separate** OAuth client ID for iOS (different from the web one).

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **iOS**
4. Name: `VenBook iOS`
5. Bundle ID: `com.venbook.app`
6. Click **Create**
7. Copy the **Client ID** — it looks like: `496348736505-xxxxxxxxxxxx.apps.googleusercontent.com`

Then open `capacitor.config.ts` and replace `REPLACE_WITH_IOS_CLIENT_ID` with your new iOS client ID.

---

## Step 3 — Add iOS platform and sync

```bash
# Build the web app
npm run build

# Add iOS platform (only needed once)
npx cap add ios

# Sync web assets into the iOS project
npx cap sync ios
```

---

## Step 4 — Configure Xcode

```bash
# Open in Xcode
npx cap open ios
```

Inside Xcode:
1. Select the **App** target in the left sidebar
2. Under **Signing & Capabilities**:
   - Select your **Team** (your Apple Developer account)
   - The **Bundle Identifier** should be `com.venbook.app`
   - Enable **Automatically manage signing**
3. Under **Info** → **URL Types**, add a URL Scheme:
   - **Identifier**: `com.venbook.app`
   - **URL Schemes**: `com.venbook.app` *(This is needed for Google Sign-In deep link callback)*

---

## Step 5 — Add Google Sign-In URL scheme

The `@capacitor/google-auth` plugin requires a reversed iOS client ID as a URL scheme.

Your iOS client ID: `496348736505-xxxx.apps.googleusercontent.com`  
Reversed: `com.googleusercontent.apps.496348736505-xxxx`

In Xcode → **Info** → **URL Types**, add a second entry:
- **URL Schemes**: your reversed iOS client ID (the full reversed string above)

---

## Step 6 — Run on your device or simulator

In Xcode, select your iPhone from the device picker and click ▶ Run.

Or from the terminal (with a connected device):
```bash
npx cap run ios
```

---

## Step 7 — Ongoing development

After making code changes:
```bash
# Rebuild and sync in one command
npm run ios:build

# Then in Xcode, click ▶ Run again (or use)
npx cap run ios
```

Or use the shortcut that does everything:
```bash
npm run ios
# This runs: build → sync → open Xcode
```

---

## Submitting to the App Store

1. In Xcode, set the scheme to **Release**
2. **Product** → **Archive**
3. In the Organizer, click **Distribute App** → **App Store Connect**
4. Follow the prompts — Xcode handles the upload

---

## Troubleshooting

**Sign-in fails on device:**  
Make sure both URL schemes are added in Xcode (your bundle ID + reversed client ID).

**Build errors after `npm install`:**  
Run `npx cap sync ios` again after any package changes.

**`pod install` errors:**  
```bash
cd ios/App
pod install
```

**White screen on launch:**  
Make sure you ran `npm run build` before `npx cap sync ios`.
