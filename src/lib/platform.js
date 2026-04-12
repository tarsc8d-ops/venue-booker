/**
 * Platform detection and auth helpers for VenBook.
 * On iOS (Capacitor), we use @codetrix-studio/capacitor-google-auth for native sign-in.
 * On web, we use Google Identity Services (GIS) popup.
 *
 * GoogleAuth is imported statically — dynamic import() can fail to load chunks from
 * capacitor://localhost in the WebView, which makes native sign-in look "dead" with no logs.
 */
import { Capacitor } from '@capacitor/core'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'

export const isNative = () => {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

/** Native-only: the Capacitor GoogleAuth bridge (same npm package; iOS SDK comes from CocoaPods). */
export const getNativeGoogleAuth = () => {
  if (!isNative()) return null
  return GoogleAuth
}
