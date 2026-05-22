import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/routes'
import { PLATFORM_ADMIN_REQUIRED_MESSAGE } from '@/utils/jwt'

const schema = z.object({
  username: z.string().min(1, 'Identifiant requis'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type FormValues = z.infer<typeof schema>

type LocationState = {
  from?: { pathname: string }
  forbidden?: boolean
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [loading, setLoading] = useState(false)
  const state = location.state as LocationState | null
  const from = state?.from?.pathname ?? ROUTES.dashboard
  const showForbiddenBanner = Boolean(state?.forbidden)

  useEffect(() => {
    if (showForbiddenBanner) {
      toast.error(PLATFORM_ADMIN_REQUIRED_MESSAGE)
    }
  }, [showForbiddenBanner])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      await login(data.username, data.password)
      toast.success('Connexion réussie')
      navigate(from, { replace: true })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Échec de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Administration plateforme</CardTitle>
        <CardDescription>
          Compte console Keycloak : <code className="text-xs">admin</code> /{' '}
          <code className="text-xs">admin</code> (realm master). Pas besoin du lien Admin Console
          — ce formulaire suffit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showForbiddenBanner && (
          <div
            role="alert"
            className="mb-4 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{PLATFORM_ADMIN_REQUIRED_MESSAGE}</span>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Identifiant admin</Label>
            <Input id="username" autoComplete="username" {...register('username')} />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Se connecter
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
