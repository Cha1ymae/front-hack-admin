import { listAnnouncements } from './announcements.api'
import { listApplications } from './applications.api'
import { collectCursorPages } from './pagination'
import {
  getRealmUsersCount,
  listUsersByRealmRole,
} from './keycloak-admin.api'
import { isForbiddenOrUnauthorized } from './errors'
import type { ActivityItem, Application, DashboardStats } from '@/types/entities'
import { deriveAnnouncementStatus } from './mappers'

export type DashboardData = {
  stats: DashboardStats
  activities: ActivityItem[]
  statusCounts: Record<string, number>
  timeline: { month: string; count: number }[]
}

async function fetchApplications(): Promise<Application[]> {
  try {
    return await collectCursorPages(
      (cursor) => listApplications({ cursor, limit: 50 }),
      { maxPages: 3, maxItems: 150 },
    )
  } catch (error) {
    if (isForbiddenOrUnauthorized(error)) return []
    const status = (error as Error & { status?: number }).status
    if (status === 404) return []
    throw error
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const [jobs, usersCount, companyUsers, studentUsers, applications] =
    await Promise.all([
      collectCursorPages(
        (cursor) => listAnnouncements({ cursor, limit: 50, includeArchived: true }),
        { maxPages: 3, maxItems: 150 },
      ),
      getRealmUsersCount().catch(() => 0),
      listUsersByRealmRole('company', { max: 200 }).catch(() => []),
      listUsersByRealmRole('student', { max: 200 }).catch(() => []),
      fetchApplications(),
    ])

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

  const statusCounts = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1
    return acc
  }, {})

  const buckets = new Map<string, number>()
  for (const app of applications) {
    const d = new Date(app.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  const timeline = [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({
      month: formatMonthLabel(month),
      count,
    }))

  const activities: ActivityItem[] = []
  for (const app of applications.slice(0, 5)) {
    activities.push({
      id: `app-${app.id}`,
      type: 'application',
      title: 'Candidature',
      description: `${app.studentId} → ${app.announcementId} (${app.status})`,
      createdAt: app.createdAt,
    })
  }
  for (const job of jobs.slice(0, 3)) {
    activities.push({
      id: `job-${job.id}`,
      type: 'job',
      title: job.name,
      description: `${job.companyId} — ${deriveAnnouncementStatus(job)}`,
      createdAt: job.createdAt,
    })
  }
  activities.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const stats: DashboardStats = {
    totalUsers: usersCount,
    totalStudents: studentUsers.length,
    totalCompanies: companyUsers.length,
    totalJobs: jobs.length,
    totalApplications: applications.length,
    pendingCompanies: companyUsers.filter((u) => !u.emailVerified).length,
    pendingJobs: jobs.filter((j) => deriveAnnouncementStatus(j) === 'draft').length,
    applicationsThisWeek: applications.filter(
      (a) => new Date(a.createdAt).getTime() >= weekAgo,
    ).length,
  }

  return {
    stats,
    activities: activities.slice(0, 8),
    statusCounts,
    timeline,
  }
}

function formatMonthLabel(isoMonth: string): string {
  const [year, month] = isoMonth.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('fr-FR', {
    month: 'short',
  })
}
