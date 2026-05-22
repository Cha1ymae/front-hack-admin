import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/login-page'

vi.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: (s: { login: () => Promise<void> }) => unknown) =>
    selector({ login: vi.fn().mockResolvedValue(undefined) }),
}))

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('affiche le formulaire de connexion', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /administration plateforme/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/identifiant/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  })
})
