'use client'

import { motion } from 'framer-motion'
import { UserPlus, CalendarPlus, FileText, BarChart3 } from 'lucide-react'
import styles from './QuickAction.module.css'

const iconMap: Record<string, React.ReactNode> = {
  UserPlus: <UserPlus size={22} />,
  CalendarPlus: <CalendarPlus size={22} />,
  FileText: <FileText size={22} />,
  BarChart3: <BarChart3 size={22} />,
}

interface QuickActionProps {
  label: string
  icon: string
  color: string
  index: number
}

export default function QuickAction({ label, icon, color, index }: QuickActionProps) {
  return (
    <motion.button
      className={styles.action}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={styles.iconWrap} style={{ background: `${color}15`, color }}>
        {iconMap[icon] || <UserPlus size={22} />}
      </div>
      <span className={styles.label}>{label}</span>
    </motion.button>
  )
}
