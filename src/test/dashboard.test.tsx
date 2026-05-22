import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'

vi.mock('@/api/dashboard.api', () => ({
  getDashboardData: vi.fn().mockResolvedValue({
    stats: {
      totalUsers: 10,
      totalStudents: 4,
      totalCompanies: 3,
      totalJobs: 12,
      totalApplications: 8,
      pendingCompanies: 1,
      pendingJobs: 2,
      applicationsThisWeek: 3,
    },
    activities: [],
    statusCounts: { submitted: 5 },
    timeline: [{ month: 'mai', count: 4 }],
  }),
}))

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

describe('DashboardPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('affiche les KPIs après chargement', async () => {
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })
})
