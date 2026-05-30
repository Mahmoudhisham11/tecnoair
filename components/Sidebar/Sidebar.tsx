'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, CalendarDays, Bell, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import styles from './Sidebar.module.css'

const navItems = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'customers', label: 'العملاء', icon: Users, href: '/customers' },
  { id: 'appointments', label: 'المواعيد', icon: CalendarDays, href: '/appointments' },
  { id: 'notifications', label: 'الإشعارات', icon: Bell, href: '/notifications' },
  { id: 'settings', label: 'الإعدادات', icon: Settings, href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={styles.desktop}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoText}>TA</span>
          </div>
          <span className={styles.brandName}>Tecno Air</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.navActive : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className={styles.bottom}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {(user?.name || user?.email || 'U').charAt(0)}
            </div>
            <div className={styles.userText}>
              <span className={styles.userName}>{user?.name || 'مستخدم'}</span>
              <span className={styles.userRole}>{user?.role === 'admin' ? 'أدمن' : 'مستخدم'}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className={styles.mobile}>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
