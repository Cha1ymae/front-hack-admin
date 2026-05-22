import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { queryKeys } from '@/constants/query-keys'
import { getCompany } from '@/api/companies.api'
import { listAnnouncements } from '@/api/announcements.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/constants/routes'
import { formatDate } from '@/lib/utils'

export function CompanyDetailPage() {
  const { id = '' } = useParams()
  const { data: company, isLoading } = useQuery({
    queryKey: queryKeys.companies.detail(id),
    queryFn: () => getCompany(id),
    enabled: Boolean(id),
  })
  const { data: jobs } = useQuery({
    queryKey: queryKeys.jobs.list({ companyId: id }),
    queryFn: () => listAnnouncements({ companyId: id, limit: 20 }),
    enabled: Boolean(id),
  })

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />
  if (!company) return <p>Entreprise introuvable</p>

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to={ROUTES.companies}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Link>
      </Button>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-muted-foreground">{company.address}</p>
        </div>
        <Badge>{company.status}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">ID:</span> {company.id}</p>
            <p><span className="text-muted-foreground">Keycloak:</span> {company.keycloakId}</p>
            <p><span className="text-muted-foreground">Alternance:</span> {company.openToInternships ? 'Oui' : 'Non'}</p>
            <p><span className="text-muted-foreground">Créée:</span> {formatDate(company.createdAt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Annonces ({jobs?.items.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobs?.items.map((j) => (
              <div key={j.id} className="flex justify-between border-b py-2 text-sm last:border-0">
                <span>{j.name}</span>
                <Badge variant="outline">{j.status}</Badge>
              </div>
            ))}
            {!jobs?.items.length && (
              <p className="text-sm text-muted-foreground">Aucune annonce</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
