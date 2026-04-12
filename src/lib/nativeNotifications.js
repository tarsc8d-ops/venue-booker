/**
 * Local notifications: only used when `isNative()` and the user opts in from Settings.
 * Web uses the browser Notifications API only if we called from web — we don't; UI is native-only.
 */
import { LocalNotifications } from '@capacitor/local-notifications'
import { isNative } from './platform'

export async function requestNotificationPermission() {
  if (!isNative()) return { granted: false }
  const r = await LocalNotifications.requestPermissions()
  return { granted: r.display === 'granted' }
}

/** One-time confirmation a few seconds after permission (optional, unobtrusive). */
export async function scheduleWelcomeTestNotification() {
  if (!isNative()) return
  const id = Math.floor(Math.random() * 2147483646) + 1
  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title: 'VenBook',
        body: 'Reminders are on. Future versions can nudge you about venue follow-ups.',
        schedule: { at: new Date(Date.now() + 5000) },
      },
    ],
  })
}
