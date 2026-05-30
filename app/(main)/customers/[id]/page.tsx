'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowRight, Phone, MapPin, Briefcase, DollarSign, Calendar, MessageCircle, Trash2, Edit3, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { db, doc, getDoc, getDocs, deleteDoc, collection, query, where } from '@/app/firebase'
import { Customer, Appointment } from '@/lib/types'
import Badge from '@/components/Badge/Badge'
import DashboardCard from '@/components/DashboardCard/DashboardCard'
import CustomerModal from '@/components/CustomerModal/CustomerModal'
import AppointmentModal from '@/components/AppointmentModal/AppointmentModal'
import Button from '@/components/Button/Button'
import styles from './customer.module.css'

const to12h = (t: string) => {
  if (!t) return t
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'م' : 'ص'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [apptModalOpen, setApptModalOpen] = useState(false)
  const [editAppt, setEditAppt] = useState<Appointment | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const custSnap = await getDoc(doc(db, 'customers', id))
      if (custSnap.exists()) {
        setCustomer({ id: custSnap.id, ...custSnap.data() } as Customer)
      } else {
        setCustomer(null)
      }
    } catch {
      setCustomer(null)
    }

    try {
      const apptsSnap = await getDocs(query(collection(db, 'appointments'), where('customerId', '==', id)))
      const list: Appointment[] = []
      apptsSnap.forEach((d) => list.push({ id: d.id, ...d.data() } as Appointment))
      list.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
      setAppointments(list)
    } catch {
      setAppointments([])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return
    try {
      await deleteDoc(doc(db, 'customers', id))
      window.location.href = '/customers'
    } catch {
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const handleDeleteAppt = async (apptId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return
    try {
      await deleteDoc(doc(db, 'appointments', apptId))
      fetchData()
    } catch {
      alert('حدث خطأ أثناء الحذف')
    }
  }

  if (loading) return <div className={styles.page}><p className={styles.notFound}>جاري التحميل...</p></div>

  if (!customer) {
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>العميل غير موجود</p>
        <Link href="/customers" className={styles.backLink}>
          <ArrowRight size={16} /> العودة للعملاء
        </Link>
      </div>
    )
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

  const typeLabels: Record<string, string> = {
    'periodic-maintenance': 'صيانة دورية',
    'emergency-maintenance': 'صيانة طارئة',
    'follow-up': 'متابعة',
    installation: 'تركيب',
    repair: 'إصلاح',
  }

  const apptStatusMap: Record<string, 'pending' | 'confirmed' | 'completed' | 'cancelled'> = {
    pending: 'pending',
    confirmed: 'confirmed',
    completed: 'completed',
    cancelled: 'cancelled',
  }

  const apptStatusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  }

  const cleanPhone = customer.phone.replace(/[^0-9+]/g, '')
  const waLink = `https://wa.me/${cleanPhone.replace('+', '')}`

  return (
    <div className={styles.page}>
      <Link href="/customers" className={styles.back}>
        <ArrowRight size={18} />
        العودة للعملاء
      </Link>

      <motion.div
        className={styles.profileCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.profileTop}>
          <div className={styles.avatar}>{customer.name.charAt(0)}</div>
          <div className={styles.profileInfo}>
            <h1 className={styles.name}>{customer.name}</h1>
            <div className={styles.badges}>
              <Badge variant={statusMap[customer.status]}>
                {customer.status === 'active' ? 'نشط' : customer.status === 'inactive' ? 'غير نشط' : 'قيد الانتظار'}
              </Badge>
              <Badge variant={jobStatusColors[customer.jobStatus] || 'pending'}>
                {jobStatusLabels[customer.jobStatus] || 'قيد الانتظار'}
              </Badge>
            </div>
          </div>
          <div className={styles.profileActions}>
            <button className={styles.actionIcon} onClick={() => setEditOpen(true)} title="تعديل">
              <Edit3 size={16} />
            </button>
            <button className={styles.actionIconDanger} onClick={handleDelete} title="حذف">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className={styles.profileDetails}>
          <div className={styles.detailRow}>
            <Phone size={16} />
            <span>{customer.phone}</span>
          </div>
          <div className={styles.detailRow}>
            <MapPin size={16} />
            <span>{customer.region} - {customer.address}</span>
          </div>
          <div className={styles.detailRow}>
            <Briefcase size={16} />
            <span>{customer.jobType}</span>
          </div>
          <div className={styles.detailRow}>
            <DollarSign size={16} />
            <span>{customer.jobPrice?.toLocaleString()} ج.م</span>
          </div>
          <div className={styles.detailRow}>
            <Calendar size={16} />
            <span>تاريخ الإضافة: {new Date(customer.createdAt).toLocaleDateString('ar-SA')}</span>
          </div>
        </div>

        <div className={styles.contactActions}>
          <a href={`tel:${cleanPhone}`} className={styles.contactBtn}>
            <Phone size={18} />
            اتصال
          </a>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className={`${styles.contactBtn} ${styles.waBtn}`}>
            <MessageCircle size={18} />
            واتساب
          </a>
        </div>
      </motion.div>

      {/* Appointments */}
      <DashboardCard
        title="المواعيد"
        action={
          <Button size="sm" onClick={() => { setEditAppt(null); setApptModalOpen(true) }}>
            <Plus size={16} />
            موعد جديد
          </Button>
        }
      >
        {appointments.length === 0 ? (
          <p className={styles.empty}>لا توجد مواعيد</p>
        ) : (
          <div className={styles.apptsList}>
            {appointments.map((appt) => (
              <div key={appt.id} className={styles.apptCard}>
                <div className={styles.apptHeader}>
                  <div className={styles.apptDateTime}>
                    <span className={styles.apptDate}>{appt.date}</span>
                    <span className={styles.apptTime}>{to12h(appt.time)}</span>
                  </div>
                  <Badge variant={apptStatusMap[appt.status] || 'pending'}>
                    {apptStatusLabels[appt.status] || appt.status}
                  </Badge>
                </div>
                <div className={styles.apptBody}>
                  <span className={styles.apptType}>{typeLabels[appt.type] || appt.type}</span>
                  {appt.notes && <p className={styles.apptNotes}>{appt.notes}</p>}
                </div>
                <div className={styles.apptActions}>
                  <button className={styles.apptActionBtn} onClick={() => { setEditAppt(appt); setApptModalOpen(true) }}>
                    <Edit3 size={14} /> تعديل
                  </button>
                  <button className={styles.apptActionBtnDanger} onClick={() => handleDeleteAppt(appt.id)}>
                    <Trash2 size={14} /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      {/* Modals */}
      <CustomerModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={fetchData}
        editCustomer={customer}
      />
      <AppointmentModal
        open={apptModalOpen}
        onClose={() => setApptModalOpen(false)}
        onSuccess={fetchData}
        customerId={customer.id}
        customerName={customer.name}
        editAppointment={editAppt}
      />
    </div>
  )
}
