'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { addDoc, updateDoc, doc, collection, db } from '@/app/firebase'
import { Appointment, AppointmentType } from '@/lib/types'
import styles from './AppointmentModal.module.css'

interface AppointmentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  customerId: string
  customerName: string
  editAppointment?: Appointment | null
}

const typeOptions: { value: AppointmentType; label: string }[] = [
  { value: 'periodic-maintenance', label: 'صيانة دورية' },
  { value: 'emergency-maintenance', label: 'صيانة طارئة' },
  { value: 'follow-up', label: 'متابعة' },
  { value: 'installation', label: 'تركيب' },
  { value: 'repair', label: 'إصلاح' },
]

export default function AppointmentModal({ open, onClose, onSuccess, customerId, customerName, editAppointment }: AppointmentModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState<AppointmentType>('periodic-maintenance')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!editAppointment

  useEffect(() => {
    if (editAppointment) {
      setDate(editAppointment.date)
      setTime(editAppointment.time)
      setType(editAppointment.type)
      setNotes(editAppointment.notes)
    } else {
      setDate('')
      setTime('')
      setType('periodic-maintenance')
      setNotes('')
    }
  }, [editAppointment, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const data = {
        customerId,
        customerName,
        date,
        time,
        type,
        status: 'pending' as const,
        notes,
      }
      if (isEditing && editAppointment) {
        await updateDoc(doc(db, 'appointments', editAppointment.id), data)
      } else {
        await addDoc(collection(db, 'appointments'), {
          ...data,
          createdAt: new Date().toISOString(),
        })
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className={styles.overlay} onClick={onClose}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>{isEditing ? 'تعديل الموعد' : 'موعد جديد'}</h2>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <p className={styles.customerName}>العميل: {customerName}</p>

            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>التاريخ</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label>الوقت</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>
              </div>
              <div className={styles.field}>
                <label>نوع الموعد</label>
                <select value={type} onChange={(e) => setType(e.target.value as AppointmentType)}>
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>ملاحظات</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="تفاصيل الموعد..." />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={saving}>
                {saving ? 'جاري الحفظ...' : isEditing ? 'حفظ التعديلات' : 'إضافة الموعد'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
