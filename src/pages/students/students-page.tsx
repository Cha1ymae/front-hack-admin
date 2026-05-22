import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { queryKeys } from '@/constants/query-keys'
import { validateStudentProfile } from '@/api/students.api'
import { useStudents } from '@/hooks/useStudents'
import { StudentFormDialog } from '@/components/forms/student-form-dialog'
import { DataTable, type Column } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { Student } from '@/types/entities'

export function StudentsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading, isError, error } = useStudents({
    q: search || undefined,
    search,
    page,
  })

  const validate = useMutation({
    mutationFn: validateStudentProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
      toast.success('Compte activé')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const items = data?.items ?? []
  const totalPages = Math.max(1, Math.ceil(items.length / 10))
  const paged = items.slice((page - 1) * 10, page * 10)

  const columns: Column<Student>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Étudiant',
        cell: (r) => (
          <span className="font-medium">
            {r.name} {r.surname}
          </span>
        ),
      },
      { key: 'status', header: 'Recherche', cell: (r) => <Badge variant="outline">{r.jobStatus}</Badge> },
      {
        key: 'validated',
        header: 'Compte',
        cell: (r) => (
          <Badge variant={r.profileValidated ? 'success' : 'warning'}>
            {r.profileValidated ? 'Actif' : 'Inactif'}
          </Badge>
        ),
      },
      { key: 'school', header: 'École', cell: (r) => r.schoolId ?? '—' },
      {
        key: 'dob',
        header: 'Naissance',
        cell: (r) => (r.dateOfBirth ? formatDate(r.dateOfBirth) : '—'),
      },
      {
        key: 'actions',
        header: '',
        cell: (r) =>
          !r.profileValidated ? (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                validate.mutate(r.id)
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
          ) : null,
      },
    ],
    [validate],
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Étudiants</h1>
          <p className="text-muted-foreground">Keycloak (rôle student) + POST /students/signup</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Créer
        </Button>
      </div>
      {isError && <p className="text-sm text-destructive">{(error as Error).message}</p>}
      <DataTable
        columns={columns}
        data={paged}
        isLoading={isLoading}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="Aucun étudiant"
      />
      <StudentFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
