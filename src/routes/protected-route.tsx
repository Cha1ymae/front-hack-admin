import { Navigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth.store'
import { isPlatformAdmin } from '@/utils/jwt'
import { Skeleton } from '@/components/ui/skeleton'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const session = useAuthStore((s) => s.session)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center gap-4 bg-background p-8">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  if (!session || !isAuthenticated()) {
    const forbidden = session && !isPlatformAdmin(session.user)
    if (forbidden) void logout()
    return (
      <Navigate
        to={ROUTES.login}
        state={{ from: location, forbidden }}
        replace
      />
    )
  }

  if (!isPlatformAdmin(session.user)) {
    void logout()
    return (
      <Navigate
        to={ROUTES.login}
        state={{ from: location, forbidden: true }}
        replace
      />
    )
  }

  return <>{children}</>
}
