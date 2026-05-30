'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, CalendarCheck, Wrench, DollarSign } from 'lucide-react'
import styles from './StatsCard.module.css'

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users size={20} />,
  CalendarCheck: <CalendarCheck size={20} />,
  Wrench: <Wrench size={20} />,
  TrendingUp: <DollarSign size={20} />,
}

interface StatsCardProps {
  label: string
  value: string | number
  change: number
  icon: string
  index: number
}

export default function StatsCard({ label, value, change, icon, index }: StatsCardProps) {
  const isPositive = change >= 0

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className={styles.iconWrap}>
        {iconMap[icon] || <Users size={20} />}
      </div>
      <div className={styles.info}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={`${styles.change} ${isPositive ? styles.up : styles.down}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{Math.abs(change)}%</span>
      </div>
    </motion.div>
  )
}
