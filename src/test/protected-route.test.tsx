import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/protected-route'
import { useAuthStore } from '@/store/auth.store'

describe('ProtectedRoute', () => {
  it('redirige vers login si non authentifié', () => {
    useAuthStore.setState({
      session: null,
      isHydrated: true,
      isAuthenticated: () => false,
    } as never)

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('refuse un compte company même avec session', () => {
    useAuthStore.setState({
      session: {
        accessToken: 'token',
        expiresAt: Date.now() + 60_000,
        user: { sub: '1', username: 'carol', roles: ['company'] },
      },
      isHydrated: true,
      isAuthenticated: () => false,
      logout: async () => {},
    } as never)

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.queryByText('Secret')).not.toBeInTheDocument()
  })

  it('affiche le contenu si admin plateforme', () => {
    useAuthStore.setState({
      session: {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: Date.now() + 60_000,
        user: { sub: '1', username: 'admin', roles: ['admin'] },
      },
      isHydrated: true,
      isAuthenticated: () => true,
      logout: async () => {},
    } as never)

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(screen.getByText('Secret')).toBeInTheDocument()
  })
})
