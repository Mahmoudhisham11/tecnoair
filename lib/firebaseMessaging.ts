'use client'

import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { app, db, doc, updateDoc, arrayUnion, arrayRemove } from '@/app/firebase'

let messaging: ReturnType<typeof getMessaging> | null = null

function getInstance() {
  if (typeof window === 'undefined') return null
  if (!messaging) messaging = getMessaging(app)
  return messaging
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied'
  return await Notification.requestPermission()
}

export interface FcmPayload {
  notification?: {
    title?: string
    body?: string
    image?: string
  }
  data?: Record<string, string>
  from?: string
}

export async function getFcmToken(
  vapidKey: string,
  swRegistration?: ServiceWorkerRegistration
): Promise<string | null> {
  const m = getInstance()
  if (!m) return null
  const permission = await requestPermission()
  if (permission !== 'granted') return null
  try {
    const opts: { vapidKey: string; serviceWorkerRegistration?: ServiceWorkerRegistration } = { vapidKey }
    if (swRegistration) opts.serviceWorkerRegistration = swRegistration
    return await getToken(m, opts)
  } catch {
    return null
  }
}

export async function storeFcmToken(userId: string, vapidKey: string): Promise<string | null> {
  const token = await getFcmToken(vapidKey)
  if (!token) return null
  try {
    await updateDoc(doc(db, 'users', userId), {
      fcmTokens: arrayUnion(token),
    })
  } catch {
    /* token stored in Firestore might fail silently */
  }
  return token
}

export async function removeFcmToken(userId: string, token: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      fcmTokens: arrayRemove(token),
    })
  } catch {
    /* fail silently */
  }
}

export function onForegroundMessage(callback: (payload: FcmPayload) => void): () => void {
  const m = getInstance()
  if (!m) return () => {}
  return onMessage(m, callback)
}
