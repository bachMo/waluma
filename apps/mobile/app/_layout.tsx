import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { registerForPushNotifications, setupNotificationListeners } from '@/lib/notifications'

export default function RootLayout() {
  useEffect(() => {
    async function init() {
      try {
        const token = await SecureStore.getItemAsync('waluma_access_token')
        const userStr = await SecureStore.getItemAsync('waluma_user')
        if (!token || !userStr) {
          router.replace('/(auth)' as never)
          return
        }
        const user = JSON.parse(userStr)
        if (user.role === 'PRATICIEN') {
          router.replace('/(praticien)' as never)
        } else {
          router.replace('/(tabs)' as never)
        }
        // Enregistrer les notifications push
        await registerForPushNotifications()
      } catch {
        router.replace('/(auth)' as never)
      }
    }

    init()

    // Écouter les notifications
    const cleanup = setupNotificationListeners(
      undefined,
      (response) => {
        const data = response.notification.request.content.data
        if (data?.missionId) {
          router.push({ pathname: '/(tabs)/suivi', params: { missionId: data.missionId } } as never)
        }
      }
    )

    return cleanup
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(praticien)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  )
}