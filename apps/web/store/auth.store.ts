import { create } from 'zustand'

interface User {
  id: string
  nom: string
  prenom: string
  role: string
  telephone: string
}

interface AuthStore {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('waluma_access_token', accessToken)
    localStorage.setItem('waluma_refresh_token', refreshToken)
    localStorage.setItem('waluma_user', JSON.stringify(user))
    set({ user, accessToken, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('waluma_access_token')
    localStorage.removeItem('waluma_refresh_token')
    localStorage.removeItem('waluma_user')
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  hydrate: () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('waluma_access_token')
    const userStr = localStorage.getItem('waluma_user')
    if (token && userStr) {
      set({
        accessToken: token,
        user: JSON.parse(userStr),
        isAuthenticated: true,
      })
    }
  },
}))