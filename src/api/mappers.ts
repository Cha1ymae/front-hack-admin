import type { Announcement, AnnouncementStatus } from '@/types/entities'

export type AnnouncementDto = {
  id: string
  companyId: string
  name: string
  description: string
  expirationDate: string
  archivedAt?: string | null
  createdAt: string
  updatedAt: string
}

export function deriveAnnouncementStatus(dto: {
  archivedAt?: string | null
  expirationDate: string
}): AnnouncementStatus {
  if (dto.archivedAt) return 'archived'
  if (new Date(dto.expirationDate) < new Date()) return 'draft'
  return 'published'
}

export function mapAnnouncementDto(dto: AnnouncementDto): Announcement {
  return {
    ...dto,
    status: deriveAnnouncementStatus(dto),
  }
}
