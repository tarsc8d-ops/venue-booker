/**
 * Haptics: iOS/Android native only. No-ops on web so the Netlify app is unchanged.
 */
import { useEffect } from 'react'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { isNative } from './platform'

async function safe(run) {
  if (!isNative()) return
  try {
    await run()
  } catch {
    /* ignore — haptics unavailable on some simulators */
  }
}

/** Elements that should give light feedback on press (native only). */
const TAP_TARGET_SELECTOR = [
  'button',
  'a[href]',
  '[role="button"]',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  'label',
  '[data-haptic]',
  '.tour-card',
  '.stat-chip',
  '.venue-card-main',
  '.ds-brand',
].join(', ')

const BACKDROP_CLOSE_SELECTOR = '.sheet-overlay, .modal-overlay, .drawer-overlay'

function tapTargetFromEvent(target) {
  if (!(target instanceof Element)) return null
  if (target.matches(BACKDROP_CLOSE_SELECTOR)) return target
  return target.closest(TAP_TARGET_SELECTOR)
}

function isDisabledTap(el) {
  if (!el) return true
  if (el.closest?.('[data-no-haptic]')) return true
  if (el.getAttribute?.('data-no-haptic') !== null) return true
  if (el.closest?.('fieldset[disabled]')) return true
  if (el.closest?.('[disabled], [aria-disabled="true"]')) return true
  if ('disabled' in el && el.disabled) return true
  return false
}

/**
 * Delegates light impact to most taps on native — buttons, links, inputs, and key app-specific rows.
 * Call once from the root `App`. Use `data-no-haptic` on a subtree to skip.
 */
export function useGlobalTapHaptics() {
  useEffect(() => {
    if (!isNative()) return undefined

    const onPointerDown = (e) => {
      if (e.button > 0) return
      const el = tapTargetFromEvent(e.target)
      if (!el || isDisabledTap(el)) return
      void hapticLight()
    }

    document.addEventListener('pointerdown', onPointerDown, { capture: true })
    return () => document.removeEventListener('pointerdown', onPointerDown, { capture: true })
  }, [])
}

export function hapticLight() {
  return safe(() => Haptics.impact({ style: ImpactStyle.Light }))
}

export function hapticMedium() {
  return safe(() => Haptics.impact({ style: ImpactStyle.Medium }))
}

/** Success / error-style feedback for completed actions (sign-in, email sent). */
export function hapticSuccess() {
  return safe(() => Haptics.notification({ type: NotificationType.Success }))
}

export function hapticWarning() {
  return safe(() => Haptics.notification({ type: NotificationType.Warning }))
}
