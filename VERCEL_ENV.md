# Configuration Vercel - Production

Pour que l'app fonctionne en production sur `https://hotel-demo-murex.vercel.app` :

## Variables d'environnement (Vercel Dashboard → Settings → Environment Variables)

| Variable | Valeur | Obligatoire |
|----------|--------|-------------|
| `BACKEND_URL` | **https://votre-backend.onrender.com** (URL du backend déployé sur Render) | Oui |
| `NEXT_PUBLIC_APP_URL` | `https://hotel-demo-murex.vercel.app` | Oui |
| `BETTER_AUTH_URL` | `https://hotel-demo-murex.vercel.app` | **Oui (Google OAuth)** |
| `BETTER_AUTH_SECRET` | Générer avec `openssl rand -base64 32` | Oui |
| `BETTER_AUTH_BACKEND_SECRET` | Même valeur que `JWT_SECRET` du backend | Oui (pour JWT) |
| `DATABASE_URL` | URL PostgreSQL (Supabase) pour Prisma/Better Auth | **Oui** |
| `GOOGLE_CLIENT_ID` | Votre Client ID Google OAuth | **Oui (pour Google login)** |
| `GOOGLE_CLIENT_SECRET` | Votre Client Secret Google OAuth | **Oui (pour Google login)** |

**Note** : `BACKEND_URL` est utilisé côté serveur uniquement (proxy `/api/backend/*`). Le frontend appelle `/api/backend/settings` etc., le proxy transmet au backend. Pas besoin de `NEXT_PUBLIC_API_URL` si vous utilisez le proxy.

## Google OAuth - Configuration requise

Pour que la connexion Google fonctionne en production :

1. **Google Cloud Console** (https://console.cloud.google.com/) :
   - APIs & Services → Credentials → Créer identifiants → ID client OAuth 2.0
   - Type : Application Web
   - **URI de redirection autorisés** : ajoutez **exactement** :
     ```
     https://hotel-demo-murex.vercel.app/api/auth/callback/google
     ```
   - Si vous avez des sous-domaines Vercel (preview), ajoutez aussi :
     ```
     https://*.vercel.app/api/auth/callback/google
     ```
   - Copiez le Client ID et Client Secret dans Vercel

2. **Variables Vercel** :
   - `BETTER_AUTH_URL` = `https://hotel-demo-murex.vercel.app` (obligatoire)
   - `GOOGLE_CLIENT_ID` = votre Client ID
   - `GOOGLE_CLIENT_SECRET` = votre Client Secret

3. **Base de données** : Les tables Better Auth doivent exister (better_auth_user, better_auth_account, better_auth_session, better_auth_verification). Exécutez la migration `supabase/migrations/20260209000000_better_auth_tables_if_missing.sql` si nécessaire.

## Erreurs courantes

1. **POST /api/auth/sign-in/social 500** (connexion Google) :
   - `BETTER_AUTH_URL` = `https://hotel-demo-murex.vercel.app` (obligatoire)
   - `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` définis sur Vercel
   - URI de redirection Google : `https://hotel-demo-murex.vercel.app/api/auth/callback/google`
   - `DATABASE_URL` valide (Supabase)
   - Tables Better Auth créées (migration `20260209000000_better_auth_tables_if_missing.sql`)
2. **Mixed Content** : `NEXT_PUBLIC_API_URL` doit commencer par `https://` en production.
3. **Backend inaccessible** : 
   - Déployez le backend sur Render
   - `BACKEND_URL` sur Vercel = URL du backend
   - CORS backend autorise `https://hotel-demo-murex.vercel.app`

## Backend (Render) - Variables d'environnement

Sur Render, ajoutez dans votre service backend :

| Variable | Valeur |
|----------|--------|
| `ALLOWED_ORIGINS` | `https://hotel-demo-murex.vercel.app,http://localhost:3000` |

Le backend utilise déjà des patterns pour autoriser `*.vercel.app`. Si ça ne suffit pas, ajoutez explicitement votre URL dans `ALLOWED_ORIGINS`.
