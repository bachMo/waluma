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

/** proxy.ts (middleware) autorise l'accès d'après ce cookie.
 *  Il doit donc être écrit/effacé partout où le token change,
 *  sinon l'admin est éjecté dès son expiration. */
const COOKIE = 'waluma_access_token'
const DUREE_COOKIE = 60 * 60 * 24 * 7 // 7 jours

export function poserCookieToken(token: string) {
  if (typeof document === 'undefined') return
  const secure = location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${COOKIE}=${token}; path=/; max-age=${DUREE_COOKIE}; samesite=lax${secure}`
}

export function effacerCookieToken() {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE}=; path=/; max-age=0`
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('waluma_access_token', accessToken)
    localStorage.setItem('waluma_refresh_token', refreshToken)
    localStorage.setItem('waluma_user', JSON.stringify(user))
    poserCookieToken(accessToken)
    set({ user, accessToken, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('waluma_access_token')
    localStorage.removeItem('waluma_refresh_token')
    localStorage.removeItem('waluma_user')
    effacerCookieToken()
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  hydrate: () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('waluma_access_token')
    const userStr = localStorage.getItem('waluma_user')
    if (token && userStr) {
      // Le cookie peut avoir expiré avant le token : on le repose.
      poserCookieToken(token)
      set({
        accessToken: token,
        user: JSON.parse(userStr),
        isAuthenticated: true,
      })
    }
  },
}))