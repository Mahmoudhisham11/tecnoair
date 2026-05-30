'use client'

import styles from './FilterChip.module.css'

interface FilterChipProps {
  label: string
  active?: boolean
  onClick: () => void
}

export default function FilterChip({ label, active = false, onClick }: FilterChipProps) {
  return (
    <button
      className={`${styles.chip} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
