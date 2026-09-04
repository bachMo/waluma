import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('waluma_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await SecureStore.getItemAsync('waluma_refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
          await SecureStore.setItemAsync('waluma_access_token', data.accessToken)
          error.config.headers.Authorization = `Bearer ${data.accessToken}`
          return axios(error.config)
        } catch {
          await SecureStore.deleteItemAsync('waluma_access_token')
          await SecureStore.deleteItemAsync('waluma_refresh_token')
          await SecureStore.deleteItemAsync('waluma_user')
          // La navigation sera gérée par le contexte auth
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api