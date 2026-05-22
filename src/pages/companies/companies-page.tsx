import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Check, Ban, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { queryKeys } from '@/constants/query-keys'
import { updateCompanyStatus } from '@/api/companies.api'
import { useCompanies } from '@/hooks/useCompanies'
import { DataTable, type Column } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROUTES } from '@/constants/routes'
import { formatDate } from '@/lib/utils'
import type { Company, CompanyStatus } from '@/types/entities'

const statusLabels: Record<CompanyStatus, string> = {
  pending: 'En attente',
  validated: 'Validée',
  suspended: 'Suspendue',
}

const statusVariant: Record<CompanyStatus, 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  validated: 'success',
  suspended: 'destructive',
}

export function CompaniesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error } = useCompanies({
    q: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 100,
    page,
    search,
    statusFilter,
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CompanyStatus }) =>
      updateCompanyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      toast.success('Statut mis à jour (Keycloak)')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const items = data?.items ?? []
  const totalPages = Math.max(1, Math.ceil(items.length / 10))
  const paged = items.slice((page - 1) * 10, page * 10)

  const columns: Column<Company>[] = useMemo(
    () => [
      { key: 'name', header: 'Entreprise', cell: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'address', header: 'Adresse', cell: (r) => r.address },
      {
        key: 'status',
        header: 'Statut',
        cell: (r) => (
          <Badge variant={statusVariant[r.status]}>{statusLabels[r.status]}</Badge>
        ),
      },
      {
        key: 'internships',
        header: 'Alternance',
        cell: (r) => (r.openToInternships ? 'Oui' : 'Non'),
      },
      { key: 'created', header: 'Créée le', cell: (r) => formatDate(r.createdAt) },
      {
        key: 'actions',
        header: '',
        className: 'w-12',
        cell: (r) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(ROUTES.companyDetail(r.id))}>
                <Eye className="mr-2 h-4 w-4" /> Détails
              </DropdownMenuItem>
              {r.status !== 'validated' && (
                <DropdownMenuItem onClick={() => mutation.mutate({ id: r.id, status: 'validated' })}>
                  <Check className="mr-2 h-4 w-4" /> Activer
                </DropdownMenuItem>
              )}
              {r.status !== 'suspended' && (
                <DropdownMenuItem onClick={() => mutation.mutate({ id: r.id, status: 'suspended' })}>
                  <Ban className="mr-2 h-4 w-4" /> Suspendre
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [mutation, navigate],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Entreprises</h1>
        <p className="text-muted-foreground">
          Comptes Keycloak (rôle company) — ex. carol.company apparaît aussi dans Utilisateurs
        </p>
      </div>
      {isError && <p className="text-sm text-destructive">{(error as Error).message}</p>}
      <DataTable
        columns={columns}
        data={paged}
        isLoading={isLoading}
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Rechercher une entreprise…"
        onRowClick={(r) => navigate(ROUTES.companyDetail(r.id))}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyMessage="Aucune entreprise enregistrée"
        toolbar={
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as CompanyStatus | 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="validated">Validées</SelectItem>
              <SelectItem value="suspended">Suspendues</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  )
}
