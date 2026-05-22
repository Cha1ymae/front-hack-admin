export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  users: "/users",
  userDetail: (id: string) => `/users/${id}`,
  students: "/students",
  studentDetail: (id: string) => `/students/${id}`,
  companies: "/companies",
  companyDetail: (id: string) => `/companies/${id}`,
  schools: "/schools",
  jobs: "/jobs",
  applications: "/applications",
  settings: "/settings",
} as const;

/** Rôles Keycloak realm autorisés pour l'admin plateforme uniquement. */

/** Rôles Keycloak realm autorisés pour l'admin plateforme uniquement. */
export const ADMIN_REALM_ROLES = ["admin", "realm-admin"] as const;
