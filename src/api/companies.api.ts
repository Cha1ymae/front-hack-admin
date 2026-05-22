import {
  getRealmUser,
  listUsersByRealmRole,
  updateRealmUser,
  type KeycloakUser,
} from './keycloak-admin.api'
import type { Page } from '@/types/api'
import type { Company, CompanyStatus } from '@/types/entities'

export type ListCompaniesParams = {
  cursor?: string
  limit?: number
  q?: string
  status?: CompanyStatus
}

function mapKeycloakUserToCompany(user: KeycloakUser): Company {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username
  return {
    id: user.id,
    keycloakId: user.id,
    name,
    address: '—',
    openToInternships: false,
    status: !user.enabled
      ? 'suspended'
      : user.emailVerified === false
        ? 'pending'
        : 'validated',
    createdAt: user.createdTimestamp
      ? new Date(user.createdTimestamp).toISOString()
      : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export async function listCompanies(
  params: ListCompaniesParams = {},
): Promise<Page<Company>> {
  const users = await listUsersByRealmRole('company', {
    search: params.q,
    max: params.limit ?? 100,
  })
  let items = users.map(mapKeycloakUserToCompany)
  if (params.status) items = items.filter((c) => c.status === params.status)
  return { items }
}

export async function getCompany(id: string): Promise<Company> {
  const user = await getRealmUser(id)
  return mapKeycloakUserToCompany(user)
}

export async function updateCompanyStatus(
  id: string,
  status: CompanyStatus,
): Promise<Company> {
  await updateRealmUser(id, { enabled: status === 'validated' })
  return getCompany(id)
}
