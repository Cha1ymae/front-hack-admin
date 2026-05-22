import axios from 'axios'
import { env } from '@/utils/env'
import { useAuthStore } from '@/store/auth.store'
import type { Page } from '@/types/api'
import type { AdminUser, UserStatus } from '@/types/entities'
import type { UserRole } from '@/types/auth'

export type KeycloakUser = {
  id: string
  username: string
  email?: string
  firstName?: string
  lastName?: string
  enabled: boolean
  emailVerified?: boolean
  createdTimestamp?: number
}

type KeycloakRole = { id: string; name: string }

const JOBBOARD_ROLES: UserRole[] = ['student', 'school', 'company', 'admin']

export const keycloakAdminClient = axios.create({
  baseURL: `${env.keycloakUrl}/admin/realms/${env.jobBoardRealm}`,
  timeout: 30_000,
})

keycloakAdminClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().session?.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function getRealmUsersCount(): Promise<number> {
  const { data } = await keycloakAdminClient.get<number>('/users/count')
  return data
}

export async function listRealmUsers(params: {
  search?: string
  first?: number
  max?: number
} = {}): Promise<KeycloakUser[]> {
  const { data } = await keycloakAdminClient.get<KeycloakUser[]>('/users', {
    params: {
      search: params.search,
      first: params.first ?? 0,
      max: params.max ?? 50,
    },
  })
  return data
}

export async function listUsersByRealmRole(
  role: 'student' | 'school' | 'company',
  params: { search?: string; max?: number } = {},
): Promise<KeycloakUser[]> {
  try {
    const { data } = await keycloakAdminClient.get<KeycloakUser[]>(
      `/roles/${role}/users`,
      { params: { max: params.max ?? 100 } },
    )
    if (data.length > 0) {
      if (!params.search) return data
      const q = params.search.toLowerCase()
      return data.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          (u.email?.toLowerCase().includes(q) ?? false),
      )
    }
  } catch {
    /* fallback ci-dessous */
  }

  const all = await listRealmUsers({
    search: params.search,
    max: params.max ?? 100,
  })
  const withRoles = await Promise.all(
    all.map(async (user) => ({
      user,
      roles: await getUserRealmRoles(user.id),
    })),
  )
  return withRoles.filter(({ roles }) => roles.includes(role)).map(({ user }) => user)
}

export async function getRealmUser(id: string): Promise<KeycloakUser> {
  const { data } = await keycloakAdminClient.get<KeycloakUser>(`/users/${id}`)
  return data
}

export async function getUserRealmRoles(userId: string): Promise<UserRole[]> {
  const { data } = await keycloakAdminClient.get<KeycloakRole[]>(
    `/users/${userId}/role-mappings/realm`,
  )
  return data
    .map((r) => r.name)
    .filter((name): name is UserRole =>
      JOBBOARD_ROLES.includes(name as UserRole),
    )
}

export async function createRealmUser(input: {
  username: string
  email: string
  firstName?: string
  lastName?: string
  password: string
  enabled?: boolean
}): Promise<KeycloakUser> {
  const response = await keycloakAdminClient.post('/users', {
    username: input.username,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    enabled: input.enabled ?? true,
    emailVerified: true,
  })
  const id = response.headers.location?.split('/').pop()
  if (!id) throw new Error('Utilisateur créé mais identifiant introuvable')

  await keycloakAdminClient.put(`/users/${id}/reset-password`, {
    type: 'password',
    value: input.password,
    temporary: false,
  })

  return getRealmUser(id)
}

export async function updateRealmUser(
  id: string,
  input: Partial<{
    email: string
    firstName: string
    lastName: string
    enabled: boolean
  }>,
): Promise<void> {
  const current = await getRealmUser(id)
  await keycloakAdminClient.put(`/users/${id}`, { ...current, ...input })
}

export async function deleteRealmUser(id: string): Promise<void> {
  await keycloakAdminClient.delete(`/users/${id}`)
}

export async function assignRealmRole(userId: string, role: UserRole): Promise<void> {
  const { data: roleRep } = await keycloakAdminClient.get<KeycloakRole>(
    `/roles/${role}`,
  )
  await keycloakAdminClient.post(`/users/${userId}/role-mappings/realm`, [roleRep])
}

export function mapKeycloakUserToAdminUser(
  user: KeycloakUser,
  roles: UserRole[],
): AdminUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email ?? '',
    firstName: user.firstName,
    lastName: user.lastName,
    roles: roles.length ? roles : ['student'],
    status: user.enabled ? 'active' : 'inactive',
    createdAt: user.createdTimestamp
      ? new Date(user.createdTimestamp).toISOString()
      : new Date().toISOString(),
  }
}

export async function listAdminUsers(params: {
  q?: string
  role?: UserRole
  status?: UserStatus
  limit?: number
} = {}): Promise<Page<AdminUser>> {
  const users = params.role && params.role !== 'admin'
    ? await listUsersByRealmRole(params.role as 'student' | 'school' | 'company', {
        search: params.q,
        max: params.limit ?? 100,
      })
    : await listRealmUsers({ search: params.q, max: params.limit ?? 100 })

  const mapped = await Promise.all(
    users.map(async (user) => {
      const roles = await getUserRealmRoles(user.id)
      return mapKeycloakUserToAdminUser(user, roles)
    }),
  )

  const items = mapped.filter((u) => {
    if (params.status && u.status !== params.status) return false
    if (params.role && !u.roles.includes(params.role)) return false
    return true
  })

  return { items }
}
