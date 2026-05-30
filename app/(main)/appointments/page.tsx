'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import FilterChip from '@/components/FilterChip/FilterChip'
import styles from './appointments.module.css'

const filters = ['الكل', 'مؤكد', 'قيد الانتظار', 'مكتمل']

export default function AppointmentsPage() {
  const [activeFilter, setActiveFilter] = useState('الكل')

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className={styles.title}>المواعيد</h1>
        </div>
        <Filter size={20} className={styles.filterIcon} />
      </motion.div>

      <motion.div
        className={styles.filters}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {filters.map((f) => (
          <FilterChip key={f} label={f} active={activeFilter === f} onClick={() => setActiveFilter(f)} />
        ))}
      </motion.div>

      <p className={styles.empty}>قريباً - إدارة المواعيد</p>
    </div>
  )
}
