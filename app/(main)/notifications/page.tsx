'use client'

import { motion } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'
import { useNotifications } from '@/app/context/NotificationContext'
import NotificationItem from '@/components/NotificationItem/NotificationItem'
import styles from './notifications.module.css'

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications()

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className={styles.title}>الإشعارات</h1>
          <p className={styles.count}>{notifications.length} إشعار</p>
        </div>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={markAllAsRead}>
              <CheckCheck size={16} />
              تحديد الكل كمقروء
            </button>
          )}
          <div className={styles.bellWrap}>
            <Bell size={20} />
            {unreadCount > 0 && <span className={styles.bellDot} />}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className={styles.empty}>
          <Bell size={40} />
          <p>جاري التحميل...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className={styles.empty}>
          <Bell size={40} />
          <p>لا توجد إشعارات</p>
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map((n, i) => (
            <NotificationItem key={n.id} notification={n} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
