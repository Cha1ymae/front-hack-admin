import { apiClient } from './client'
import type { Page } from '@/types/api'
import type { Application, ApplicationStatus } from '@/types/entities'

export type ListApplicationsParams = {
  cursor?: string
  limit?: number
  studentId?: string
  announcementId?: string
  status?: ApplicationStatus
}

export async function listApplications(
  params: ListApplicationsParams = {},
): Promise<Page<Application>> {
  const { data } = await apiClient.get<Page<Application>>('/applications', {
    params: {
      cursor: params.cursor,
      limit: params.limit ?? 20,
      studentId: params.studentId,
      announcementId: params.announcementId,
      status: params.status,
    },
    timeout: 8_000,
  })
  return data
}

export async function getApplication(id: string): Promise<Application> {
  const { data } = await apiClient.get<Application>(`/applications/${id}`, {
    timeout: 8_000,
  })
  return data
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<Application> {
  const { data } = await apiClient.patch<Application>(`/applications/${id}`, { status })
  return data
}
