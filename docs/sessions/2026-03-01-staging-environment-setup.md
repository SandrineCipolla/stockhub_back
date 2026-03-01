# 📅 Session du 1er Mars 2026 - Mise en place des environnements (Local / Staging / Prod)

## 🎯 Objectif

Mettre en place 4 environnements isolés (local Docker, CI/CD, staging Render+Aiven, prod Azure),
configurer Postman avec authentification ROPC automatique, valider tous les endpoints v2 sur staging,
et mettre en place la gestion du quota Azure.

---

## ✅ Réalisations

- ✅ **Postman — authentification automatique ROPC**
  - Suppression de l'OAuth2 `authorization_code_with_pkce` (non supporté par le runtime Postman)
  - Ajout de la requête `🔑 Get Token` (ROPC via Azure B2C — policy `B2C_1_ROPC`, client `a6a645f0`)
  - Bearer `{{accessToken}}` appliqué directement sur chaque requête
  - Script de test : sauvegarde automatique du token dans `pm.environment.set('accessToken', …)`

- ✅ **Postman — 3 environnements**
  - `Stockhub — Local` : `http://localhost:3006`
  - `Stockhub — Staging` : `https://stockhub-back.onrender.com`
  - `Stockhub — Prod` : `https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net`

- ✅ **Staging Render + Aiven MySQL validé**
  - Tous les endpoints v2 testés et fonctionnels (GET stocks, GET stock details, POST stock,
    GET items, POST item, PATCH item quantity, PATCH stock, DELETE stock)
  - `AZURE_USE_ROPC_POLICY=true` configuré sur Render dashboard

- ✅ **Environnement local Docker**
  - `compose.yaml` (convention Docker Compose V2) avec MySQL 8.0 + service API
  - `.env.docker` (gitignore) : variables Azure B2C chargées via `env_file` — plus d'`export` manuels
  - Seed idempotent `prisma/seed.ts` avec `SEED_OWNER_EMAIL`
  - Port MySQL changé `3307→3308` (conflit avec mysqld local)
  - Commande nodemon corrigée (sans `--env-file=.env` inexistant dans le container)

- ✅ **Gestion quota Azure App Service F1**
  - Scripts `npm run azure:start` / `npm run azure:stop`
  - Workflow : stopper après les sessions de test, démarrer avant

- ✅ **Issues GitHub créées**
  - `#90` : DELETE /api/v2/stocks/:stockId/items/:itemId (endpoint manquant)
  - `#86` mis à jour : migration DB lowercase ✅ mais domain code encore en majuscules ❌

---

## 🏗️ Changements Techniques

### Fichiers Créés

- `postman/Stockhub_Local.postman_environment.json` — env Postman local
- `postman/Stockhub_Staging.postman_environment.json` — env Postman staging
- `postman/Stockhub_Prod.postman_environment.json` — env Postman prod
- `.env.docker` — variables Azure B2C pour docker compose (gitignored)
- `prisma/seed.ts` — seed idempotent 3 users / 3 stocks / 9 items
- `render.yaml` — configuration déploiement Render staging
- `.env.staging.example` — template variables staging

### Fichiers Modifiés

- `Stockhub_V2.postman_collection.json` — ROPC Get Token + bearer sur chaque requête
- `compose.yaml` — port 3308, env_file .env.docker, commande nodemon corrigée
- `package.json` — ajout `db:seed`, `azure:start`, `azure:stop`
- `.gitignore` — ajout `.env.docker`
- `.github/workflows/main_stockhub-back.yml` — job e2e-tests + deploy-to-staging

### Fichiers Supprimés

- `docker-compose.yml` — renommé en `compose.yaml` (convention Docker Compose V2)

---

## 🧪 Tests

- **Tests unitaires** : 142/142 ✅
- **Staging v2 endpoints** : 8/8 validés manuellement via Postman ✅
- **Local Docker** : API opérationnelle, seed OK ✅

---

## 📚 Documentation

