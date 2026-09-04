import * as SecureStore from 'expo-secure-store'

export interface User {
  id: string
  nom: string
  prenom: string
  role: 'PATIENT' | 'PRATICIEN' | 'ADMIN'
  telephone: string
}

export async function saveAuth(user: User, accessToken: string, refreshToken: string) {
  await Promise.all([
    SecureStore.setItemAsync('waluma_access_token', accessToken),
    SecureStore.setItemAsync('waluma_refresh_token', refreshToken),
    SecureStore.setItemAsync('waluma_user', JSON.stringify(user)),
  ])
}

export async function getUser(): Promise<User | null> {
  const userStr = await SecureStore.getItemAsync('waluma_user')
  if (!userStr) return null
  return JSON.parse(userStr)
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync('waluma_access_token')
}

export async function clearAuth() {
  await Promise.all([
    SecureStore.deleteItemAsync('waluma_access_token'),
    SecureStore.deleteItemAsync('waluma_refresh_token'),
    SecureStore.deleteItemAsync('waluma_user'),
  ])
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await SecureStore.getItemAsync('waluma_access_token')
  return !!token
}