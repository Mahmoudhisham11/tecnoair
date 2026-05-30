'use client'

import { ReactNode } from 'react'
import styles from './Badge.module.css'

interface BadgeProps {
  variant?: 'active' | 'inactive' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'maintenance' | 'installation' | 'repair' | 'inspection' | 'default'
  children: ReactNode
}

export default function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant] || styles.default}`}>
      {children}
    </span>
  )
}
