export const queryKeys = {
  auth: ['auth'] as const,
  dashboard: ['dashboard'] as const,
  users: {
    all: ['users'] as const,
    list: (params: Record<string, unknown>) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  students: {
    all: ['students'] as const,
    list: (params: Record<string, unknown>) => ['students', 'list', params] as const,
    detail: (id: string) => ['students', 'detail', id] as const,
  },
  companies: {
    all: ['companies'] as const,
    list: (params: Record<string, unknown>) => ['companies', 'list', params] as const,
    detail: (id: string) => ['companies', 'detail', id] as const,
  },
  schools: {
    all: ['schools'] as const,
    list: (params: Record<string, unknown>) => ['schools', 'list', params] as const,
    detail: (id: string) => ['schools', 'detail', id] as const,
  },
  jobs: {
    all: ['jobs'] as const,
    list: (params: Record<string, unknown>) => ['jobs', 'list', params] as const,
    detail: (id: string) => ['jobs', 'detail', id] as const,
  },
  applications: {
    all: ['applications'] as const,
    list: (params: Record<string, unknown>) => ['applications', 'list', params] as const,
    detail: (id: string) => ['applications', 'detail', id] as const,
  },
  contracts: {
    all: ['contracts'] as const,
    list: (params: Record<string, unknown>) => ['contracts', 'list', params] as const,
  },
  documents: {
    all: ['documents'] as const,
    list: (params: Record<string, unknown>) => ['documents', 'list', params] as const,
  },
} as const
