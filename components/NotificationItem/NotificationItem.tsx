'use client'

import { motion } from 'framer-motion'
import { CalendarCheck, CreditCard, AlertTriangle, Info, Clock } from 'lucide-react'
import { Notification } from '@/lib/types'
import styles from './NotificationItem.module.css'

const iconMap: Record<string, React.ReactNode> = {
  appointment: <CalendarCheck size={18} />,
  payment: <CreditCard size={18} />,
  alert: <AlertTriangle size={18} />,
  info: <Info size={18} />,
}

const colorMap: Record<string, string> = {
  appointment: '#5B4CF0',
  payment: '#10B981',
  alert: '#F59E0B',
  info: '#06B6D4',
}

interface NotificationItemProps {
  notification: Notification
  index: number
}

export default function NotificationItem({ notification, index }: NotificationItemProps) {
  const bgColor = colorMap[notification.type] || '#5B4CF0'

  return (
    <motion.div
      className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={styles.iconWrap} style={{ background: `${bgColor}15`, color: bgColor }}>
        {iconMap[notification.type] || <Info size={18} />}
      </div>
      <div className={styles.content}>
        <div className={styles.topRow}>
          <span className={styles.title}>{notification.title}</span>
          {!notification.read && <span className={styles.dot} />}
        </div>
        <p className={styles.message}>{notification.message}</p>
        <span className={styles.time}>
          <Clock size={12} /> {notification.time}
        </span>
      </div>
    </motion.div>
  )
}
