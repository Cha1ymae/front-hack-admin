import {
  Briefcase,
  Building2,
  ClipboardList,
  GraduationCap,
  Users,
} from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { StatCard } from '@/components/cards/stat-card'
import { ApplicationsChart } from '@/components/charts/applications-chart'
import { StatusPieChart } from '@/components/charts/status-pie-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Soumises',
  reviewed: 'Examinées',
  accepted: 'Acceptées',
  rejected: 'Refusées',
  withdrawn: 'Retirées',
}

export function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboard()

  const stats = data?.stats
  const pieData = Object.entries(data?.statusCounts ?? {}).map(([status, value]) => ({
    name: STATUS_LABELS[status] ?? status,
    value,
  }))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Données réelles — Keycloak + gateway {isError ? '' : ''}
        </p>
        {isError && (
          <p className="mt-2 text-sm text-destructive">{(error as Error).message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Utilisateurs" value={stats?.totalUsers ?? 0} icon={Users} />
        <StatCard title="Étudiants" value={stats?.totalStudents ?? 0} icon={GraduationCap} />
        <StatCard
          title="Entreprises"
          value={stats?.totalCompanies ?? 0}
          description={`${stats?.pendingCompanies ?? 0} email non vérifié`}
          icon={Building2}
        />
        <StatCard title="Annonces" value={stats?.totalJobs ?? 0} icon={Briefcase} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Candidatures</CardTitle>
            <CardDescription>Volume par mois (API /applications)</CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationsChart
              data={data?.timeline ?? []}
              emptyMessage="Aucune candidature (token admin ou service arrêté)."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>Statuts réels</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusPieChart
              data={pieData}
              emptyMessage="Aucune candidature chargée."
            />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data?.activities.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">Aucune activité.</p>
            )}
            {data?.activities.map((a) => (
              <div key={a.id} className="flex justify-between gap-4 border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDateTime(a.createdAt)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>KPIs</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold">{stats?.totalApplications ?? 0}</p>
              <p className="text-xs text-muted-foreground">Candidatures</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold">{stats?.applicationsThisWeek ?? 0}</p>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold">{stats?.pendingJobs ?? 0}</p>
              <p className="text-xs text-muted-foreground">Annonces expirées</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold">{stats?.pendingCompanies ?? 0}</p>
              <p className="text-xs text-muted-foreground">Entreprises non vérifiées</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
