import axios from 'axios'

interface PushMessage {
  to: string | string[]
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  badge?: number
  priority?: 'default' | 'normal' | 'high'
}

export async function sendPushNotification(message: PushMessage): Promise<void> {
  const messages = Array.isArray(message.to)
    ? message.to.map(token => ({ ...message, to: token }))
    : [message]

  try {
    await axios.post(
      'https://exp.host/--/api/v2/push/send',
      messages.length === 1 ? messages[0] : messages,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Push notification error:', error)
  }
}

export async function sendToUsers(
  prisma: import('@prisma/client').PrismaClient,
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const tokens = await prisma.pushToken.findMany({
    where: { userId: { in: userIds } },
    select: { token: true },
  })

  if (tokens.length === 0) return

  await sendPushNotification({
    to: tokens.map(t => t.token),
    title,
    body,
    data,
    sound: 'default',
    priority: 'high',
  })
}