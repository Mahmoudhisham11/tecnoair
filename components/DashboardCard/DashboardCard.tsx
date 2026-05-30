'use client'

import { ReactNode } from 'react'
import styles from './DashboardCard.module.css'

interface DashboardCardProps {
  title: string
  action?: ReactNode
  children: ReactNode
}

export default function DashboardCard({ title, action, children }: DashboardCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {action && <div className={styles.action}>{action}</div>}
      </div>
      <div className={styles.body}>
        {children}
      </div>
    </div>
  )
}
