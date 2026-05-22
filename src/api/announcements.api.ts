import { apiClient } from './client'
import { mapAnnouncementDto, type AnnouncementDto } from './mappers'
import type { Page } from '@/types/api'
import type { Announcement, AnnouncementStatus } from '@/types/entities'

export type ListAnnouncementsParams = {
  cursor?: string
  limit?: number
  companyId?: string
  q?: string
  includeArchived?: boolean
  status?: AnnouncementStatus
}

export async function listAnnouncements(
  params: ListAnnouncementsParams = {},
): Promise<Page<Announcement>> {
  const { data } = await apiClient.get<Page<AnnouncementDto>>('/announcements', {
    params: {
      cursor: params.cursor,
      limit: params.limit ?? 20,
      companyId: params.companyId,
      q: params.q,
      includeArchived: params.includeArchived,
    },
  })
  let items = data.items.map(mapAnnouncementDto)
  if (params.status) items = items.filter((a) => a.status === params.status)
  return { items, nextCursor: data.nextCursor }
}

export async function getAnnouncement(id: string): Promise<Announcement> {
  const { data } = await apiClient.get<AnnouncementDto>(`/announcements/${id}`)
  return mapAnnouncementDto(data)
}

export async function updateAnnouncementStatus(
  id: string,
  status: AnnouncementStatus,
): Promise<Announcement> {
  if (status === 'archived') {
    const { data } = await apiClient.delete<AnnouncementDto>(`/announcements/${id}`)
    return mapAnnouncementDto(data)
  }
  throw new Error('Seule l’archivage (DELETE) est supporté par l’API backend.')
}
