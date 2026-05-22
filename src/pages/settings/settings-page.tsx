import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useUiStore } from '@/store/ui.store'
import { env } from '@/utils/env'
import { Badge } from '@/components/ui/badge'

const PERMISSIONS = [
  { id: 'users.read', label: 'Lire utilisateurs' },
  { id: 'users.write', label: 'Modifier utilisateurs' },
  { id: 'companies.validate', label: 'Valider entreprises' },
  { id: 'jobs.moderate', label: 'Modérer annonces' },
  { id: 'applications.manage', label: 'Gérer candidatures' },
]

const ROLES = [
  { name: 'admin', permissions: PERMISSIONS.map((p) => p.id) },
  { name: 'moderator', permissions: ['jobs.moderate', 'companies.validate'] },
  { name: 'viewer', permissions: ['users.read'] },
]

export function SettingsPage() {
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Rôles, permissions et configuration</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
          <CardDescription>Thème clair / sombre</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label>Mode sombre</Label>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Environnement API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">API:</span> {env.apiUrl}</p>
          <p><span className="text-muted-foreground">Realm métier:</span> {env.jobBoardRealm}</p>
          <p><span className="text-muted-foreground">Keycloak:</span> {env.keycloakUrl}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Rôles & permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ROLES.map((role) => (
            <div key={role.name} className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold capitalize">{role.name}</span>
                <Badge variant="secondary">{role.permissions.length} permissions</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {role.permissions.map((p) => (
                  <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
