'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Globe, Lock, Moon, Shield, User, ChevronLeft, LogOut } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import styles from './settings.module.css'

interface SettingRowProps {
  icon: React.ReactNode
  label: string
  description?: string
  action?: React.ReactNode
  danger?: boolean
  onClick?: () => void
}

function SettingRow({ icon, label, description, action, onClick }: SettingRowProps) {
  return (
    <motion.div
      className={styles.row}
      onClick={onClick}
      whileTap={{ scale: 0.99 }}
    >
      <div className={styles.rowIcon}>{icon}</div>
      <div className={styles.rowInfo}>
        <span className={styles.rowLabel}>{label}</span>
        {description && <span className={styles.rowDesc}>{description}</span>}
      </div>
      <div className={styles.rowAction}>
        {action || <ChevronLeft size={18} className={styles.chevron} />}
      </div>
    </motion.div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`${styles.toggle} ${value ? styles.toggleOn : ''}`}
      onClick={() => onChange(!value)}
    >
      <div className={styles.toggleKnob} />
    </button>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={styles.title}>الإعدادات</h1>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        className={styles.profileSection}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.profileAvatar}>
          {(user?.name || user?.email || 'U').charAt(0)}
        </div>
        <div className={styles.profileInfo}>
          <span className={styles.profileName}>{user?.name || 'مستخدم'}</span>
          <span className={styles.profileEmail}>{user?.email || ''}</span>
          <span className={styles.profileRole}>
            {user?.role === 'admin' ? 'أدمن' : 'مستخدم عادي'} · {user?.uid?.slice(0, 8)}...
          </span>
        </div>
      </motion.div>

      {/* Account Settings */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>الحساب</h2>
        <div className={styles.card}>
          <SettingRow icon={<User size={18} />} label="الملف الشخصي" description="تعديل البيانات الشخصية" />
          <div className={styles.divider} />
          <SettingRow icon={<Lock size={18} />} label="تغيير كلمة المرور" description="تحديث كلمة المرور" />
          <div className={styles.divider} />
          <SettingRow
            icon={<Shield size={18} />}
            label="صلاحيات الحساب"
            description={user?.role === 'admin' ? 'أدمن' : 'مستخدم عادي'}
          />
        </div>
      </div>

      {/* Notification Settings */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>الإشعارات</h2>
        <div className={styles.card}>
          <SettingRow
            icon={<Bell size={18} />}
            label="إشعارات المواعيد"
            description="تلقي إشعارات عند تأكيد المواعيد"
            action={<Toggle value={notifEnabled} onChange={setNotifEnabled} />}
          />
          <div className={styles.divider} />
          <SettingRow
            icon={<Bell size={18} />}
            label="التنبيهات الصوتية"
            description="تشغيل صوت عند وصول إشعار جديد"
            action={<Toggle value={soundEnabled} onChange={setSoundEnabled} />}
          />
        </div>
      </div>

      {/* General Settings */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>العامة</h2>
        <div className={styles.card}>
          <SettingRow
            icon={<Moon size={18} />}
            label="الوضع الليلي"
            description="تفعيل الألوان الداكنة"
            action={<Toggle value={darkMode} onChange={setDarkMode} />}
          />
          <div className={styles.divider} />
          <SettingRow icon={<Globe size={18} />} label="اللغة" description="العربية" />
        </div>
      </div>

      {/* Logout */}
      <motion.div
        className={styles.logoutSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button className={styles.logoutBtn} onClick={logout}>
          <LogOut size={18} />
          تسجيل خروج
        </button>
      </motion.div>
    </div>
  )
}
