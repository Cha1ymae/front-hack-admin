import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { AppNavbar } from '@/components/navbar/app-navbar'
import { CommandPalette } from '@/components/modals/command-palette'
import { useUiStore } from '@/store/ui.store'
import { cn } from '@/lib/utils'

export function AdminLayout() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <AppSidebar />
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => useUiStore.getState().setSidebarOpen(false)}
        />
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppNavbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
