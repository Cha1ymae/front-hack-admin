import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Archive } from 'lucide-react'
import { toast } from 'sonner'
import { queryKeys } from '@/constants/query-keys'
import { updateAnnouncementStatus } from '@/api/jobs.api'
import { useJobs } from '@/hooks/useJobs'
import { DataTable, type Column } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import type { Announcement, AnnouncementStatus } from '@/types/entities'

const statusLabels: Record<AnnouncementStatus, string> = {
  draft: 'Expirée',
  published: 'Publiée',
  archived: 'Archivée',
  pending_review: 'À modérer',
}

export function JobsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error } = useJobs({
    q: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    includeArchived: statusFilter === 'archived' || statusFilter === 'all',
    limit: 50,
  })

  const mutation = useMutation({
    mutationFn: (id: string) => updateAnnouncementStatus(id, 'archived'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all })
      toast.success('Annonce archivée')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const items = data?.items ?? []
  const totalPages = Math.max(1, Math.ceil(items.length / 10))
  const paged = items.slice((page - 1) * 10, page * 10)

  const columns: Column<Announcement>[] = useMemo(
    () => [
      { key: 'name', header: 'Titre', cell: (r) => <span className="font-medium">{r.name}</span> },
      {
        key: 'company',
        header: 'Entreprise',
        cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.companyId}</span>,
      },
      {
        key: 'status',
        header: 'Statut',
        cell: (r) => <Badge variant="outline">{statusLabels[r.status]}</Badge>,
      },
      { key: 'expires', header: 'Expiration', cell: (r) => formatDate(r.expirationDate) },
      {
        key: 'actions',
        header: '',
        cell: (r) =>
          r.status !== 'archived' ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                mutation.mutate(r.id)
              }}
            >
              <Archive className="h-3 w-3" />
            </Button>
          ) : null,
      },
    ],
    [mutation],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Annonces</h1>
        <p className="text-muted-foreground">GET /announcements — données gateway</p>
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
        emptyMessage="Aucune annonce"
        toolbar={
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as AnnouncementStatus | 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="published">Publiées</SelectItem>
              <SelectItem value="draft">Expirées</SelectItem>
              <SelectItem value="archived">Archivées</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  )
}
