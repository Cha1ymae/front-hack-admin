import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hack Admin</h1>
          <p className="mt-2 max-w-md text-primary-foreground/80">
            Plateforme d&apos;administration pour la gestion des alternances et du jobboard.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">© 2026 Hackathon — Enterprise Admin</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <Outlet />
      </div>
    </div>
  )
}
