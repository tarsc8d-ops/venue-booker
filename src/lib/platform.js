/**
 * Platform detection and auth helpers for VenBook.
 * On iOS (Capacitor), we use @capacitor/google-auth for native sign-in.
 * On web, we use Google Identity Services (GIS) popup.
 */

// True when running inside a Capacitor iOS/Android shell
export const isNative = () => {
  try {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform())
  } catch {
    return false
  }
}

// Returns the GoogleAuth plugin only on native — avoids import errors on web
export const getGoogleAuthPlugin = async () => {
  if (!isNative()) return null
  try {
    const { GoogleAuth } = await import('@capacitor/google-auth')
    return GoogleAuth
  } catch (e) {
    console.warn('GoogleAuth plugin not available:', e)
    return null
  }
}
