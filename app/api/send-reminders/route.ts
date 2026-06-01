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

function nowCairo(): { year: number; month: number; day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const get = (t: string) => parseInt(parts.find(p => p.type === t)!.value, 10)
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') }
}

function isWithin2Hours(dateStr: string, timeStr: string): { result: boolean; dbg: Record<string, unknown> } {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min] = timeStr.split(':').map(Number)

  const nc = nowCairo()
  const nowCairoDate = new Date(nc.year, nc.month - 1, nc.day, nc.hour, nc.minute, 0)
  const apptCairo = new Date(y, m - 1, d, h, min, 0)

  const diffMs = apptCairo.getTime() - nowCairoDate.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const result = diffHours > 0 && diffHours <= 2

  return {
    result,
    dbg: {
      nowCairo: `${nc.year}-${String(nc.month).padStart(2, '0')}-${String(nc.day).padStart(2, '0')} ${String(nc.hour).padStart(2, '0')}:${String(nc.minute).padStart(2, '0')}`,
      apptCairo: `${dateStr} ${timeStr}`,
      diffHours: Math.round(diffHours * 100) / 100,
      within: result,
    },
  }
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
    const allDebug: Record<string, unknown>[] = []
    snap.forEach((d) => {
      const data = d.data() as Omit<ApptData, 'id'>
      if (data.reminderSent) return
      const { result, dbg } = isWithin2Hours(data.date, data.time)
      allDebug.push({ id: d.id, customer: data.customerName, ...dbg })
      if (result) {
        candidates.push({ id: d.id, ...data })
      }
    })

    console.log('[REMINDER] Checked appointments:', JSON.stringify(allDebug, null, 2))
    console.log('[REMINDER] Appointments within 2 hours:', candidates.length)

    if (candidates.length === 0) {
      return NextResponse.json({ notified: 0, message: 'لا توجد مواعيد خلال ساعتين', checked: allDebug })
    }

    const usersSnap = await db.collection('users').get()
    const allTokens: string[] = []
    const userIds: string[] = []
    usersSnap.forEach((d) => {
      const fcm = (d.data() as { fcmTokens?: string[] }).fcmTokens
      if (fcm?.length) allTokens.push(...fcm)
      userIds.push(d.id)
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

      const notifPayload = {
        title: '📅 تذكير بموعد عميل',
        message: [
          `👤 العميل: ${appt.customerName}`,
          `🕒 الموعد: ${formatTimeArabic(appt.time)}`,
          `📆 التاريخ: ${formatDateArabic(appt.date)}`,
          '',
          'متبقي أقل من ساعتين على الموعد.',
        ].join('\n'),
        type: 'appointment',
        read: false,
        createdAt: new Date().toISOString(),
        appointmentId: appt.id,
        customerId: appt.customerId,
        customerName: appt.customerName,
      }

      const batch = db.batch()
      userIds.forEach((uid) => {
        const ref = db.collection('notifications').doc()
        batch.set(ref, { ...notifPayload, userId: uid })
      })
      await batch.commit()
      console.log('[REMINDER] Created', userIds.length, 'in-app notifications')

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
