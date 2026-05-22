import { useQuery } from '@tanstack/react-query'
import { listApplications, type ListApplicationsParams } from '@/api/applications.api'
import { queryKeys } from '@/constants/query-keys'

export function useApplications(
  params: ListApplicationsParams & Record<string, unknown> = {},
) {
  return useQuery({
    queryKey: queryKeys.applications.list(params),
    queryFn: () => listApplications(params),
    retry: (failureCount, error) => {
      const status = (error as Error & { status?: number }).status
      if (status === 401 || status === 403) return false
      return failureCount < 1
    },
  })
}
