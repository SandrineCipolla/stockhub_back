# 🌍 Guide : Mise en place des environnements StockHub

> Procédure complète pour reproduire les 4 environnements du projet.

---

## Vue d'ensemble

| Environnement | Backend              | Base de données         | Usage                   |
| ------------- | -------------------- | ----------------------- | ----------------------- |
| **Local**     | Docker (Node.js)     | Docker MySQL 8.0        | Développement quotidien |
| **CI/CD**     | GitHub Actions       | MySQL service container | Tests automatisés       |
| **Staging**   | Render.com (free)    | Aiven MySQL (free tier) | Validation avant prod   |
| **Prod**      | Azure App Service F1 | Azure MySQL             | Production              |

---

## 1. Environnement Local (Docker)

### Prérequis

- Docker Desktop installé et démarré
- `az` CLI connecté (pour les scripts azure:start/stop)
- Variables Azure B2C disponibles

### Fichiers clés

- `compose.yaml` — définition des services Docker
- `.env.docker` — variables Azure B2C (gitignored, à créer)

### Création de `.env.docker`

```bash
# Créer le fichier (ne jamais committer)
cat > .env.docker << 'EOF'
CLIENT_ID=<azure-b2c-main-client-id>
CLIENT_SECRET=<azure-b2c-client-secret>
AZURE_USE_ROPC_POLICY=true
AZURE_ROPC_CLIENT_ID=<azure-b2c-ropc-client-id>
EOF
```

> Les valeurs se trouvent dans le fichier `.env` local (section Azure B2C).

### Démarrage

```bash
# Premier démarrage (build de l'image)
docker compose up -d --build

# Démarrages suivants (sans rebuild)
docker compose up -d

# Vérifier que l'API est opérationnelle
curl http://localhost:3006/api-docs.json
```

### Seed de la base de données

À faire **une seule fois** après le premier démarrage (ou après `docker compose down -v`) :

```bash
docker compose exec api sh -c "SEED_OWNER_EMAIL=ton.email@azure.b2c npm run db:seed"
```

> Remplacer `ton.email@azure.b2c` par l'email utilisé pour se connecter via Azure B2C (ex: sandrine.cipolla@gmail.com).

Le seed crée :

