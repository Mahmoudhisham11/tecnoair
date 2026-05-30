'use client'

import { getMessaging, getToken } from 'firebase/messaging'
import { app } from '@/app/firebase'

export interface DebugResult {
  success: boolean
  token: string | null
  steps: { step: string; ok: boolean; detail?: string }[]
}

export async function debugFcmToken(
  vapidKey: string,
  swRegistration?: ServiceWorkerRegistration | null
): Promise<DebugResult> {
  const steps: DebugResult['steps'] = []
  const add = (step: string, ok: boolean, detail?: string) => {
    steps.push({ step, ok, detail })
    if (ok) {
      console.log(`[FCM-DEBUG] ✓ ${step}${detail ? ` — ${detail}` : ''}`)
    } else {
      console.error(`[FCM-DEBUG] ✗ ${step}${detail ? ` — ${detail}` : ''}`)
    }
  }

  console.log('[FCM-DEBUG] === Starting FCM token debug ===')

  if (typeof window === 'undefined') {
    add('Environment', false, 'Server-side, skipping')
    return { success: false, token: null, steps }
  }

  add('Environment', true, 'Browser detected')

  if (!('Notification' in window)) {
    add('Notification API', false, 'Not supported in this browser')
    return { success: false, token: null, steps }
  }
  add('Notification API', true, 'Supported')

  if (!vapidKey) {
    add('VAPID Key', false, 'NEXT_PUBLIC_FCM_VAPID_KEY is empty — set it in .env.local')
    return { success: false, token: null, steps }
  }
  add('VAPID Key', true, `${vapidKey.slice(0, 8)}...${vapidKey.slice(-4)}`)

  let messaging
  try {
    messaging = getMessaging(app)
    add('Messaging instance', true)
  } catch (err) {
    add('Messaging instance', false, String(err))
    return { success: false, token: null, steps }
  }

  try {
    const permission = await Notification.requestPermission()
    add('Notification permission', permission === 'granted', permission)
    if (permission !== 'granted') {
      return { success: false, token: null, steps }
    }
  } catch (err) {
    add('Notification permission', false, String(err))
    return { success: false, token: null, steps }
  }

  if (swRegistration) {
    add('SW Registration', true, `Scope: ${swRegistration.scope}, Active: ${!!swRegistration.active}`)
  } else {
    add('SW Registration', false, 'Not provided, relying on auto-detection')
  }

  let activeSw: ServiceWorkerRegistration | null = swRegistration || null
  if (!activeSw) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations()
      add('Service Workers found', regs.length > 0, `${regs.length} registration(s)`)
      if (regs.length > 0) {
        activeSw = regs[regs.length - 1]
        add('Using SW', true, `Scope: ${activeSw.scope}, Active: ${!!activeSw.active}`)
      }
    } catch (err) {
      add('getRegistrations()', false, String(err))
    }
  }

  console.log('[FCM-DEBUG] Calling getToken()...')
  const opts: Record<string, unknown> = { vapidKey }
  if (activeSw) opts.serviceWorkerRegistration = activeSw

  try {
    const token = await getToken(messaging, opts as any)

    if (token) {
      add('Token received', true, `${token.slice(0, 20)}... (${token.length} chars)`)
      console.log('[FCM-DEBUG] === FCM token debug completed successfully ===')
      return { success: true, token, steps }
    } else {
      add('Token received', false, 'getToken returned empty string')
      console.log('[FCM-DEBUG] === FCM token debug completed with empty token ===')
      return { success: false, token: null, steps }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const code = err instanceof Error && (err as any).code ? (err as any).code : 'N/A'
    add('getToken() threw', false, `Code: ${code}, Message: ${msg}`)

    if (err instanceof Error && err.stack) {
      console.log('[FCM-DEBUG] Stack trace:', err.stack)
    }

    console.log('[FCM-DEBUG] === FCM token debug completed with error ===')
    return { success: false, token: null, steps }
  }
}
