import { publicApiClient } from './public-client'
import {
  getRealmUser,
  listUsersByRealmRole,
  updateRealmUser,
  type KeycloakUser,
} from './keycloak-admin.api'
import type { Page } from '@/types/api'
import type { JobStatus, Student } from '@/types/entities'

export type ListStudentsParams = {
  cursor?: string
  limit?: number
  q?: string
  validated?: boolean
}

function mapKeycloakUserToStudent(user: KeycloakUser): Student {
  return {
    id: user.id,
    keycloakId: user.id,
    name: user.firstName ?? user.username,
    surname: user.lastName ?? '',
    dateOfBirth: '',
    jobStatus: 'LOOKING' as JobStatus,
    address: '—',
    profileValidated: user.enabled,
    schoolId: null,
    createdAt: user.createdTimestamp
      ? new Date(user.createdTimestamp).toISOString()
      : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export async function listStudents(
  params: ListStudentsParams = {},
): Promise<Page<Student>> {
  const users = await listUsersByRealmRole('student', {
    search: params.q,
    max: params.limit ?? 100,
  })
  let items = users.map(mapKeycloakUserToStudent)
  if (params.validated !== undefined) {
    items = items.filter((s) => s.profileValidated === params.validated)
  }
  return { items }
}

export async function getStudent(id: string): Promise<Student> {
  const user = await getRealmUser(id)
  return mapKeycloakUserToStudent(user)
}

export async function validateStudentProfile(id: string): Promise<Student> {
  await updateRealmUser(id, { enabled: true })
  return getStudent(id)
}

export type SignUpStudentInput = {
  email: string
  password: string
  name: string
  surname: string
  dateOfBirth: string
  address: string
  schoolId?: string
}

export async function signUpStudent(input: SignUpStudentInput): Promise<void> {
  await publicApiClient.post('/students/signup', input)
}
