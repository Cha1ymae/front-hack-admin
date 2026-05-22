import { useQuery } from '@tanstack/react-query'
import { listSchools, type ListSchoolsParams } from '@/api/schools.api'
import { queryKeys } from '@/constants/query-keys'

export function useSchools(
  params: ListSchoolsParams & Record<string, unknown> = {},
) {
  return useQuery({
    queryKey: queryKeys.schools.list(params),
    queryFn: () => listSchools(params),
  })
}
