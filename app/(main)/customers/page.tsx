'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Filter } from 'lucide-react'
import { db, collection, getDocs, query, orderBy } from '@/app/firebase'
import { Customer, Appointment } from '@/lib/types'
import SearchBar from '@/components/SearchBar/SearchBar'
import FilterChip from '@/components/FilterChip/FilterChip'
import CustomerCard from '@/components/CustomerCard/CustomerCard'
import Button from '@/components/Button/Button'
import CustomerModal from '@/components/CustomerModal/CustomerModal'
import styles from './customers.module.css'

const weekDays = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const [filterOpen, setFilterOpen] = useState(false)
  const [filterRegion, setFilterRegion] = useState('')
  const [filterDay, setFilterDay] = useState('')
  const [allAppointments, setAllAppointments] = useState<Record<string, Appointment[]>>({})

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      const list: Customer[] = []
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Customer)
      })
      setCustomers(list)
    } catch {
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    const fetchAppts = async () => {
      try {
        const snap = await getDocs(collection(db, 'appointments'))
        const map: Record<string, Appointment[]> = {}
        snap.forEach((d) => {
          const data = d.data() as Omit<Appointment, 'id'>
          const appt = { id: d.id, ...data } as Appointment
          if (!map[appt.customerId]) map[appt.customerId] = []
          map[appt.customerId].push(appt)
        })
        setAllAppointments(map)
      } catch {}
    }
    fetchAppts()
  }, [])

  const regions = [...new Set(customers.map(c => c.region).filter(Boolean))] as string[]

  const filtered = customers.filter((c) => {
    const matchesSearch = c.name.includes(search) || c.phone.includes(search)
    const matchesRegion = !filterRegion || c.region === filterRegion
    const appts = allAppointments[c.id] || []
    const matchesDay = !filterDay || appts.some(a => {
      const d = new Date(a.date + 'T12:00:00')
      return d.toLocaleDateString('ar-EG', { weekday: 'long' }) === filterDay
    })
    return matchesSearch && matchesRegion && matchesDay
  })

  const hasActiveFilters = filterRegion || filterDay

  const toggleRegion = (r: string) => {
    setFilterRegion(prev => prev === r ? '' : r)
  }

  const toggleDay = (d: string) => {
    setFilterDay(prev => prev === d ? '' : d)
  }

  const clearFilters = () => {
    setFilterRegion('')
    setFilterDay('')
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className={styles.title}>العملاء</h1>
          <p className={styles.count}>{filtered.length} من {customers.length} عميل</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.filterBtn} onClick={() => setFilterOpen(true)}>
            <Filter size={18} />
          </button>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={18} />
            عميل جديد
          </Button>
        </div>
      </motion.div>

      <SearchBar value={search} onChange={setSearch} placeholder="بحث عن عميل..." />

      <div className={styles.grid}>
        {loading ? (
          <p className={styles.empty}>جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>لا يوجد عملاء</p>
        ) : (
          filtered.map((c, i) => (
            <CustomerCard key={c.id} customer={c} index={i} />
          ))
        )}
      </div>

      <CustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchCustomers}
      />

      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              className={styles.drawer}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div className={styles.drawerHeader}>
                <h3 className={styles.drawerTitle}>فلترة العملاء</h3>
                <button className={styles.drawerClose} onClick={() => setFilterOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.drawerBody}>
                <div className={styles.drawerSection}>
                  <label className={styles.drawerLabel}>المنطقة</label>
                  <div className={styles.drawerChips}>
                    {regions.length === 0 ? (
                      <p className={styles.drawerEmpty}>لا توجد مناطق</p>
                    ) : (
                      regions.map(r => (
                        <FilterChip key={r} label={r} active={filterRegion === r} onClick={() => toggleRegion(r)} />
                      ))
                    )}
                  </div>
                </div>

                <div className={styles.drawerSection}>
                  <label className={styles.drawerLabel}>اليوم</label>
                  <div className={styles.drawerChips}>
                    {weekDays.map(d => (
                      <FilterChip key={d} label={d} active={filterDay === d} onClick={() => toggleDay(d)} />
                    ))}
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className={styles.drawerFooter}>
                  <button className={styles.drawerClearBtn} onClick={clearFilters}>
                    إلغاء الفلترة
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
