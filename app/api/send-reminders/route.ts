import { NextResponse } from 'next/server'
import admin from 'firebase-admin'
import { getAdminDb, getAdminMessaging } from '@/lib/firebaseAdmin'

interface AppointmentDoc {
  id: string
  customerId: string
  customerName: string
  date: string
  time: string
  type: string
  status: string
  notes: string
  reminderSent?: boolean
  createdAt: string
}

interface UserDoc {
  id: string
  fcmTokens?: string[]
}

function isWithin2Hours(dateStr: string, timeStr: string): boolean {
  const appointmentDate = new Date(`${dateStr}T${timeStr}:00`)
  const now = new Date()
  const diffMs = appointmentDate.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  return diffHours > 0 && diffHours <= 2
}

export async function GET() {
  try {
    const adminDb = getAdminDb()
    const adminMessaging = getAdminMessaging()

    const today = new Date().toISOString().split('T')[0]

    const snap = await adminDb
      .collection('appointments')
      .where('date', '>=', today)
      .get()

    const candidateAppointments: AppointmentDoc[] = []
    snap.forEach((d) => {
      const data = d.data() as Omit<AppointmentDoc, 'id'>
      if (!data.reminderSent && isWithin2Hours(data.date, data.time)) {
        candidateAppointments.push({ id: d.id, ...data })
      }
    })

    if (candidateAppointments.length === 0) {
      return NextResponse.json({ notified: 0, message: 'No upcoming appointments within 2 hours' })
    }

    const usersSnap = await adminDb.collection('users').get()
    const allTokens: string[] = []
    usersSnap.forEach((d) => {
      const data = d.data() as UserDoc
      if (data.fcmTokens?.length) {
        allTokens.push(...data.fcmTokens)
      }
    })

    if (allTokens.length === 0) {
      return NextResponse.json({ notified: 0, message: 'No employee FCM tokens found' })
    }

    const uniqueTokens = [...new Set(allTokens)]
    let notifiedCount = 0

    for (const appt of candidateAppointments) {
      const message: admin.messaging.MulticastMessage = {
        tokens: uniqueTokens,
        notification: {
          title: 'Upcoming Appointment Reminder',
          body: `Customer ${appt.customerName} has an appointment at ${appt.time} on ${appt.date}. Please follow up.`,
        },
        data: {
          type: 'appointment_reminder',
          appointmentId: appt.id,
          customerId: appt.customerId,
          customerName: appt.customerName,
          date: appt.date,
          time: appt.time,
        },
      }

      const response = await adminMessaging.sendEachForMulticast(message)
      notifiedCount += response.successCount

      await adminDb.collection('appointments').doc(appt.id).update({
        reminderSent: true,
      })
    }

    return NextResponse.json({
      notified: notifiedCount,
      appointments: candidateAppointments.length,
      message: `Sent ${notifiedCount} notification(s) for ${candidateAppointments.length} appointment(s)`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[REMINDER] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
