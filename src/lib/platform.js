/**
 * Platform detection and auth helpers for VenBook.
 * On iOS (Capacitor), we use @codetrix-studio/capacitor-google-auth for native sign-in.
 * On web, we use Google Identity Services (GIS) popup.
 */

export const isNative = () => {
  try {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform())
  } catch {
    return false
  }
}

export const getGoogleAuthPlugin = async () => {
  if (!isNative()) return null
  try {
    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')
    return GoogleAuth
  } catch (e) {
    console.warn('GoogleAuth plugin not available:', e)
    return null
  }
}
