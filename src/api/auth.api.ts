import axios, { isAxiosError } from 'axios'
import { keycloakTokenUrl, env } from '@/utils/env'
import type { TokenResponse } from '@/types/auth'
import { parseAuthUser } from '@/utils/jwt'
import type { AuthSession } from '@/types/auth'

export type LoginCredentials = {
  username: string
  password: string
}

function mapKeycloakLoginError(error: unknown): Error {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error : new Error('Échec de connexion')
  }

  const status = error.response?.status
  const data = error.response?.data as { error_description?: string; error?: string } | undefined
  const detail = data?.error_description ?? data?.error

  if (status === 401 || status === 400) {
    return new Error(
      detail ??
        `Identifiants refusés pour le realm « ${env.keycloakRealm} » (client ${env.keycloakClientId}). ` +
          `Utilisez le compte admin Keycloak`,
    )
  }

  if (error.code === 'ERR_NETWORK' || !error.response) {
    return new Error(
      `Connexion Keycloak impossible. Redémarrez le front (npm run dev) avec VITE_KEYCLOAK_URL=/auth dans .env. ` +
        `Keycloak doit tourner sur :8080 (docker compose). Si la console Keycloak s’ouvre dans le navigateur, ` +
        `c’était souvent un blocage CORS — le proxy /auth le corrige.`,
    )
  }

  return new Error(detail ?? error.message ?? 'Échec de connexion Keycloak')
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: env.keycloakClientId,
    username: credentials.username,
    password: credentials.password,
  })

  try {
    const { data } = await axios.post<TokenResponse>(keycloakTokenUrl(), body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    const user = parseAuthUser(data.access_token)
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      user,
    }
  } catch (error) {
    throw mapKeycloakLoginError(error)
  }
}

export async function refreshSession(
  session: AuthSession,
): Promise<AuthSession | null> {
  if (!session.refreshToken) return null
  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: env.keycloakClientId,
      refresh_token: session.refreshToken,
    })
    const { data } = await axios.post<TokenResponse>(keycloakTokenUrl(), body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    const user = parseAuthUser(data.access_token)
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? session.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
      user,
    }
  } catch {
    return null
  }
}

export async function logout(refreshToken?: string): Promise<void> {
  if (!refreshToken) return
  try {
    const body = new URLSearchParams({
      client_id: env.keycloakClientId,
      refresh_token: refreshToken,
    })
    await axios.post(
      `${env.keycloakUrl}/realms/${env.keycloakRealm}/protocol/openid-connect/logout`,
      body,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
  } catch {
    /* ignore */
  }
}
