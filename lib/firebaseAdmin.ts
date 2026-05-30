import admin from 'firebase-admin'

interface ServiceAccount {
  projectId?: string
  clientEmail?: string
  privateKey?: string
}

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getApp() {
  if (admin.apps.length) return admin.app()

  const sa = getServiceAccount()

  const credential = sa
    ? admin.credential.cert(sa as admin.ServiceAccount)
    : admin.credential.applicationDefault()

  return admin.initializeApp({
    credential,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'smartcoffe-b2c5e',
  })
}

let app: admin.app.App | null = null
let db: admin.firestore.Firestore | null = null
let messaging: admin.messaging.Messaging | null = null

function ensureInitialized() {
  if (typeof window !== 'undefined') {
    throw new Error('firebaseAdmin can only be used server-side')
  }
  if (!app) app = getApp()
  if (!db) db = app.firestore()
  if (!messaging) messaging = app.messaging()
  return { app, db, messaging }
}

export function getAdminDb() {
  return ensureInitialized().db
}

export function getAdminMessaging() {
  return ensureInitialized().messaging
}
