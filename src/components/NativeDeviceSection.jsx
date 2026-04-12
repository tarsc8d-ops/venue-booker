import { useState } from 'react'
import { isNative } from '../lib/platform'
import { requestNotificationPermission, scheduleWelcomeTestNotification } from '../lib/nativeNotifications'

export default function NativeDeviceSection() {
  const [busy, setBusy] = useState(false)
  const [hint, setHint] = useState(null)

  if (!isNative()) return null

  const onEnable = async () => {
    setBusy(true)
    setHint(null)
    try {
      const { granted } = await requestNotificationPermission()
      if (granted) {
        await scheduleWelcomeTestNotification()
        setHint('Notifications enabled. You can change this anytime in iOS Settings → VenBook.')
      } else {
        setHint('Notifications were not allowed. You can enable them later in iOS Settings → VenBook.')
      }
    } catch (e) {
      setHint(e?.message || 'Could not enable notifications.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="settings-section">
      <div className="settings-label">This device</div>
      <p className="settings-hint" style={{ marginBottom: '12px', lineHeight: 1.5 }}>
        Light haptics run on most taps (buttons, fields, and list rows) on iPhone. Optionally allow reminders for
        booking follow-ups (local notifications only — no extra server).
      </p>
      <button
        type="button"
        className="btn-primary"
        style={{ width: '100%', textAlign: 'center' }}
        disabled={busy}
        onClick={onEnable}
      >
        {busy ? '…' : 'Enable notifications'}
      </button>
      {hint && <p className="settings-hint" style={{ marginTop: '12px' }}>{hint}</p>}
    </div>
  )
}
