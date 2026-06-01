'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Moon, Sun, Monitor, User, Lock, ChevronLeft, LogOut, X, Check, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import { db, doc, updateDoc, collection, query, where, getDocs } from '@/app/firebase'
import Button from '@/components/Button/Button'
import styles from './settings.module.css'

type ThemeMode = 'light' | 'dark' | 'system'

interface SettingRowProps {
  icon: React.ReactNode
  label: string
  description?: string
  action?: React.ReactNode
  onClick?: () => void
}

function SettingRow({ icon, label, description, action, onClick }: SettingRowProps) {
  return (
    <motion.div className={styles.row} onClick={onClick} whileTap={{ scale: 0.99 }}>
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
    <button className={`${styles.toggle} ${value ? styles.toggleOn : ''}`} onClick={() => onChange(!value)}>
      <div className={styles.toggleKnob} />
    </button>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [theme, setTheme] = useState<ThemeMode>('system')

  const [profileModal, setProfileModal] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const [passModal, setPassModal] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passSaving, setPassSaving] = useState(false)
  const [passMsg, setPassMsg] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('tecnoair_theme') as ThemeMode | null
    const t = saved || 'system'
    setTheme(t)
    applyTheme(t)
  }, [])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  function applyTheme(t: ThemeMode) {
    if (t === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    } else {
      document.documentElement.setAttribute('data-theme', t)
    }
  }

  function handleThemeChange(t: ThemeMode) {
    setTheme(t)
    localStorage.setItem('tecnoair_theme', t)
    applyTheme(t)
  }

  function openProfileModal() {
    setProfileName(user?.name || '')
    setProfileEmail(user?.email || '')
    setProfileMsg('')
    setProfileModal(true)
  }

  async function handleSaveProfile() {
    if (!profileName.trim()) {
      setProfileMsg('الاسم مطلوب')
      return
    }
    setProfileSaving(true)
    setProfileMsg('')
    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        name: profileName.trim(),
        email: profileEmail.trim(),
      })
      setProfileMsg('تم الحفظ')
      setTimeout(() => setProfileModal(false), 800)
    } catch {
      setProfileMsg('حدث خطأ')
    } finally {
      setProfileSaving(false)
    }
  }

  function openPassModal() {
    setCurrentPass('')
    setNewPass('')
    setConfirmPass('')
    setPassMsg('')
    setPassModal(true)
  }

  async function handleChangePassword() {
    if (!currentPass || !newPass || !confirmPass) {
      setPassMsg('جميع الحقول مطلوبة')
      return
    }
    if (newPass !== confirmPass) {
      setPassMsg('كلمة المرور الجديدة غير متطابقة')
      return
    }
    if (newPass.length < 6) {
      setPassMsg('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    setPassSaving(true)
    setPassMsg('')
    try {
      const q = query(collection(db, 'users'), where('email', '==', user?.email))
      const snap = await getDocs(q)
      if (snap.empty) {
        setPassMsg('المستخدم غير موجود')
        setPassSaving(false)
        return
      }
      const d = snap.docs[0]
      const data = d.data()
      if (data.password !== currentPass) {
        setPassMsg('كلمة المرور الحالية غير صحيحة')
        setPassSaving(false)
        return
      }
      await updateDoc(doc(db, 'users', d.id), { password: newPass })
      setPassMsg('تم تغيير كلمة المرور')
      setTimeout(() => setPassModal(false), 800)
    } catch {
      setPassMsg('حدث خطأ')
    } finally {
      setPassSaving(false)
    }
  }

  const themeIcon = theme === 'dark' ? <Moon size={18} /> : theme === 'light' ? <Sun size={18} /> : <Monitor size={18} />
  const themeLabels: Record<ThemeMode, string> = { light: 'فاتح', dark: 'داكن', system: 'النظام' }

  return (
    <div className={styles.page}>
      <motion.div className={styles.header} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className={styles.title}>الإعدادات</h1>
      </motion.div>

      <motion.div className={styles.profileSection} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className={styles.profileAvatar}>
          {(user?.name || user?.email || 'U').charAt(0)}
        </div>
        <div className={styles.profileInfo}>
          <span className={styles.profileName}>{user?.name || 'مستخدم'}</span>
          <span className={styles.profileEmail}>{user?.email || ''}</span>
        </div>
      </motion.div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>الحساب</h2>
        <div className={styles.card}>
          <SettingRow icon={<User size={18} />} label="الملف الشخصي" description="تعديل البيانات الشخصية" onClick={openProfileModal} />
          <div className={styles.divider} />
          <SettingRow icon={<Lock size={18} />} label="تغيير كلمة المرور" description="تحديث كلمة المرور" onClick={openPassModal} />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>الإشعارات</h2>
        <div className={styles.card}>
          <SettingRow icon={<Bell size={18} />} label="إشعارات المواعيد" description="تلقي إشعارات عند تأكيد المواعيد" action={<Toggle value={notifEnabled} onChange={setNotifEnabled} />} />
          <div className={styles.divider} />
          <SettingRow icon={<Bell size={18} />} label="التنبيهات الصوتية" description="تشغيل صوت عند وصول إشعار جديد" action={<Toggle value={soundEnabled} onChange={setSoundEnabled} />} />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>المظهر</h2>
        <div className={styles.card}>
          <SettingRow icon={themeIcon} label="السمة" description={themeLabels[theme]} action={
            <div className={styles.themeOptions}>
              {(['light', 'dark', 'system'] as ThemeMode[]).map((t) => (
                <button
                  key={t}
                  className={`${styles.themeOption} ${theme === t ? styles.themeOptionActive : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleThemeChange(t) }}
                >
                  {t === 'light' ? <Sun size={14} /> : t === 'dark' ? <Moon size={14} /> : <Monitor size={14} />}
                  {t === 'light' ? 'فاتح' : t === 'dark' ? 'داكن' : 'النظام'}
                </button>
              ))}
            </div>
          } />
        </div>
      </div>

      <motion.div className={styles.logoutSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button className={styles.logoutBtn} onClick={logout}>
          <LogOut size={18} />
          تسجيل خروج
        </button>
      </motion.div>

      {profileModal && (
        <div className={styles.modalOverlay} onClick={() => setProfileModal(false)}>
          <motion.div className={styles.modal} onClick={e => e.stopPropagation()} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>تعديل الملف الشخصي</h3>
              <button className={styles.modalClose} onClick={() => setProfileModal(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.fieldLabel}>الاسم</label>
              <input className={styles.fieldInput} value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="الاسم" />
              <label className={styles.fieldLabel}>البريد الإلكتروني</label>
              <input className={styles.fieldInput} value={profileEmail} onChange={e => setProfileEmail(e.target.value)} placeholder="البريد الإلكتروني" />
              {profileMsg && <p className={`${styles.fieldMsg} ${profileMsg === 'تم الحفظ' ? styles.fieldMsgSuccess : styles.fieldMsgError}`}>{profileMsg === 'تم الحفظ' ? <><Check size={14} /> {profileMsg}</> : profileMsg}</p>}
            </div>
            <div className={styles.modalFooter}>
              <Button variant="outline" onClick={() => setProfileModal(false)}>إلغاء</Button>
              <Button onClick={handleSaveProfile} disabled={profileSaving}>{profileSaving ? 'جاري الحفظ...' : 'حفظ'}</Button>
            </div>
          </motion.div>
        </div>
      )}

      {passModal && (
        <div className={styles.modalOverlay} onClick={() => setPassModal(false)}>
          <motion.div className={styles.modal} onClick={e => e.stopPropagation()} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>تغيير كلمة المرور</h3>
              <button className={styles.modalClose} onClick={() => setPassModal(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.fieldLabel}>كلمة المرور الحالية</label>
              <div className={styles.passWrap}>
                <input className={styles.fieldInput} type={showCurrent ? 'text' : 'password'} value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="كلمة المرور الحالية" />
                <button className={styles.passToggle} onClick={() => setShowCurrent(!showCurrent)} tabIndex={-1}>{showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <label className={styles.fieldLabel}>كلمة المرور الجديدة</label>
              <div className={styles.passWrap}>
                <input className={styles.fieldInput} type={showNew ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="كلمة المرور الجديدة" />
                <button className={styles.passToggle} onClick={() => setShowNew(!showNew)} tabIndex={-1}>{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <label className={styles.fieldLabel}>تأكيد كلمة المرور الجديدة</label>
              <div className={styles.passWrap}>
                <input className={styles.fieldInput} type={showConfirm ? 'text' : 'password'} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="تأكيد كلمة المرور" />
                <button className={styles.passToggle} onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              {passMsg && <p className={`${styles.fieldMsg} ${passMsg === 'تم تغيير كلمة المرور' ? styles.fieldMsgSuccess : styles.fieldMsgError}`}>{passMsg === 'تم تغيير كلمة المرور' ? <><Check size={14} /> {passMsg}</> : passMsg}</p>}
            </div>
            <div className={styles.modalFooter}>
              <Button variant="outline" onClick={() => setPassModal(false)}>إلغاء</Button>
              <Button onClick={handleChangePassword} disabled={passSaving}>{passSaving ? 'جاري الحفظ...' : 'حفظ'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
