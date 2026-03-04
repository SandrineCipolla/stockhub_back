# 🔧 Troubleshooting — Staging (Render.com + Aiven)

> Problèmes rencontrés lors de la mise en place du staging (session 04/03/2026)

---

## Architecture de l'environnement staging

| Composant       | Service                           | Notes                               |
| --------------- | --------------------------------- | ----------------------------------- |
| Backend         | Render.com (free tier)            | Branche `main`, `autoDeploy: false` |
| Base de données | Aiven MySQL (free tier)           | Peut se mettre en veille            |
| Frontend        | Vercel (preview branch `staging`) | URL fixe `.vercel.app`              |

**URLs :**

- Backend : `https://stockhub-back.onrender.com`
- Frontend : `https://stock-hub-v2-front-git-staging-sandrinecipollas-projects.vercel.app`

**Déployer le backend staging :**

```bash
gh workflow run "CI/CD Pipeline - stockhub-back" --ref main
# Lance : CI → e2e-tests → deploy-to-staging (curl hook Render)
```

---

## 401 Unauthorized — Frontend staging

### Symptôme

Le frontend Vercel staging retourne `401` sur toutes les requêtes API après connexion.

### Diagnostic en plusieurs étapes

**Étape 1 — Vérifier le token dans DevTools**

Network tab → requête échouée → Headers → copier `Authorization: Bearer eyJ...`
→ Décoder sur [jwt.io](https://jwt.io) → vérifier `aud`, `exp`, `tfp`

**Étape 2 — Vérifier les logs Render**

Les logs Render montrent la raison exacte. Messages possibles :

- `Token is valid, proceeding with authentication` → auth OK, problème ailleurs
- `User not authenticated, returning 401` → passport a rejeté le token
- `getaddrinfo ENOTFOUND ...` → problème base de données (voir section Aiven)

### Cause : Audience mismatch PKCE vs ROPC (fix PR #95)

**Contexte :**

- `AZURE_USE_ROPC_POLICY=true` sur Render (pour Postman + E2E)
- Avant fix : backend n'acceptait que l'audience ROPC (`a6a645f0`) → rejetait les tokens PKCE du frontend (`dc30ef57`)

**Fix dans `src/config/authenticationConfig.ts` :**

```typescript
// Quand ROPC activé : accepter les deux audiences
const validAudiences: string | string[] =
  useROPC && process.env.AZURE_ROPC_CLIENT_ID && authConfig.credentials.clientID
    ? [authConfig.credentials.clientID, process.env.AZURE_ROPC_CLIENT_ID]
    : (activeClientID ?? '');
```

**Variables Render requises :**

- `CLIENT_ID` = UUID du client PKCE (commence par `dc30ef57`)
- `AZURE_ROPC_CLIENT_ID` = UUID du client ROPC (commence par `a6a645f0`)
- `AZURE_USE_ROPC_POLICY` = `true`

### Cause : Base de données Aiven éteinte

Si les logs montrent `Token is valid` suivi d'un `getaddrinfo ENOTFOUND` → voir section Aiven ci-dessous.

---

## Aiven MySQL — Instance en veille ou éteinte

### Symptôme

```
Error: getaddrinfo ENOTFOUND mysql-b0d4b9c-sandrine-7b76.d.aivencloud.com
```

L'authentification réussit (`Token is valid`) mais la requête DB échoue et remonte en 401.

### Cause

Aiven free tier **éteint automatiquement** les services après une période d'inactivité.

### Solution

1. Aller sur [console.aiven.io](https://console.aiven.io)
2. Cliquer sur le service `mysql-b0d4b9c`
3. Cliquer **"Power on"**
4. Attendre ~2 minutes le démarrage

### Prévention

Aiven free tier ne garde pas l'instance allumée indéfiniment. Prévoir de la rallumer avant chaque session de test sur staging.

> ⚠️ Si l'instance est **expirée** (pas juste éteinte) : recréer un nouveau service MySQL free tier sur Aiven et mettre à jour `DATABASE_URL` + `DB_HOST` dans les env vars Render.

---

## Render — Déploiement du nouveau code

### Le workflow_dispatch déclenche CI + e2e + deploy

Le job `deploy-to-staging` ne s'exécute que sur `workflow_dispatch` (pas sur push ou PR) :

```bash
gh workflow run "CI/CD Pipeline - stockhub-back" --ref main
```

Vérifier le résultat :

```bash
gh run list --workflow=128519519 --limit=3
gh run view <run-id>  # voir les jobs exécutés
```

### Render cold start après inactivité

Render free tier met le service en veille après ~15 min d'inactivité. La première requête après inactivité est plus lente (cold start ~5s).

### Vérifier que le nouveau code est bien déployé

Dans Render dashboard → service `stockhub-back-staging` → onglet **"Events"** → commit SHA du dernier déploiement.

Comparer avec `git log origin/main --oneline -1` pour confirmer.

---

## Workflow de debug auth (technique)

Si le 401 persiste et qu'on ne voit pas la raison dans les logs Render (passport loggue en `info` mais `loggingLevel: 'warn'`), ajouter temporairement dans `authenticateMiddleware.ts` :

```typescript
if (!user) {
  rootSecurityAuthenticationMiddleware.error(
    'User not authenticated, returning 401 - reason: {reason}',
    { reason: info as unknown as string }
  );
  return res.status(401).json({ error: 'Unauthorized' });
}
```

Déployer sur une branche temporaire `debug-auth-401`, observer les logs, puis supprimer le log de debug.
