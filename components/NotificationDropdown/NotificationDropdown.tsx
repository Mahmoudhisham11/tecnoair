'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '@/app/context/NotificationContext'
import NotificationItem from '@/components/NotificationItem/NotificationItem'
import type { Notification } from '@/lib/types'
import styles from './NotificationDropdown.module.css'

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead } = useNotifications()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id)
  }

  return (
    <div ref={ref} className={styles.wrapper}>
      <button className={styles.bellBtn} onClick={() => setOpen(!open)}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className={styles.dropdownHeader}>
              <h3 className={styles.dropdownTitle}>الإشعارات</h3>
            </div>

            <div className={styles.notifList}>
              {notifications.length === 0 ? (
                <p className={styles.emptyState}>لا توجد إشعارات</p>
              ) : (
                notifications.slice(0, 5).map((n, i) => (
                  <div key={n.id} onClick={() => handleNotificationClick(n)}>
                    <NotificationItem notification={n} index={i} />
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <Link href="/notifications" className={styles.viewAll} onClick={() => setOpen(false)}>
                عرض الكل ({notifications.length})
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
