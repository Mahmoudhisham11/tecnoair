'use client'

import { Clock, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { Appointment } from '@/lib/types'
import Badge from '@/components/Badge/Badge'
import styles from './AppointmentCard.module.css'

interface AppointmentCardProps {
  appointment: Appointment
  index: number
}

const typeLabels: Record<string, string> = {
  'periodic-maintenance': 'صيانة دورية',
  'emergency-maintenance': 'صيانة طارئة',
  'follow-up': 'متابعة',
  installation: 'تركيب',
  repair: 'إصلاح',
}

const statusMap: Record<string, 'confirmed' | 'pending' | 'completed' | 'cancelled'> = {
  confirmed: 'confirmed',
  pending: 'pending',
  completed: 'completed',
  cancelled: 'cancelled',
}

const statusLabels: Record<string, string> = {
  confirmed: 'مؤكد',
  pending: 'قيد الانتظار',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

const to12h = (t: string) => {
  if (!t) return t
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'م' : 'ص'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function AppointmentCard({ appointment, index }: AppointmentCardProps) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
    >
      <div className={styles.timeCol}>
        <span className={styles.time}>{to12h(appointment.time)}</span>
        <span className={styles.date}>{appointment.date}</span>
      </div>
      <div className={styles.dotCol}>
        <div className={styles.dot} />
        <div className={styles.line} />
      </div>
      <div className={styles.content}>
        <div className={styles.topRow}>
          <span className={styles.name}>{appointment.customerName}</span>
        </div>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Calendar size={13} /> {typeLabels[appointment.type] || appointment.type}
          </span>
          <span className={styles.metaItem}>
            <Clock size={13} /> {appointment.date} {to12h(appointment.time)}
          </span>
        </div>
        {appointment.notes && <p className={styles.notes}>{appointment.notes}</p>}
        <div className={styles.statusRow}>
          <Badge variant={statusMap[appointment.status]}>
            {statusLabels[appointment.status] || appointment.status}
          </Badge>
        </div>
      </div>
    </motion.div>
  )
}
