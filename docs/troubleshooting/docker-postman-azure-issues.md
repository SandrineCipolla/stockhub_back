# 🔧 Troubleshooting — Docker, Postman & Azure

> Problèmes rencontrés lors de la mise en place des environnements (session 01/03/2026)

---

## Postman — Authentification

### `runtime: could not find a handler for auth: inherit`

**Symptôme** : Toutes les requêtes retournent cette erreur dans la console Postman, aucun header `Authorization` envoyé.

**Cause** : L'auth de collection configurée en OAuth2 avec `authorization_code_with_pkce` n'est pas reconnue par le runtime Postman au moment de l'exécution des requêtes.

**Solution** :

1. Supprimer l'auth OAuth2 de la collection (mettre `No Auth`)
2. Sur chaque requête, ajouter explicitement `Bearer {{accessToken}}` (type Bearer Token)
3. Ajouter une requête `🔑 Get Token` qui utilise ROPC pour obtenir le token et le sauvegarder :

```javascript
// Script "Tests" de la requête Get Token
const json = pm.response.json();
if (json.access_token) {
  pm.environment.set('accessToken', json.access_token);
}
```

---

### "Sorry, but we're having trouble signing you in" (Azure B2C)

**Symptôme** : En cliquant "Get New Access Token" dans Postman avec PKCE, le browser Postman affiche une erreur Azure B2C.

**Cause** : Le browser intégré de Postman n'est pas compatible avec le flow PKCE d'Azure B2C.

**Solution** : Utiliser le flow ROPC (Resource Owner Password Credentials) via une requête POST directe :

```
POST https://stockhubb2c.b2clogin.com/stockhubb2c.onmicrosoft.com/B2C_1_ROPC/oauth2/v2.0/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
client_id=a6a645f0-32fe-42cc-b524-6a3d83bbfb43
username={{username}}
password={{password}}
scope=https://stockhubb2c.onmicrosoft.com/a6a645f0-32fe-42cc-b524-6a3d83bbfb43/access_as_user
response_type=token
```

---

### 401 après token ROPC valide

**Symptôme** : Le token est bien récupéré (expire_in=3600) mais l'API retourne `{"error": "Unauthorized"}`.

**Cause** : Le token ROPC a `aud: a6a645f0` (ROPC client) mais le serveur attend `aud: dc30ef57` (client principal). Les deux audiences sont différentes.

**Solution** : Activer `AZURE_USE_ROPC_POLICY=true` sur le serveur cible :

- **Staging Render** : Dashboard Render → Environment Variables
- **Local Docker** : Fichier `.env.docker`
- **Prod Azure** : Azure Portal → App Service → Configuration → Application Settings

Cette variable permet au serveur d'accepter les deux types de tokens (ROPC + PKCE).

---

## Docker — Environnement local

### `ports are not available: exposing port TCP 0.0.0.0:3307`

**Symptôme** : `docker compose up` échoue avec une erreur de port.

**Cause** : Un process `mysqld` local écoute déjà sur le port 3307.

**Diagnostic** :

```bash
netstat -ano | findstr ":3307"          # Windows
lsof -i :3307                           # Linux/Mac
```

**Solution** : Changer le mapping dans `compose.yaml` :

```yaml
ports:
  - '3308:3306' # 3308 au lieu de 3307
```

---

### `ports are not available: exposing port TCP 0.0.0.0:3006`

**Symptôme** : Le service API Docker échoue au démarrage.

**Cause** : Un process Node.js local (serveur de dev) tourne encore sur le port 3006.

**Solution** :

```bash
# Windows — trouver et tuer le process
netstat -ano | findstr ":3006"
powershell -Command "Stop-Process -Id <PID> -Force"

# Linux/Mac
kill $(lsof -ti:3006)
```

---

### `node: .env: not found` dans le container

**Symptôme** : L'API Docker redémarre en boucle avec ce message dans les logs.

**Cause** : Le script `start:dev` dans `package.json` utilise `--env-file=.env`, mais le fichier `.env` n'est pas copié dans l'image Docker (les variables sont déjà injectées via `environment:` dans `compose.yaml`).

**Solution** : Dans `compose.yaml`, remplacer `npm run start:dev` par un appel direct à nodemon sans `--env-file` :

```yaml
command: sh -c "npx prisma migrate deploy && npx nodemon --exec 'node -r tsconfig-paths/register -r ts-node/register ./src/index.ts' ./src/index.ts"
```

---

### `GET /api/v2/stocks → []` (base vide)

**Symptôme** : L'authentification fonctionne mais aucun stock n'est retourné.

**Cause** : La base Docker est vide au premier démarrage. Les stocks sont filtrés par `userId` de l'utilisateur authentifié — si l'utilisateur n'existe pas en base, aucun stock ne s'affiche.

**Solution** : Lancer le seed avec l'email Azure B2C de l'utilisateur :

```bash
docker compose exec api sh -c "SEED_OWNER_EMAIL=ton.email@exemple.com npm run db:seed"
```

---

## Azure App Service

### "Application Error" / "Error 403 - This web app is stopped" sur prod

**Symptôme** : La prod Azure affiche une page d'erreur ou "Site Disabled".

**Causes possibles** :

1. **Quota F1 dépassé** (le plus fréquent) — l'app a consommé ses 60 min CPU/jour
   - Diagnostic : `az webapp show --name stockhub-back --resource-group StockHubApp-resources --query "usageState"`
   - Solution : attendre minuit UTC (reset automatique) OU `npm run azure:start` après le reset

2. **App manuellement arrêtée** :
   - Solution : `npm run azure:start`

3. **Crash au démarrage** — variable d'environnement manquante, erreur de code :
   - Diagnostic : activer les logs Azure, vérifier Application Settings

**Prévention** : Toujours `npm run azure:stop` après une session de tests sur prod.

---

### Kudu SCM disabled (403 lors du téléchargement des logs)

**Symptôme** : `az webapp log download` retourne `403 Site Disabled`.

**Cause** : Le SCM (Kudu) est désactivé sur le plan F1, ou l'app est arrêtée.

**Alternative** : Activer Application Insights logging via :

```bash
az webapp log config --name stockhub-back --resource-group StockHubApp-resources \
  --application-logging filesystem --level information
```

---

### Les variables d'environnement ne sont pas appliquées sur Azure

**Symptôme** : L'app se comporte comme si une variable n'était pas définie.

**Cause** : Azure App Service **ne lit pas** le fichier `.env`. Toutes les variables doivent être dans les **Application Settings** (Azure Portal → App Service → Configuration).

**Vérification** :

```bash
az webapp config appsettings list --name stockhub-back \
  --resource-group StockHubApp-resources --query "[?name=='MA_VARIABLE']"
```

**Ajout** :

```bash
az webapp config appsettings set --name stockhub-back \
  --resource-group StockHubApp-resources \
  --settings MA_VARIABLE=valeur
```
