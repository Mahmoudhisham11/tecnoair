'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import { db, collection, getDocs, query, orderBy, limit } from '@/app/firebase'
import { Customer } from '@/lib/types'
import StatsCard from '@/components/StatsCard/StatsCard'
import DashboardCard from '@/components/DashboardCard/DashboardCard'
import CustomerCard from '@/components/CustomerCard/CustomerCard'
import QuickAction from '@/components/QuickAction/QuickAction'
import styles from './dashboard.module.css'

const quickActions = [
  { id: 'Q001', label: 'عميل جديد', icon: 'UserPlus', color: '#5B4CF0' },
  { id: 'Q002', label: 'موعد جديد', icon: 'CalendarPlus', color: '#7C3AED' },
  { id: 'Q003', label: 'فاتورة', icon: 'FileText', color: '#06B6D4' },
  { id: 'Q004', label: 'تقرير', icon: 'BarChart3', color: '#10B981' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'), limit(10))
    getDocs(q).then((snap) => {
      const list: Customer[] = []
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Customer))
      setCustomers(list)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const activeCount = customers.filter((c) => c.status === 'active').length
  const totalJobs = customers.reduce((sum, c) => sum + (c.jobPrice || 0), 0)
  const recentCustomers = customers.slice(0, 3)

  const stats = [
    { label: 'إجمالي العملاء', value: customers.length, change: 0, icon: 'Users' },
    { label: 'العملاء النشطين', value: activeCount, change: 0, icon: 'Users' },
    { label: 'قيد التنفيذ', value: customers.length - activeCount, change: 0, icon: 'Wrench' },
    { label: 'إجمالي الإيرادات', value: totalJobs.toLocaleString(), change: 0, icon: 'TrendingUp' },
  ]

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className={styles.greeting}>مرحباً، {user?.name || 'مستخدم'}</h1>
          <p className={styles.subtitle}>
            {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.notifBtn}>
            <Bell size={20} />
          </button>
        </div>
      </motion.div>

      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className={styles.heroContent}>
          <div className={styles.heroInfo}>
            <span className={styles.heroLabel}>إجمالي العملاء</span>
            <span className={styles.heroValue}>{customers.length}</span>
          </div>
          <div className={styles.heroInfo}>
            <span className={styles.heroLabel}>العملاء النشطين</span>
            <span className={styles.heroValue}>{activeCount}</span>
          </div>
          <div className={styles.heroInfo}>
            <span className={styles.heroLabel}>الإيرادات</span>
            <span className={styles.heroValue}>{totalJobs.toLocaleString()}</span>
          </div>
        </div>
        <div className={styles.heroBg}>
          <div className={styles.heroCircle1} />
          <div className={styles.heroCircle2} />
        </div>
      </motion.div>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <StatsCard key={stat.label} {...stat} index={i} />
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>إجراءات سريعة</h2>
        <div className={styles.quickActions}>
          {quickActions.map((action, i) => (
            <QuickAction key={action.id} {...action} index={i} />
          ))}
        </div>
      </div>

      <div className={styles.twoCol}>
        <DashboardCard title="آخر العملاء">
          <div className={styles.customersList}>
            {loading ? (
              <p className={styles.empty}>جاري التحميل...</p>
            ) : recentCustomers.length === 0 ? (
              <p className={styles.empty}>لا يوجد عملاء بعد</p>
            ) : (
              recentCustomers.map((c, i) => (
                <CustomerCard key={c.id} customer={c} index={i} />
              ))
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}
