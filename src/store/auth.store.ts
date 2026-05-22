import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession } from '@/types/auth'
import * as authApi from '@/api/auth.api'
import {
  isPlatformAdmin,
  PLATFORM_ADMIN_REQUIRED_MESSAGE,
} from '@/utils/jwt'

const STORAGE_KEY = 'hack-admin-auth'

type AuthState = {
  session: AuthSession | null
  isHydrated: boolean
  setHydrated: (v: boolean) => void
  setSession: (session: AuthSession | null) => void
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isHydrated: false,
      setHydrated: (v) => set({ isHydrated: v }),
      setSession: (session) => set({ session }),
      login: async (username, password) => {
        const session = await authApi.login({ username, password })
        if (!isPlatformAdmin(session.user)) {
          await authApi.logout(session.refreshToken)
          throw new Error(PLATFORM_ADMIN_REQUIRED_MESSAGE)
        }
        set({ session })
      },
      logout: async () => {
        const refresh = get().session?.refreshToken
        set({ session: null })
        await authApi.logout(refresh)
      },
      isAuthenticated: () => {
        const s = get().session
        if (!s) return false
        if (!isPlatformAdmin(s.user)) return false
        return s.expiresAt > Date.now() || Boolean(s.refreshToken)
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ session: s.session }),
      onRehydrateStorage: () => (state) => {
        if (state?.session && !isPlatformAdmin(state.session.user)) {
          state.setSession(null)
        }
        state?.setHydrated(true)
      },
    },
  ),
)
