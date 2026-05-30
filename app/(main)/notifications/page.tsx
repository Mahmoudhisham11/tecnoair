'use client'

import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import styles from './notifications.module.css'

export default function NotificationsPage() {
  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={styles.title}>الإشعارات</h1>
        <div className={styles.bellWrap}>
          <Bell size={20} />
        </div>
      </motion.div>

      <div className={styles.empty}>
        <Bell size={40} />
        <p>لا توجد إشعارات</p>
      </div>
    </div>
  )
}
