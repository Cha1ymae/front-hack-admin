import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'
import { queryKeys } from '@/constants/query-keys'
import { getUser } from '@/api/users.api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/constants/routes'

export function UserDetailPage() {
  const { id = '' } = useParams()
  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => getUser(id),
    enabled: Boolean(id),
  })

  if (isLoading) return <Skeleton className="h-48 rounded-xl" />
  if (!user) return <p>Utilisateur introuvable</p>

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to={ROUTES.users}><ArrowLeft className="mr-2 h-4 w-4" />Retour</Link>
      </Button>
      <h1 className="text-2xl font-bold">{user.username}</h1>
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Les mots de passe ne sont jamais stockés ni affichés dans cette application. Keycloak ne
            conserve que des empreintes (hash). Seule la création / réinitialisation permet de saisir un
            mot de passe une fois, via HTTPS.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader><CardTitle>Profil</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Email: {user.email}</p>
          <p>Nom: {user.firstName} {user.lastName}</p>
          <p>Statut: <Badge>{user.status}</Badge></p>
          <p>Rôles: {user.roles.join(', ')}</p>
          <p className="text-muted-foreground font-mono text-xs">ID Keycloak: {user.id}</p>
        </CardContent>
      </Card>
    </div>
  )
}
