'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { db, collection, query, where, orderBy, onSnapshot, doc, updateDoc } from '@/app/firebase'
import { Notification } from '@/lib/types'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(q, (snap) => {
      const list: Notification[] = []
      snap.forEach((d) => {
        const data = d.data()
        list.push({
          id: d.id,
          title: data.title || '',
          message: data.message || '',
          time: data.time || data.createdAt || '',
          read: data.read || false,
          type: data.type || 'info',
          createdAt: data.createdAt || '',
          appointmentId: data.appointmentId || '',
          customerId: data.customerId || '',
          customerName: data.customerName || '',
        })
      })
      setNotifications(list)
      setLoading(false)
    }, () => {
      setLoading(false)
    })

    return unsub
  }, [userId])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true })
    } catch {}
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const unread = notifications.filter(n => !n.read)
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })))
    } catch {}
  }, [notifications])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
