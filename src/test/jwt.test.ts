import { describe, it, expect } from 'vitest'
import type { AuthUser } from '@/types/auth'
import { isPlatformAdmin, parseAuthUser } from '@/utils/jwt'

function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.sig`
}

describe('isPlatformAdmin', () => {
  it('autorise le rôle admin', () => {
    expect(isPlatformAdmin({ roles: ['admin'] } as AuthUser)).toBe(true)
  })

  it('refuse company, student et school', () => {
    expect(isPlatformAdmin({ roles: ['company'] } as AuthUser)).toBe(false)
    expect(isPlatformAdmin({ roles: ['student'] } as AuthUser)).toBe(false)
    expect(isPlatformAdmin({ roles: ['school'] } as AuthUser)).toBe(false)
  })
})

describe('parseAuthUser', () => {
  it('accorde admin pour un token realm master (console Keycloak)', () => {
    const token = fakeJwt({
      sub: '1',
      preferred_username: 'admin',
      iss: 'http://localhost:8080/realms/master',
      realm_access: { roles: ['default-roles-master', 'offline_access'] },
    })
    const user = parseAuthUser(token)
    expect(user.roles).toContain('admin')
    expect(isPlatformAdmin(user)).toBe(true)
  })

  it('refuse carol.company sur realm hack-back', () => {
    const token = fakeJwt({
      sub: '2',
      preferred_username: 'carol.company',
      iss: 'http://localhost:8080/realms/hack-back',
      realm_access: { roles: ['company'] },
    })
    const user = parseAuthUser(token)
    expect(user.roles).toContain('company')
    expect(isPlatformAdmin(user)).toBe(false)
  })
})
