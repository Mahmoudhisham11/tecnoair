'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { db, collection, getDocs, query, orderBy } from '@/app/firebase'
import { Customer } from '@/lib/types'
import SearchBar from '@/components/SearchBar/SearchBar'
import FilterChip from '@/components/FilterChip/FilterChip'
import CustomerCard from '@/components/CustomerCard/CustomerCard'
import Button from '@/components/Button/Button'
import CustomerModal from '@/components/CustomerModal/CustomerModal'
import styles from './customers.module.css'

const filters = ['الكل', 'نشط', 'غير نشط', 'قيد الانتظار']

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('الكل')
  const [modalOpen, setModalOpen] = useState(false)

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

  const filtered = customers.filter((c) => {
    const matchesSearch = c.name.includes(search) || c.phone.includes(search)
    const matchesFilter =
      activeFilter === 'الكل' ||
      (activeFilter === 'نشط' && c.status === 'active') ||
      (activeFilter === 'غير نشط' && c.status === 'inactive') ||
      (activeFilter === 'قيد الانتظار' && c.status === 'pending')
    return matchesSearch && matchesFilter
  })

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className={styles.title}>العملاء</h1>
          <p className={styles.count}>{customers.length} عميل</p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          عميل جديد
        </Button>
      </motion.div>

      <SearchBar value={search} onChange={setSearch} placeholder="بحث عن عميل..." />

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
    </div>
  )
}