- 3 utilisateurs : owner (ton email), alice@stockhub.local, bob@stockhub.local
- 1 famille (owner ADMIN, alice MEMBER)
- 3 stocks : Stock Café (alimentation), Stock Hygiène, Stock Artistique
- 9 items dont 3 en sous-stock intentionnel (pour tester l'endpoint low-stock)
- alice EDITOR sur Stock Café

### Commandes utiles

```bash
docker compose logs api -f          # Logs en temps réel
docker compose restart api          # Redémarrer l'API seule
docker compose down                 # Arrêter (garde les données)
docker compose down -v              # Arrêter + supprimer les données
```

### Points d'attention

- **Port MySQL** : exposé sur `3308` (pas 3307 — conflit avec mysqld local si installé)
- **Port API** : `3006` — tuer tout process Node.js local avant `docker compose up`
- **Hot reload** : le dossier `./src` est monté → les modifications sont rechargées automatiquement
- **`AZURE_USE_ROPC_POLICY=true`** : permet d'utiliser Postman avec ROPC (tokens ROPC acceptés)

---

## 2. Environnement CI/CD (GitHub Actions)

### Déclenchement

- **`continuous-integration`** : toutes les branches — lint, TypeScript, tests unitaires
- **`e2e-tests`** : PR vers `main` + `workflow_dispatch` — MySQL sidecar + seed + build + E2E Playwright
- **`deploy-to-staging`** : `workflow_dispatch` uniquement — trigger Render deploy hook
- **`build-and-deploy`** : push sur `main` — déploiement Azure App Service

### Secrets GitHub requis

| Secret                             | Description                            |
| ---------------------------------- | -------------------------------------- |
| `AZURE_CLIENT_ID`                  | Client ID principal Azure B2C          |
| `AZURE_ROPC_CLIENT_ID`             | Client ID ROPC (a6a645f0)              |
| `AZURE_TENANT_ID`                  | Tenant ID Azure B2C                    |
| `AZURE_B2C_DOMAIN`                 | Domaine B2C (stockhubb2c.b2clogin.com) |
| `AZURE_B2C_POLICY`                 | Policy ROPC (B2C_1_ROPC)               |
| `AZURE_TEST_USERNAME`              | Email utilisateur de test              |
| `AZURE_TEST_PASSWORD`              | Mot de passe utilisateur de test       |
| `RENDER_DEPLOY_HOOK_STAGING`       | URL webhook de déploiement Render      |
| `AZUREAPPSERVICE_PUBLISHPROFILE_*` | Profil de publication Azure            |

### Variables GitHub (vars, pas secrets)

| Variable             | Valeur                                 |
| -------------------- | -------------------------------------- |
| `RENDER_STAGING_URL` | URL publique du service Render staging |

---

## 3. Environnement Staging (Render + Aiven)

### Architecture

- **Backend** : Render.com, service web gratuit. Il suit `main` et redéploie à chaque commit. Pour tester une branche, pointer Render dessus puis revenir sur `main` ([ADR-018](../adr/ADR-018-github-flow.md))
- **Base de données** : Aiven MySQL — free tier (1 instance)

### Configuration Render

1. Créer un compte sur [render.com](https://render.com)
2. New → Web Service → connecter le repo GitHub
3. Paramètres :
   - **Branch** : `main`
   - **Auto-Deploy** : On Commit
   - **Build Command** : `npm ci && npm run build`
   - **Start Command** : `node dist/index.js`
   - **Health Check Path** : `/api-docs.json`
4. Environment Variables à configurer dans le dashboard :

| Variable                | Valeur                                 |
| ----------------------- | -------------------------------------- |
| `NODE_ENV`              | `staging`                              |
| `DB_SSL`                | `true`                                 |
| `DB_HOST`               | `<aiven-host>`                         |
| `DB_USER`               | `<aiven-user>`                         |
| `DB_PASSWORD`           | `<aiven-password>`                     |
| `DB_PORT`               | `<aiven-port>`                         |
| `DB_DATABASE`           | `stockhub`                             |
| `DATABASE_URL`          | `mysql://user:pass@host:port/stockhub` |
| `CLIENT_ID`             | Client ID Azure B2C principal          |
| `CLIENT_SECRET`         | Secret Azure B2C                       |
| `AZURE_USE_ROPC_POLICY` | `true`                                 |
| `AZURE_ROPC_CLIENT_ID`  | `a6a645f0-32fe-42cc-b524-6a3d83bbfb43` |
| `ALLOWED_ORIGINS`       | URLs front autorisées                  |
| `VERCEL_PREVIEW_CORS`   | `true`                                 |

### Configuration Aiven MySQL

1. Créer un compte sur [aiven.io](https://aiven.io)
2. New Service → MySQL → Free tier → région Frankfurt
3. Récupérer : hostname, port, username, password, CA certificate
4. Renseigner les variables dans Render dashboard
5. ⚠️ **Aiven free tier expire si inactif** — le service se met en veille automatiquement après une période. Si la DB ne répond plus, recréer un service Aiven et mettre à jour les vars Render.

### Premier déploiement

Render déploie `main` dès la connexion du repo, puis à chaque commit. Le job `deploy-to-staging` de la CI (déclenchement manuel) appelle le Deploy Hook Render pour forcer un redéploiement. Les réglages effectifs sont ceux du dashboard Render : `render.yaml` (`autoDeploy: false`) ne reflète pas la configuration actuelle.

### Migrations en staging

Render exécute `npm run build` puis `node dist/index.js`. Les migrations Prisma ne sont **pas** automatiques — ajouter une étape dans `render.yaml` ou lancer manuellement depuis la console Render :

```bash
npx prisma migrate deploy
```

---

## 4. Environnement Production (Azure)

### Architecture

- **Backend** : Azure App Service (plan F1 gratuit)
- **Base de données** : Azure Database for MySQL Flexible Server
- **Authentification** : Azure AD B2C (tenant `stockhubb2c`)

### ⚠️ Quota F1 : 60 min CPU/jour

Le plan gratuit F1 s'arrête automatiquement après 60 min de CPU/jour.

**Gestion du quota** :

```bash
npm run azure:start   # Démarrer l'app avant de tester
npm run azure:stop    # Arrêter l'app après les tests
```

> Nécessite `az` CLI connecté : `az login`

### Configuration Azure App Service (Application Settings)

Variables à configurer dans **Azure Portal → App Service → Configuration** :

| Variable                                | Valeur                                 |
| --------------------------------------- | -------------------------------------- |
| `NODE_ENV`                              | `production`                           |
| `PORT`                                  | `8080`                                 |
| `DB_HOST`                               | Hostname Azure MySQL                   |
| `DB_USER`                               | Utilisateur DB                         |
| `DB_PASSWORD`                           | Mot de passe DB                        |
| `DB_PORT`                               | `3306`                                 |
| `DB_DATABASE`                           | `stockhub`                             |
| `DB_SSL`                                | `true`                                 |
| `CLIENT_ID`                             | Client ID Azure B2C principal          |
| `CLIENT_SECRET`                         | Secret Azure B2C                       |
| `AZURE_USE_ROPC_POLICY`                 | `true` (pour tests Postman)            |
| `AZURE_ROPC_CLIENT_ID`                  | `a6a645f0-32fe-42cc-b524-6a3d83bbfb43` |
| `ALLOWED_ORIGINS`                       | URLs front autorisées                  |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Connection string App Insights         |

> ⚠️ Azure App Service ne lit **pas** le fichier `.env` — tout doit être dans Application Settings.

### Déploiement

Le déploiement est automatique via GitHub Actions à chaque push sur `main` (job `build-and-deploy`).

---

## 5. Postman — Configuration

### Import

1. Importer `Stockhub_V2.postman_collection.json`
2. Importer les 3 environnements depuis `postman/` :
   - `Stockhub_Local.postman_environment.json`
   - `Stockhub_Staging.postman_environment.json`
   - `Stockhub_Prod.postman_environment.json`

### Obtenir un token

1. Sélectionner l'environnement cible (Local / Staging / Prod)
2. Renseigner `username` et `password` dans les variables d'environnement
3. Lancer `🔑 Get Token` — le token est sauvegardé automatiquement dans `accessToken`
4. Toutes les requêtes utilisent `{{accessToken}}` en Bearer

### Variables d'environnement Postman

| Variable      | Description                                         |
| ------------- | --------------------------------------------------- |
| `baseUrl`     | URL de base de l'API                                |
| `username`    | Email Azure B2C                                     |
| `password`    | Mot de passe Azure B2C                              |
| `accessToken` | Token Bearer (rempli automatiquement par Get Token) |
| `stockId`     | ID de stock pour les tests                          |
| `itemId`      | ID d'item pour les tests                            |

---

## 6. Troubleshooting rapide

Voir `docs/troubleshooting/docker-postman-azure-issues.md` pour les problèmes détaillés.

| Symptôme                       | Solution rapide                                                        |
| ------------------------------ | ---------------------------------------------------------------------- |
| `GET /stocks → []`             | `docker compose exec api sh -c "SEED_OWNER_EMAIL=... npm run db:seed"` |
| Port 3308 indisponible         | Vérifier `docker compose ps`, ou changer le port dans `compose.yaml`   |
| Port 3006 indisponible         | Tuer le process Node.js local : `kill $(lsof -ti:3006)`                |
| 401 avec token ROPC            | Vérifier `AZURE_USE_ROPC_POLICY=true` sur le serveur cible             |
| Prod Azure 403 "Site Disabled" | `npm run azure:start` (quota reset à minuit UTC si quota épuisé)       |
| Staging Aiven unreachable      | Recréer le service Aiven (free tier expiré) et mettre à jour Render    |
