import { Capacitor } from '@capacitor/core'

/**
 * Netlify functions live at `/.netlify/functions/<name>` when the app is served from Netlify.
 * In the Capacitor shell, `fetch('/.netlify/...')` targets `capacitor://localhost` and fails
 * (nothing is listening). Use your deployed site origin for native builds.
 *
 * Set `VITE_NETLIFY_SITE_URL` before `npm run build` if your site is not the default below.
 */
const DEFAULT_NATIVE_NETLIFY_ORIGIN = 'https://venue-booker.netlify.app'

export function netlifyFunctionUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  let base = (import.meta.env.VITE_NETLIFY_SITE_URL || '').trim()
  if (!base) {
    try {
      if (Capacitor.isNativePlatform()) base = DEFAULT_NATIVE_NETLIFY_ORIGIN
    } catch {
      /* ignore */
    }
  }
  if (base) return `${base.replace(/\/$/, '')}${normalized}`
  return normalized
}
