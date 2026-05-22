import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/utils/env'
import { useAuthStore } from '@/store/auth.store'
import { keycloakTokenUrl } from '@/utils/env'
import { parseAuthUser } from '@/utils/jwt'

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

let refreshPromise: Promise<string | null> | null = null

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().session?.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      }
      useAuthStore.getState().logout()
    }
    return Promise.reject(normalizeError(error))
  },
)

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise
  const { session, setSession, logout } = useAuthStore.getState()
  if (!session?.refreshToken) {
    logout()
    return null
  }
  refreshPromise = (async () => {
    try {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: env.keycloakClientId,
        refresh_token: session.refreshToken!,
      })
      const { data } = await axios.post(keycloakTokenUrl(), body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const user = parseAuthUser(data.access_token)
      setSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? session.refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000,
        user,
      })
      return data.access_token as string
    } catch {
      logout()
      return null
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

export function normalizeError(error: AxiosError): Error {
  const data = error.response?.data as
    | { message?: string | string[]; code?: string }
    | undefined
  const msg = Array.isArray(data?.message)
    ? data.message.join(', ')
    : data?.message ?? error.message
  const err = new Error(msg)
  const enriched = err as Error & { status?: number; code?: string }
  enriched.status = error.response?.status
  enriched.code = data?.code
  return err
}
