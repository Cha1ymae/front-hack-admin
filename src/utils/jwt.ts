import { jwtDecode } from 'jwt-decode'
import type { AuthUser, UserRole } from '@/types/auth'
import { ADMIN_REALM_ROLES } from '@/constants/routes'

type JwtPayload = {
  sub: string
  preferred_username?: string
  email?: string
  given_name?: string
  family_name?: string
  iss?: string
  realm_access?: { roles?: string[] }
  resource_access?: Record<string, { roles?: string[] }>
}

const ROLE_MAP: Record<string, UserRole> = {
  admin: 'admin',
  student: 'student',
  school: 'school',
  company: 'company',
  'realm-admin': 'admin',
}

const KEYCLOAK_MASTER_ADMIN_CLIENT_ROLES = [
  'manage-realm',
  'manage-users',
  'view-realm',
  'query-users',
] as const

const JOBBOARD_ROLES = ['student', 'school', 'company'] as const

function isMasterRealmIssuer(iss?: string): boolean {
  return Boolean(iss?.includes('/realms/master'))
}

function isHackBackRealmIssuer(iss?: string): boolean {
  return Boolean(iss?.includes('/realms/hack-back'))
}

/**
 * Admin plateforme :
 * - realm master (compte console Keycloak admin / admin-cli) → autorisé
 * - realm hack-back → uniquement rôle realm `admin`, jamais company/student/school seuls
 */
export function isPlatformAdmin(user: AuthUser): boolean {
  if (user.roles.includes('admin')) return true
  return !JOBBOARD_ROLES.some((r) => user.roles.includes(r)) && user.roles.length === 0
}

export function hasPlatformAdminRealmRole(rawRoles: string[]): boolean {
  return rawRoles.some((r) => ADMIN_REALM_ROLES.includes(r as (typeof ADMIN_REALM_ROLES)[number]))
}

export function parseAuthUser(accessToken: string): AuthUser {
  const payload = jwtDecode<JwtPayload>(accessToken)
  const rawRoles = payload.realm_access?.roles ?? []
  const roles = rawRoles
    .map((r) => ROLE_MAP[r])
    .filter((r): r is UserRole => Boolean(r))

  const realmMgmt = payload.resource_access?.['realm-management']?.roles ?? []
  const hasRealmManagement = KEYCLOAK_MASTER_ADMIN_CLIENT_ROLES.some((r) =>
    realmMgmt.includes(r),
  )
  if (hasRealmManagement && !roles.includes('admin')) {
    roles.push('admin')
  }

  if (rawRoles.includes('admin') && !roles.includes('admin')) {
    roles.push('admin')
  }

  // Console Keycloak (master) : le JWT n'a souvent pas le rôle "admin" explicite
  if (
    isMasterRealmIssuer(payload.iss) &&
    !roles.some((r) => (JOBBOARD_ROLES as readonly string[]).includes(r))
  ) {
    if (!roles.includes('admin')) roles.push('admin')
  }

  // hack-back : rôle admin explicite requis (pas d'auto-admin)
  if (isHackBackRealmIssuer(payload.iss)) {
    const mappedAdmin = rawRoles.includes('admin') || rawRoles.includes('realm-admin')
    if (!mappedAdmin) {
      const idx = roles.indexOf('admin')
      if (idx >= 0) roles.splice(idx, 1)
    }
  }

  return {
    sub: payload.sub,
    username: payload.preferred_username ?? payload.sub,
    email: payload.email,
    firstName: payload.given_name,
    lastName: payload.family_name,
    roles: [...new Set(roles)],
  }
}

export const PLATFORM_ADMIN_REQUIRED_MESSAGE =
  'Accès réservé aux administrateurs de la plateforme. Utilisez le compte Keycloak admin (master). Les comptes entreprise, étudiant et école sont refusés.'
