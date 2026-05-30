'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  db,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
} from '@/app/firebase'
import { saveFcmToken } from '@/lib/saveFcmToken'
import { registerServiceWorker } from '@/lib/registerServiceWorker'
import { debugFcmToken } from '@/lib/debugFcmToken'

const FCM_VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY || ''
let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null

async function setupFcm(uid: string, vapidKey: string) {
  console.log('[FCM] Starting notification setup for user:', uid)
  const swReg = swRegistrationPromise ? await swRegistrationPromise : null
  const result = await debugFcmToken(vapidKey, swReg)
  if (result.success && result.token) {
    await saveFcmToken(uid, result.token)
  }
}

interface UserData {
  uid: string
  name?: string
  email?: string
  role?: string
  [key: string]: unknown
}

interface AuthContextType {
  user: UserData | null
  loading: boolean
  login: (email: string, password: string) => Promise<UserData>
  register: (data: { name: string; email: string; password: string }) => Promise<UserData>
  updateUser: (uid: string, data: Partial<UserData>) => Promise<void>
  deleteUser: (uid: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    swRegistrationPromise = registerServiceWorker()

    const savedUid = localStorage.getItem('tecnoair_uid')
    if (savedUid) {
      getDoc(doc(db, 'users', savedUid))
        .then((snap) => {
          if (snap.exists()) {
            const { password, ...data } = snap.data() as UserData & { password?: string }
            const userData = { ...data, uid: snap.id }
            setUser(userData)
            if (FCM_VAPID_KEY) setupFcm(snap.id, FCM_VAPID_KEY)
          } else {
            localStorage.removeItem('tecnoair_uid')
          }
        })
        .catch(() => {
          localStorage.removeItem('tecnoair_uid')
        })
        .finally(() => setLoading(false))
    } else {
      Promise.resolve().then(() => setLoading(false))
    }
  }, [])

  const login = async (email: string, password: string) => {
    const q = query(collection(db, 'users'), where('email', '==', email))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('البريد الإلكتروني غير مسجل')

    const d = snap.docs[0]
    const data = d.data() as { password?: string; [key: string]: unknown }
    if (data.password !== password) throw new Error('كلمة المرور غير صحيحة')

    const { password: _, ...safeData } = data
    const userData = { ...safeData, uid: d.id } as UserData
    localStorage.setItem('tecnoair_uid', userData.uid)
    setUser(userData)
    if (FCM_VAPID_KEY) setupFcm(userData.uid, FCM_VAPID_KEY)
    return userData
  }

  const register = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const q = query(collection(db, 'users'), where('email', '==', email))
    const snap = await getDocs(q)
    if (!snap.empty) throw new Error('البريد الإلكتروني مسجل بالفعل')

    const docRef = await addDoc(collection(db, 'users'), {
      name,
      email,
      password,
      role: 'user',
      createdAt: new Date().toISOString(),
    })

    const newUser: UserData = { uid: docRef.id, name, email, role: 'user' }
    localStorage.setItem('tecnoair_uid', docRef.id)
    setUser(newUser)
    if (FCM_VAPID_KEY) setupFcm(docRef.id, FCM_VAPID_KEY)
    return newUser
  }

  const updateUserData = async (uid: string, data: Partial<UserData>) => {
    await updateDoc(doc(db, 'users', uid), data)
    setUser((prev) => (prev && prev.uid === uid ? { ...prev, ...data } : prev))
  }

  const deleteUserData = async (uid: string) => {
    await deleteDoc(doc(db, 'users', uid))
    if (user?.uid === uid) {
      localStorage.removeItem('tecnoair_uid')
      setUser(null)
    }
  }

  const logout = () => {
    localStorage.removeItem('tecnoair_uid')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateUser: updateUserData, deleteUser: deleteUserData, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
