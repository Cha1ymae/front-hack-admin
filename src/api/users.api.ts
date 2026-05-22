import type { Page } from '@/types/api'
import type { AdminUser, UserStatus } from '@/types/entities'
import type { UserRole } from '@/types/auth'
import {
  assignRealmRole,
  createRealmUser,
  deleteRealmUser,
  getRealmUser,
  getUserRealmRoles,
  listAdminUsers,
  mapKeycloakUserToAdminUser,
  updateRealmUser,
} from './keycloak-admin.api'

export type ListUsersParams = {
  cursor?: string
  limit?: number
  q?: string
  role?: UserRole
  status?: UserStatus
}

export type CreateUserInput = {
  username: string
  email: string
  firstName?: string
  lastName?: string
  roles: UserRole[]
  password: string
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'password'>> & {
  password?: string
  status?: UserStatus
}

export async function listUsers(params: ListUsersParams = {}): Promise<Page<AdminUser>> {
  return listAdminUsers({
    q: params.q,
    role: params.role,
    status: params.status,
    limit: params.limit ?? 50,
  })
}

export async function getUser(id: string): Promise<AdminUser> {
  const user = await getRealmUser(id)
  const roles = await getUserRealmRoles(id)
  return mapKeycloakUserToAdminUser(user, roles)
}

export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  const created = await createRealmUser({
    username: input.username,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    password: input.password,
  })
  for (const role of input.roles) {
    if (role !== 'admin') await assignRealmRole(created.id, role)
  }
  return getUser(created.id)
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AdminUser> {
  await updateRealmUser(id, {
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    enabled: input.status ? input.status === 'active' : undefined,
  })
  return getUser(id)
}

export async function deleteUser(id: string): Promise<void> {
  await deleteRealmUser(id)
}
