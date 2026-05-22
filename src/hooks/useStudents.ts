import { useQuery } from '@tanstack/react-query'
import { listStudents, type ListStudentsParams } from '@/api/students.api'
import { queryKeys } from '@/constants/query-keys'

export function useStudents(
  params: ListStudentsParams & Record<string, unknown> = {},
) {
  return useQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: () => listStudents(params),
  })
}
