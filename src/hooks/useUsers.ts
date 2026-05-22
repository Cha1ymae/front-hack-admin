import { useQuery } from '@tanstack/react-query'
import { listUsers, type ListUsersParams } from '@/api/users.api'
import { queryKeys } from '@/constants/query-keys'

export function useUsers(params: ListUsersParams & Record<string, unknown> = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => listUsers(params),
  })
}
