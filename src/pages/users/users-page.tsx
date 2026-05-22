import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { queryKeys } from '@/constants/query-keys'
import { deleteUser } from '@/api/users.api'
import { useUsers } from '@/hooks/useUsers'
import { DataTable, type Column } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserFormDialog } from '@/components/forms/user-form-dialog'
import { ROUTES } from '@/constants/routes'
import type { AdminUser } from '@/types/entities'

export function UsersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading, isError, error } = useUsers({ search, q: search || undefined, page })

  const remove = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('Utilisateur supprimé')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const items = data?.items ?? []
  const totalPages = Math.max(1, Math.ceil(items.length / 10))
  const paged = items.slice((page - 1) * 10, page * 10)

  const columns: Column<AdminUser>[] = useMemo(
    () => [
      { key: 'user', header: 'Utilisateur', cell: (r) => (
        <div>
          <p className="font-medium">{r.username}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      )},
      { key: 'roles', header: 'Rôles', cell: (r) => r.roles.map((role) => (
        <Badge key={role} variant="secondary" className="mr-1">{role}</Badge>
      ))},
      { key: 'status', header: 'Statut', cell: (r) => (
        <Badge variant={r.status === 'active' ? 'success' : 'destructive'}>{r.status}</Badge>
      )},
      {
        key: 'actions',
        header: '',
        cell: (r) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              remove.mutate(r.id)
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ),
      },
    ],
    [remove],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground">Keycloak Admin API — realm hack-back</p>
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
        onRowClick={(r) => navigate(ROUTES.userDetail(r.id))}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="Aucun utilisateur"
      />
      <UserFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
