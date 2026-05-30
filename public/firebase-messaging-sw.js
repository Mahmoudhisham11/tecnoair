importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyAKiAjYEkQdgkdK31-5oeQ97TTQo5Bo-Iw",
  authDomain: "smartcoffe-b2c5e.firebaseapp.com",
  projectId: "smartcoffe-b2c5e",
  storageBucket: "smartcoffe-b2c5e.firebasestorage.app",
  messagingSenderId: "1014648266797",
  appId: "1:1014648266797:web:374e025080819bf9c958a4"
})

firebase.messaging().onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Techno Air'
  const options = {
    body: payload.notification?.body || '',
    icon: '/web-app-manifest-512x512.png',
    badge: '/favicon-96x96.png',
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [{ action: 'open', title: 'فتح التطبيق' }],
  }
  self.registration.showNotification(title, options)
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const urlToOpen = new URL('/', self.location.origin)
  event.waitUntil(clients.openWindow(urlToOpen.toString()))
})
