import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { db, messaging } from '@/lib/firebaseAdmin'

interface ApptData {
  id: string
  customerId: string
  customerName: string
  date: string
  time: string
  reminderSent?: boolean
}

function isWithin2Hours(dateStr: string, timeStr: string): boolean {
  const apt = new Date(`${dateStr}T${timeStr}:00`)
  const now = new Date()
  const diff = apt.getTime() - now.getTime()
  const hours = diff / (1000 * 60 * 60)
  return hours > 0 && hours <= 2
}

function formatTimeArabic(t: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'م' : 'ص'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDateArabic(d: string): string {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    console.log('[REMINDER] Checking appointments from', today)

    const snap = await db.collection('appointments').where('date', '>=', today).get()
    console.log('[REMINDER] Total appointments found:', snap.size)

    const candidates: ApptData[] = []
    snap.forEach((d) => {
      const data = d.data() as Omit<ApptData, 'id'>
      if (!data.reminderSent && isWithin2Hours(data.date, data.time)) {
        candidates.push({ id: d.id, ...data })
      }
    })

    console.log('[REMINDER] Appointments within 2 hours:', candidates.length)

    if (candidates.length === 0) {
      return NextResponse.json({ notified: 0, message: 'لا توجد مواعيد خلال ساعتين' })
    }

    const usersSnap = await db.collection('users').get()
    const allTokens: string[] = []
    usersSnap.forEach((d) => {
      const fcm = (d.data() as { fcmTokens?: string[] }).fcmTokens
      if (fcm?.length) allTokens.push(...fcm)
    })

    const uniqueTokens = [...new Set(allTokens)]
    console.log('[REMINDER] Users:', usersSnap.size, '| Tokens:', uniqueTokens.length)

    if (uniqueTokens.length === 0) {
      return NextResponse.json({ notified: 0, message: 'لا توجد توكنات إشعارات' })
    }

    let totalSent = 0

    for (const appt of candidates) {
      console.log('[REMINDER] Sending notification for:', appt.customerName)

      const response = await messaging.sendEachForMulticast({
        tokens: uniqueTokens,
        notification: {
          title: '📅 تذكير بموعد عميل',
          body: [
            `👤 العميل: ${appt.customerName}`,
            `🕒 الموعد: ${formatTimeArabic(appt.time)}`,
            `📆 التاريخ: ${formatDateArabic(appt.date)}`,
            '',
            'متبقي أقل من ساعتين على الموعد.',
            'يرجى مراجعة جدول المواعيد والاستعداد للزيارة.',
          ].join('\n'),
        },
        data: {
          type: 'appointment_reminder',
          appointmentId: appt.id,
          customerId: appt.customerId,
          click_action: '/dashboard/appointments',
        },
        webpush: {
          notification: {
            icon: '/web-app-manager-192x192.png',
            badge: '/favicon-96x96.png',
          },
          fcmOptions: {
            link: '/dashboard/appointments',
          },
        },
      })

      console.log('[REMINDER] Notification sent successfully:', response.successCount, 'delivered,', response.failureCount, 'failed')
      totalSent += response.successCount

      await db.collection('appointments').doc(appt.id).update({
        reminderSent: true,
      })
      console.log('[REMINDER] reminderSent updated for:', appt.id)

      if (response.failureCount > 0) {
        const unregistered: string[] = []
        response.responses.forEach((r, i) => {
          if (r.error) {
            const code = (r.error as any)?.code
            if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
              unregistered.push(uniqueTokens[i])
            }
          }
        })

        if (unregistered.length > 0) {
          const allUsers = await db.collection('users').get()
          for (const u of allUsers.docs) {
            const tokens = (u.data() as { fcmTokens?: string[] }).fcmTokens
            if (!tokens?.length) continue
            const toRemove = tokens.filter((t) => unregistered.includes(t))
            if (toRemove.length > 0) {
              await u.ref.update({
                fcmTokens: FieldValue.arrayRemove(...toRemove),
              })
              console.log('[REMINDER] Removed', toRemove.length, 'invalid token(s) from user', u.id)
            }
          }
        }
      }
    }

    return NextResponse.json({
      notified: totalSent,
      appointments: candidates.length,
      message: `تم إرسال ${totalSent} إشعار لـ ${candidates.length} موعد`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[REMINDER] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
