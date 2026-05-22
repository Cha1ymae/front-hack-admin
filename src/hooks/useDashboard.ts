import { useQuery } from '@tanstack/react-query'
import { getDashboardData } from '@/api/dashboard.api'
import { queryKeys } from '@/constants/query-keys'

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboardData,
  })
}
