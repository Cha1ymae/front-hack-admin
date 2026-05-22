import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/constants/query-keys'
import { updateApplicationStatus } from '@/api/applications.api'
import { useApplications } from '@/hooks/useApplications'
import { isForbiddenOrUnauthorized } from '@/api/errors'
import { DataTable, type Column } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import type { Application, ApplicationStatus } from '@/types/entities'

const PIPELINE: ApplicationStatus[] = [
  'submitted',
  'reviewed',
  'accepted',
  'rejected',
  'withdrawn',
]

const statusLabels: Record<ApplicationStatus, string> = {
  submitted: 'Soumise',
  reviewed: 'Examinée',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  withdrawn: 'Retirée',
}

const statusColors: Record<ApplicationStatus, 'default' | 'warning' | 'success' | 'destructive' | 'secondary'> = {
  submitted: 'default',
  reviewed: 'warning',
  accepted: 'success',
  rejected: 'destructive',
  withdrawn: 'secondary',
}

export function ApplicationsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')
  const [selected, setSelected] = useState<Application | null>(null)

  const { data, isLoading, isError, error } = useApplications({
    status: statusFilter === 'all' ? undefined : statusFilter,
    statusFilter,
    limit: 100,
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      updateApplicationStatus(id, status),
    onSuccess: (app) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all })
      setSelected(app)
      toast.success('Statut mis à jour')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const byStatus = useMemo(() => {
    const map: Record<ApplicationStatus, Application[]> = {
      submitted: [],
      reviewed: [],
      accepted: [],
      rejected: [],
      withdrawn: [],
    }
    for (const app of data?.items ?? []) {
      map[app.status].push(app)
    }
    return map
  }, [data])

  const columns: Column<Application>[] = useMemo(
    () => [
      { key: 'id', header: 'ID', cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
      { key: 'student', header: 'Étudiant', cell: (r) => r.studentId },
      { key: 'job', header: 'Annonce', cell: (r) => r.announcementId },
      {
        key: 'status',
        header: 'Statut',
        cell: (r) => <Badge variant={statusColors[r.status]}>{statusLabels[r.status]}</Badge>,
      },
      { key: 'date', header: 'Date', cell: (r) => formatDate(r.createdAt) },
    ],
    [],
  )

  const authBlocked = isError && isForbiddenOrUnauthorized(error)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Candidatures</h1>
        <p className="text-muted-foreground">Pipeline et suivi des statuts</p>
      </div>
      {isError && (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      )}
      <div className="grid gap-3 overflow-x-auto md:grid-cols-5">
        {PIPELINE.map((status) => (
          <div
            key={status}
            className="min-w-[160px] rounded-xl border bg-card p-3 cursor-pointer"
            onClick={() => setStatusFilter(status)}
          >
            <p className="text-xs font-medium text-muted-foreground">{statusLabels[status]}</p>
            <p className="text-2xl font-bold">{byStatus[status].length}</p>
          </div>
        ))}
      </div>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        onRowClick={setSelected}
        emptyMessage="Aucune candidature"
        toolbar={
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ApplicationStatus | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {PIPELINE.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      {selected && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold">Détail candidature {selected.id}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Étudiant {selected.studentId} — Annonce {selected.announcementId}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['reviewed', 'accepted', 'rejected'] as ApplicationStatus[]).map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                disabled={authBlocked}
                onClick={() => mutation.mutate({ id: selected.id, status: s })}
              >
                → {statusLabels[s]}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
