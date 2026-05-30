'use client'

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[SW] Service Worker not supported')
    return null
  }

  console.log('[SW] Registering service worker...')

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    })

    console.log('[SW] Registered successfully, scope:', registration.scope)

    if (registration.active) {
      console.log('[SW] Active immediately')
    } else {
      registration.onupdatefound = () => {
        const installing = registration.installing
        if (installing) {
          installing.onstatechange = () => {
            if (installing.state === 'activated') {
              console.log('[SW] Activated')
            }
          }
        }
      }
    }

    return registration
  } catch (err) {
    console.error('[SW] Registration failed:', err)
    return null
  }
}
