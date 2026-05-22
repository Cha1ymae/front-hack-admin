import { useQuery } from '@tanstack/react-query'
import { listAnnouncements, type ListAnnouncementsParams } from '@/api/jobs.api'
import { queryKeys } from '@/constants/query-keys'

export function useJobs(
  params: ListAnnouncementsParams & Record<string, unknown> = {},
) {
  return useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: () => listAnnouncements(params),
  })
}