- [x] Guide environnements créé : `docs/technical/environments-setup.md`
- [x] Troubleshooting Docker/Postman : `docs/troubleshooting/docker-postman-azure-issues.md`
- [x] Session documentée (ce fichier)
- [x] `docs/7-SESSIONS.md` mis à jour

---

## 🔗 Références

- **Issue** : #85 — Staging environment setup
- **PR** : `feat-issue-85-staging-environment`
- **Issue** : #86 — Migration DB lowercase (en cours)
- **Issue** : #90 — DELETE /items/:itemId (à implémenter)
- Commits : `bdea676`, `1eba749`, `b060733`, `ec01397`, `23bdacc`

---

## 💡 Décisions & Learnings

### Décisions importantes

- **ROPC vs PKCE dans Postman** : Postman ne supporte pas `authorization_code_with_pkce` au runtime → utiliser ROPC (policy `B2C_1_ROPC`) pour les tests API. PKCE reste pour le frontend.
- **`AZURE_USE_ROPC_POLICY=true` sur staging/local** : permet au serveur d'accepter les tokens ROPC (aud: `a6a645f0`) en plus des tokens PKCE (aud: `dc30ef57`)
- **`compose.yaml` vs `docker-compose.yml`** : Docker Compose V2 privilégie `compose.yaml`
- **`env_file` vs `${VAR}` dans compose** : `env_file` charge les vars dans le container, `${VAR}` les interpole au parsing du fichier compose. Utiliser `env_file` pour les secrets non hardcodés.
- **Seed avec `SEED_OWNER_EMAIL`** : le seed doit créer l'owner avec le vrai email Azure B2C pour que `GET /stocks` retourne des résultats pour l'utilisateur authentifié

### Problèmes rencontrés → Solutions

| Problème                                     | Cause                                                                  | Solution                                                                           |
| -------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `could not find a handler for auth: inherit` | OAuth2 `authorization_code_with_pkce` non supporté par Postman runtime | Supprimer l'auth de collection, mettre `Bearer {{accessToken}}` sur chaque requête |
| Azure B2C "trouble signing you in"           | Browser Postman incompatible avec B2C PKCE                             | Utiliser flow ROPC via POST direct                                                 |
| 401 sur staging après token ROPC             | `aud: a6a645f0` mais serveur attend `dc30ef57`                         | Ajouter `AZURE_USE_ROPC_POLICY=true` sur Render                                    |
| Port 3307 indisponible (Docker)              | mysqld local déjà en écoute                                            | Changer mapping → `3308:3306`                                                      |
| `node: .env: not found` dans container       | `start:dev` utilise `--env-file=.env` absent du container              | Appeler nodemon directement sans `--env-file`                                      |
| `GET /stocks → []`                           | Base Docker vide                                                       | Lancer `docker compose exec api npm run db:seed` avec `SEED_OWNER_EMAIL`           |
| Prod Azure Application Error                 | Quota F1 dépassé (60 min CPU/jour)                                     | `npm run azure:stop` après tests, `npm run azure:start` avant                      |

### Learnings

- Items de l'API retournent encore des champs en MAJUSCULES (`ID`, `LABEL`, `QUANTITY`) → bug pré-existant dans `StockItem` entity (issue #86 à finir)
- Azure App Service F1 consomme du quota même sans requêtes (ApplicationInsights background telemetry)
- Le seed doit tourner **dans** le container Docker pour pointer vers la bonne base

---

## 🎯 Prochaines Étapes

- [ ] Merger `feat-issue-85-staging-environment` → main
- [ ] Issue #86 : finir migration domain code MAJUSCULES → minuscules
- [ ] Issue #90 : implémenter DELETE /api/v2/stocks/:stockId/items/:itemId
- [ ] Ajouter `AZURE_USE_ROPC_POLICY=true` dans Azure App Service settings (pour tester prod avec Postman)

---

**📅 Date** : 01/03/2026
**👤 Développeur** : Sandrine Cipolla
