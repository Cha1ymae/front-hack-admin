# Hack Admin — Frontend Administration

Application admin enterprise pour la plateforme alternance/jobboard (architecture micro-services).

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- React Router DOM 7
- TanStack Query, Zustand, Axios
- React Hook Form + Zod
- Recharts, Lucide, Sonner

## Installation

```bash
npm install
cp .env.example .env
```

## Lancer en développement

```bash
# Terminal 1 — backend (hackaton-back, ne pas modifier)
cd ../hackaton-back
docker compose up -d
npm run start:all

# Terminal 2 — admin frontend
npm run dev
```

- Admin UI : http://localhost:3000
- API proxy : `/api` → gateway APISIX (9080)
- Keycloak : http://localhost:8080

### Connexion (admin plateforme)

**Ce n’est pas le même login que le lien Keycloak Admin Console.**

|        | Console Keycloak (ton lien)                                   | Cette app Hack Admin                       |
| ------ | ------------------------------------------------------------- | ------------------------------------------ |
| URL    | `.../realms/master/.../auth?client_id=security-admin-console` | Formulaire sur http://localhost:3000/login |
| Realm  | `master`                                                      | `master` (voir `.env`)                     |
| Client | `security-admin-console` (OAuth redirect)                     | `admin-cli` (mot de passe direct)          |
| Compte | `admin` / `admin`                                             | **Les mêmes** `admin` / `admin`            |

Configuration par défaut (`.env`) :

```env
VITE_KEYCLOAK_URL=/auth
VITE_KEYCLOAK_REALM=master
VITE_KEYCLOAK_CLIENT_ID=admin-cli
```

`VITE_KEYCLOAK_URL=/auth` passe par le **proxy Vite** (évite CORS). Keycloak reste sur `:8080` ; l’app appelle `http://localhost:3000/auth/...`.

**Ne pas utiliser** `carol.company` / `alice.student` — realm `hack-back`, rôles métier, refusés ici.

Si tu avais encore `VITE_KEYCLOAK_REALM=hack-back` : le compte `admin` de la console **n’existe pas** dans ce realm → **401**.

| Compte                       | Accès admin app |
| ---------------------------- | --------------- |
| `admin` / `admin` (master)   | Oui             |
| `carol.company` / `password` | Non             |

### Données

Toutes les données proviennent d’API réelles :

- **Gateway** (`VITE_API_URL` → proxy `/api` → APISIX `:9080`) : `/announcements`, `/applications`, signups
- **Keycloak Admin** (token `master`) : utilisateurs / entreprises / écoles / étudiants du realm `hack-back`

Les services **contrats** et **documents** ne sont pas exposés par le backend : les pages affichent un état vide explicite.

## Build & preview

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Structure

```
src/
├── api/           # Couche HTTP (auth, users, companies, jobs…)
├── components/    # UI, tables, charts, forms, layout
├── constants/     # Routes, navigation, query keys
├── hooks/
├── layouts/
├── lib/
├── pages/
├── routes/
├── store/         # Zustand (auth, UI)
├── types/
├── utils/
└── test/
```

## Variables d'environnement

| Variable                | Description                      |
| ----------------------- | -------------------------------- |
| VITE_API_URL            | Base URL API (proxy Vite `/api`) |
| VITE_KEYCLOAK_URL       | URL Keycloak                     |
| VITE_KEYCLOAK_REALM     | Realm                            |
| VITE_KEYCLOAK_CLIENT_ID | Client public                    |
| VITE_GATEWAY_URL        | Cible proxy APISIX               |
| VITE_JOBBOARD_REALM     | Realm métier (hack-back)         |

## TODO backend (hors scope frontend)

- [ ] `GET /admin/companies` — liste admin entreprises
- [ ] `GET /admin/users` — gestion utilisateurs Keycloak
- [ ] `GET /admin/students` — liste étudiants
- [ ] Service Contrats / Documents / Indicateurs
