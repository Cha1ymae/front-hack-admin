import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { queryKeys } from '@/constants/query-keys'
import { deleteSchool } from '@/api/schools.api'
import { useSchools } from '@/hooks/useSchools'
import { DataTable, type Column } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { SchoolFormDialog } from '@/components/forms/school-form-dialog'
import type { School } from '@/types/entities'

export function SchoolsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading, isError, error } = useSchools({
    q: search || undefined,
    search,
  })

  const remove = useMutation({
    mutationFn: deleteSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('École supprimée')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const columns: Column<School>[] = useMemo(
    () => [
      { key: 'name', header: 'École', cell: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'address', header: 'Adresse', cell: (r) => r.address },
      {
        key: 'actions',
        header: '',
        cell: (r) => (
          <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ),
      },
    ],
    [remove],
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Écoles</h1>
          <p className="text-muted-foreground">Keycloak (rôle school) + POST /schools/signup</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>
      {isError && <p className="text-sm text-destructive">{(error as Error).message}</p>}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        emptyMessage="Aucune école"
      />
      <SchoolFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
