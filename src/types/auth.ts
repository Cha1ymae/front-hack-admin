export type UserRole = 'admin' | 'student' | 'school' | 'company'

export type AuthUser = {
  sub: string
  username: string
  email?: string
  firstName?: string
  lastName?: string
  roles: UserRole[]
}

export type TokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

export type AuthSession = {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  user: AuthUser
}
