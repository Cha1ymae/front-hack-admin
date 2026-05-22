export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  keycloakUrl: import.meta.env.VITE_KEYCLOAK_URL as string,
  keycloakRealm: import.meta.env.VITE_KEYCLOAK_REALM as string,
  keycloakClientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string,
  jobBoardRealm: (import.meta.env.VITE_JOBBOARD_REALM as string) || 'hack-back',
} as const

export function keycloakTokenUrl(): string {
  return `${env.keycloakUrl}/realms/${env.keycloakRealm}/protocol/openid-connect/token`
}

export function keycloakLogoutUrl(): string {
  return `${env.keycloakUrl}/realms/${env.keycloakRealm}/protocol/openid-connect/logout`
}
