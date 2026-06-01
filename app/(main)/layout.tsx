'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { NotificationProvider } from '@/app/context/NotificationContext'
import Sidebar from '@/components/Sidebar/Sidebar'
import styles from './layout.module.css'

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading) return null
  if (!user) return null

  return (
    <NotificationProvider userId={user.uid}>
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </NotificationProvider>
  )
}
