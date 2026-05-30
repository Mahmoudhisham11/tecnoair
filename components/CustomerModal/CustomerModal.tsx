'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import { addDoc, updateDoc, doc, collection, db } from '@/app/firebase'
import { Customer, AppointmentType } from '@/lib/types'
import styles from './CustomerModal.module.css'

interface CustomerModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editCustomer?: Customer | null
}

interface ApptEntry {
  date: string
  time: string
  type: AppointmentType
  notes: string
}

const typeOptions: { value: AppointmentType; label: string }[] = [
  { value: 'periodic-maintenance', label: 'صيانة دورية' },
  { value: 'emergency-maintenance', label: 'صيانة طارئة' },
  { value: 'follow-up', label: 'متابعة' },
  { value: 'installation', label: 'تركيب' },
  { value: 'repair', label: 'إصلاح' },
]

const emptyAppt = (): ApptEntry => ({ date: '', time: '', type: 'periodic-maintenance', notes: '' })

export default function CustomerModal({ open, onClose, onSuccess, editCustomer }: CustomerModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [region, setRegion] = useState('')
  const [jobType, setJobType] = useState('')
  const [jobPrice, setJobPrice] = useState('')
  const [jobStatus, setJobStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending')
  const [appointments, setAppointments] = useState<ApptEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!editCustomer

  useEffect(() => {
    if (editCustomer) {
      setName(editCustomer.name)
      setPhone(editCustomer.phone)
      setAddress(editCustomer.address)
      setRegion(editCustomer.region)
      setJobType(editCustomer.jobType)
      setJobPrice(String(editCustomer.jobPrice))
      setJobStatus(editCustomer.jobStatus || 'pending')
      setAppointments([])
    } else {
      reset()
    }
  }, [editCustomer, open])

  const reset = () => {
    setName('')
    setPhone('+20')
    setAddress('')
    setRegion('')
    setJobType('')
    setJobPrice('')
    setJobStatus('pending')
    setAppointments([])
    setError('')
  }

  const addAppt = () => setAppointments([...appointments, emptyAppt()])

  const removeAppt = (i: number) => setAppointments(appointments.filter((_, idx) => idx !== i))

  const updateAppt = (i: number, field: keyof ApptEntry, value: string) => {
    const copy = [...appointments]
    ;(copy[i] as any)[field] = value
    setAppointments(copy)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const customerData = {
        name,
        phone,
        address,
        region,
        jobType,
        jobPrice: Number(jobPrice),
        status: 'active' as const,
        jobStatus,
      }

      if (isEditing && editCustomer) {
        await updateDoc(doc(db, 'customers', editCustomer.id), customerData)
      } else {
        const docRef = await addDoc(collection(db, 'customers'), {
          ...customerData,
          createdAt: new Date().toISOString(),
        })

        for (const appt of appointments) {
          if (appt.date && appt.time) {
            await addDoc(collection(db, 'appointments'), {
              customerId: docRef.id,
              customerName: name,
              date: appt.date,
              time: appt.time,
              type: appt.type,
              notes: appt.notes,
              status: 'pending',
              createdAt: new Date().toISOString(),
            })
          }
        }
      }

      reset()
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
              <h2 className={styles.title}>{isEditing ? 'تعديل العميل' : 'عميل جديد'}</h2>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>اسم العميل</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="أحمد المحمود" />
              </div>
              <div className={styles.field}>
                <label>رقم الموبايل</label>
                <input type="tel" value={phone} onChange={(e) => {
                  if (!e.target.value.startsWith('+20')) {
                    setPhone('+20' + e.target.value.replace(/^\+?2?0?/, ''))
                  } else {
                    setPhone(e.target.value)
                  }
                }} required placeholder="+20xxxxxxxxx" />
              </div>
              <div className={styles.field}>
                <label>العنوان</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="شارع النيل، العجوزة" />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>المنطقة</label>
                  <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} required placeholder="الجيزة" />
                </div>
                <div className={styles.field}>
                  <label>نوع الشغلانة</label>
                  <input type="text" value={jobType} onChange={(e) => setJobType(e.target.value)} required placeholder="تركيب سبليت" />
                </div>
              </div>
              <div className={styles.field}>
                <label>سعر الشغلانة (ج.م)</label>
                <input type="number" value={jobPrice} onChange={(e) => setJobPrice(e.target.value)} required placeholder="1500" min="0" />
              </div>
              <div className={styles.field}>
                <label>حالة الشغلانة</label>
                <select value={jobStatus} onChange={(e) => setJobStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}>
                  <option value="pending">قيد الانتظار</option>
                  <option value="in-progress">قيد التنفيذ</option>
                  <option value="completed">تم الانتهاء</option>
                </select>
              </div>

              {/* Appointments Section */}
              {!isEditing && (
                <div className={styles.apptsSection}>
                  <div className={styles.apptsHeader}>
                    <span className={styles.apptsTitle}>المواعيد</span>
                    <button type="button" className={styles.addApptBtn} onClick={addAppt}>
                      <Plus size={16} /> إضافة موعد
                    </button>
                  </div>
                  {appointments.length === 0 && (
                    <p className={styles.apptsEmpty}>لا توجد مواعيد مضافة</p>
                  )}
                  {appointments.map((appt, i) => (
                    <div key={i} className={styles.apptEntry}>
                      <div className={styles.apptHeader}>
                        <span className={styles.apptNum}>موعد {i + 1}</span>
                        <button type="button" className={styles.removeApptBtn} onClick={() => removeAppt(i)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className={styles.row}>
                        <div className={styles.field}>
                          <label>التاريخ</label>
                          <input type="date" value={appt.date} onChange={(e) => updateAppt(i, 'date', e.target.value)} />
                        </div>
                        <div className={styles.field}>
                          <label>الوقت</label>
                          <input type="time" value={appt.time} onChange={(e) => updateAppt(i, 'time', e.target.value)} />
                        </div>
                      </div>
                      <div className={styles.field}>
                        <label>نوع الموعد</label>
                        <select value={appt.type} onChange={(e) => updateAppt(i, 'type', e.target.value)}>
                          {typeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.field}>
                        <label>ملاحظات</label>
                        <input type="text" value={appt.notes} onChange={(e) => updateAppt(i, 'notes', e.target.value)} placeholder="تفاصيل الموعد..." />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className={styles.submitBtn} disabled={saving}>
                {saving ? 'جاري الحفظ...' : isEditing ? 'حفظ التعديلات' : 'إضافة العميل'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
