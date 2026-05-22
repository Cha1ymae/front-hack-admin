import { useQuery } from '@tanstack/react-query'
import { listCompanies, type ListCompaniesParams } from '@/api/companies.api'
import { queryKeys } from '@/constants/query-keys'

export function useCompanies(
  params: ListCompaniesParams & Record<string, unknown> = {},
) {
  return useQuery({
    queryKey: queryKeys.companies.list(params),
    queryFn: () => listCompanies(params),
  })
}
