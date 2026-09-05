import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import api from './api'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Permission push refusée')
    return null
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync()
    const token = tokenData.data
    const platform = Platform.OS

    await api.post('/notifications/token', { token, platform })
    console.log('Push token enregistré:', token)

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('waluma-notifications', {
        name: 'Waluma',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#22c55e',
      })
    }

    return token
  } catch (error) {
    console.error('Erreur push token:', error)
    return null
  }
}

export function setupNotificationListeners(
  onNotification?: (n: Notifications.Notification) => void,
  onResponse?: (r: Notifications.NotificationResponse) => void
) {
  const notifSub = Notifications.addNotificationReceivedListener(n => {
    onNotification?.(n)
  })

  const responseSub = Notifications.addNotificationResponseReceivedListener(r => {
    onResponse?.(r)
  })

  return () => {
    notifSub.remove()
    responseSub.remove()
  }
}