export interface Customer {
  id: string
  name: string
  phone: string
  address: string
  region: string
  jobType: string
  jobPrice: number
  status: 'active' | 'inactive' | 'pending'
  jobStatus: 'pending' | 'in-progress' | 'completed'
  createdAt: string
}

export type AppointmentType = 'periodic-maintenance' | 'emergency-maintenance' | 'follow-up' | 'installation' | 'repair'

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Appointment {
  id: string
  customerId: string
  customerName: string
  date: string
  time: string
  type: AppointmentType
  status: AppointmentStatus
  notes: string
  reminderSent?: boolean
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'appointment' | 'payment' | 'alert' | 'info'
  createdAt?: string
  appointmentId?: string
  customerId?: string
  customerName?: string
}

export interface Stat {
  label: string
  value: string | number
  change: number
  icon: string
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  color: string
}

export type PageId = 'dashboard' | 'customers' | 'appointments' | 'notifications' | 'settings'
