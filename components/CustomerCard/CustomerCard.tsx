'use client'

import Link from 'next/link'
import { Phone, MapPin, Briefcase, DollarSign, ChevronLeft, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Customer } from '@/lib/types'
import Badge from '@/components/Badge/Badge'
import styles from './CustomerCard.module.css'

interface CustomerCardProps {
  customer: Customer
  index: number
}

const statusMap: Record<string, 'active' | 'inactive' | 'pending'> = {
  active: 'active',
  inactive: 'inactive',
  pending: 'pending',
}

const jobStatusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  'in-progress': 'قيد التنفيذ',
  completed: 'تم الانتهاء',
}

const jobStatusColors: Record<string, 'pending' | 'confirmed' | 'completed'> = {
  pending: 'pending',
  'in-progress': 'confirmed',
  completed: 'completed',
}

export default function CustomerCard({ customer, index }: CustomerCardProps) {
  const cleanPhone = customer.phone.replace(/[^0-9+]/g, '')
  const waLink = `https://wa.me/${cleanPhone.replace('+', '')}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link href={`/customers/${customer.id}`} className={styles.card}>
        <div className={styles.top}>
          <div className={styles.avatar}>
            {customer.name.charAt(0)}
          </div>
          <div className={styles.info}>
            <h4 className={styles.name}>{customer.name}</h4>
            <div className={styles.badges}>
              <Badge variant={statusMap[customer.status]}>
                {customer.status === 'active' ? 'نشط' : customer.status === 'inactive' ? 'غير نشط' : 'قيد الانتظار'}
              </Badge>
              <Badge variant={jobStatusColors[customer.jobStatus] || 'pending'}>
                {jobStatusLabels[customer.jobStatus] || 'قيد الانتظار'}
              </Badge>
            </div>
          </div>
          <ChevronLeft size={18} className={styles.chevron} />
        </div>
        <div className={styles.details}>
          <span className={styles.detail}>
            <Phone size={13} /> {customer.phone}
          </span>
          <span className={styles.detail}>
            <MapPin size={13} /> {customer.region} - {customer.address}
          </span>
          <span className={styles.detail}>
            <Briefcase size={13} /> {customer.jobType}
          </span>
          <span className={styles.detail}>
            <DollarSign size={13} /> {customer.jobPrice?.toLocaleString()} ج.م
          </span>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            window.location.href = `tel:${cleanPhone}`
          }}>
            <Phone size={15} />
          </button>
          <button className={styles.actionBtn} onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            window.open(waLink, '_blank', 'noopener')
          }}>
            <MessageCircle size={15} />
          </button>
        </div>
      </Link>
    </motion.div>
  )
}
