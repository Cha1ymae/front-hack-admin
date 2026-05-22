import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { queryKeys } from '@/constants/query-keys'
import { listDocuments, deleteDocument } from '@/api/documents.api'
import { isApiNotAvailable } from '@/api/errors'
import { DataTable, type Column } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { Document } from '@/types/entities'

export function DocumentsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.documents.list({}),
    queryFn: listDocuments,
    retry: false,
  })

  const unavailable = isError && isApiNotAvailable(error)

  const remove = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all })
      toast.success('Document supprimé')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const columns: Column<Document>[] = [
    { key: 'name', header: 'Fichier', cell: (r) => r.name },
    { key: 'owner', header: 'Propriétaire', cell: (r) => `${r.ownerType} / ${r.ownerId}` },
    { key: 'size', header: 'Taille', cell: (r) => `${Math.round(r.size / 1024)} Ko` },
    { key: 'date', header: 'Ajouté', cell: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      header: '',
      cell: (r) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <a href={r.url}><Download className="h-4 w-4" /></a>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Service non déployé dans le backend actuel</p>
        </div>
        <Button disabled={unavailable} onClick={() => toast.info('Upload indisponible — pas d’API documents')}>
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>
      {unavailable && (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          {(error as Error).message}
        </div>
      )}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading && !unavailable}
        emptyMessage={unavailable ? 'Endpoint indisponible' : 'Aucun document'}
      />
    </div>
  )
}
