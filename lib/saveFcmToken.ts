'use client'

import { db, doc, getDoc, updateDoc, arrayUnion } from '@/app/firebase'

export async function saveFcmToken(uid: string, token: string): Promise<void> {
  console.log('[FCM] saveFcmToken called for uid:', uid)

  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) {
      console.warn('[FCM] User doc not found, skipping')
      return
    }

    const data = snap.data()
    const existing: string[] = data.fcmTokens || []

    if (existing.includes(token)) {
      console.log('[FCM] Token already exists, skipping')
      return
    }

    await updateDoc(doc(db, 'users', uid), {
      fcmTokens: arrayUnion(token),
    })

    console.log('[FCM] Token saved successfully')
  } catch (err) {
    console.error('[FCM] Error saving token:', err)
  }
}
