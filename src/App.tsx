import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/query-client'
import { AppRoutes } from '@/routes'
import { useThemeEffect } from '@/hooks/use-theme'

function AppProviders() {
  useThemeEffect()
  return (
    <>
      <AppRoutes />
      <Toaster richColors position="top-right" closeButton />
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppProviders />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
