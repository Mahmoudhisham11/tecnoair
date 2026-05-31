import { NextResponse } from 'next/server'
import { db, messaging } from '@/lib/firebaseAdmin'

export async function GET() {
  try {
    const usersSnap = await db.collection('users').get()
    const usersCount = usersSnap.size
    console.log('[TEST] Users found:', usersCount)

    const allTokens: string[] = []
    usersSnap.forEach((d) => {
      const data = d.data() as { fcmTokens?: string[] }
      if (data.fcmTokens?.length) {
        allTokens.push(...data.fcmTokens)
      }
    })

    const uniqueTokens = [...new Set(allTokens)]
    console.log('[TEST] Total tokens:', uniqueTokens.length)

    if (uniqueTokens.length === 0) {
      return NextResponse.json({
        users: usersCount,
        tokens: 0,
        notified: 0,
        message: 'No FCM tokens found',
      })
    }

    const response = await messaging.sendEachForMulticast({
      tokens: uniqueTokens,
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification from system',
      },
      data: {
        type: 'test',
      },
    })

    console.log('[TEST] Success count:', response.successCount)
    console.log('[TEST] Failure count:', response.failureCount)

    return NextResponse.json({
      users: usersCount,
      tokens: uniqueTokens.length,
      notified: response.successCount,
      failed: response.failureCount,
      message: `Sent to ${response.successCount}/${uniqueTokens.length} tokens`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[TEST] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
