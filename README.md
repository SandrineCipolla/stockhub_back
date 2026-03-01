# StockHub Backend — API V2

![CI/CD Pipeline](https://github.com/sandrineCipolla/stockhub_back/actions/workflows/main_stockhub-back.yml/badge.svg)
![Security Audit](https://github.com/SandrineCipolla/stockhub_back/actions/workflows/security-audit.yml/badge.svg)
![Version](https://img.shields.io/badge/version-2.4.0-blue)
![Node](https://img.shields.io/badge/node-20.x-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

API REST Node.js/Express avec architecture DDD/CQRS pour la gestion de stocks familiaux.
Authentification Azure AD B2C, déploiement multi-environnements.

---

## 🌍 Environnements

| Environnement  | URL                                                                    | Status                         |
| -------------- | ---------------------------------------------------------------------- | ------------------------------ |
| **Local**      | `http://localhost:3006`                                                | Docker Compose                 |
| **Staging**    | https://stockhub-back.onrender.com                                     | Render.com (branche `staging`) |
| **Production** | https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net | Azure App Service              |

### Documentation API (Swagger UI)

| Environnement | Swagger UI                                                                      | OpenAPI JSON                                     |
| ------------- | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| Local         | http://localhost:3006/api-docs                                                  | http://localhost:3006/api-docs.json              |
| Staging       | https://stockhub-back.onrender.com/api-docs                                     | https://stockhub-back.onrender.com/api-docs.json |
| Production    | https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net/api-docs | —                                                |

---

## 🚀 Démarrage rapide (Local — Docker)

```bash
git clone https://github.com/SandrineCipolla/stockhub_back.git
cd stockhub_back
npm install

# Créer .env.docker avec les variables Azure B2C (voir docs/technical/environments-setup.md)

# Démarrer MySQL + API
docker compose up -d

# Seeder la base (première fois uniquement)
docker compose exec api sh -c "SEED_OWNER_EMAIL=ton.email@b2c.com npm run db:seed"
```

API disponible sur **http://localhost:3006**

> 📖 Guide complet multi-environnements : [docs/technical/environments-setup.md](./docs/technical/environments-setup.md)

---

## 🧪 Tester avec Postman

Importer depuis le repo :

| Fichier                                             | Description                                 |
| --------------------------------------------------- | ------------------------------------------- |
| `Stockhub_V2.postman_collection.json`               | Collection complète (tous les endpoints v2) |
| `postman/Stockhub_Local.postman_environment.json`   | Environnement local (`localhost:3006`)      |
| `postman/Stockhub_Staging.postman_environment.json` | Environnement staging (Render)              |
| `postman/Stockhub_Prod.postman_environment.json`    | Environnement prod (Azure)                  |

**Flow** : sélectionner un environnement → renseigner `username`/`password` → lancer `🔑 Get Token` → token Bearer sauvegardé automatiquement.

---

## 📋 Scripts disponibles

```bash
# Développement
npm run start:dev        # Serveur local avec hot reload (localhost:3006)

# Docker
docker compose up -d     # Démarrer MySQL + API
docker compose down      # Arrêter (données conservées)
docker compose down -v   # Arrêter + supprimer les données

# Base de données
npm run db:seed          # Seeder (dans le container Docker)
npx prisma migrate dev   # Nouvelle migration
npx prisma migrate deploy # Appliquer les migrations (prod)
npx prisma studio        # Interface visuelle DB

# Tests
npm run test:unit        # 142 tests unitaires
npm run test:integration # Tests d'intégration (TestContainers)
npm run test:e2e         # Tests E2E Playwright
npm run test:coverage    # Rapport de couverture

# Build & Qualité
npm run build            # Build Webpack → dist/index.js
npm run lint             # ESLint 0 warnings
npm run format           # Prettier

# Azure (gestion quota F1 — 60 min CPU/jour)
npm run azure:start      # Démarrer l'app Azure avant de tester prod
npm run azure:stop       # Arrêter l'app Azure après les tests
```

---

## 🏗️ Architecture DDD/CQRS

```
src/
├── domain/
│   ├── stock-management/
│   │   ├── manipulation/      # Command side (CQRS — Write)
│   │   └── visualization/     # Query side (CQRS — Read)
│   └── authorization/         # Entités famille, rôles
├── infrastructure/             # Repositories Prisma
├── api/                        # Controllers, routes, DTOs
├── authentication/             # Azure AD B2C (Passport Bearer)
├── authorization/              # Middleware autorisation stocks
└── config/
```

**Règle** : domain → infrastructure → api (jamais l'inverse)

---

## 🔌 Endpoints V2

Toutes les routes requièrent `Authorization: Bearer <token>`.

```
GET    /api/v2/stocks                         → Stocks de l'utilisateur
GET    /api/v2/stocks/:stockId                → Détail d'un stock
POST   /api/v2/stocks                         → Créer un stock
PATCH  /api/v2/stocks/:stockId                → Modifier un stock
DELETE /api/v2/stocks/:stockId                → Supprimer (cascade items)
GET    /api/v2/stocks/:stockId/items          → Items d'un stock
POST   /api/v2/stocks/:stockId/items          → Ajouter un item
PATCH  /api/v2/stocks/:stockId/items/:itemId  → Modifier la quantité
```

Catégories valides : `alimentation` | `hygiene` | `artistique`

---

## 🗄️ Base de données

### Schéma (Prisma)

```
users    → id, email
stocks   → id, label, description, category, userId
items    → id, label, description, quantity, minimumStock, stockId
```

Relations : `users (1)→(N) stocks (1)→(N) items` (cascade delete)

---

## 🧪 Tests

```bash
npm run test:unit        # 142 tests unitaires (Jest) ✅
npm run test:integration # Tests d'intégration (TestContainers MySQL)
npm run test:e2e         # Tests E2E (Playwright + Azure AD B2C ROPC)
```

---

## 🚀 CI/CD

| Job                      | Déclencheur                          |
| ------------------------ | ------------------------------------ |
| `continuous-integration` | Tous les push / PR                   |
| `e2e-tests`              | PR vers `main` + `workflow_dispatch` |
| `deploy-to-staging`      | `workflow_dispatch` uniquement       |
| `build-and-deploy`       | Push sur `main` → Azure              |

---

## 🔒 Sécurité

- **Authentification** : Azure AD B2C, tokens JWT Bearer
- **Autorisation** : Rôles par stock (OWNER / EDITOR / VIEWER / VIEWER_CONTRIBUTOR)
- Toutes les routes `/api/v1` et `/api/v2` sont protégées

---

## 📚 Documentation

| Ressource                 | Lien                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Wiki global (3 repos)     | https://github.com/SandrineCipolla/stockHub_V2_front/wiki                                                    |
| Guide environnements      | [docs/technical/environments-setup.md](./docs/technical/environments-setup.md)                               |
| Troubleshooting           | [docs/troubleshooting/docker-postman-azure-issues.md](./docs/troubleshooting/docker-postman-azure-issues.md) |
| Sessions de développement | [docs/7-SESSIONS.md](./docs/7-SESSIONS.md)                                                                   |
| ADRs                      | [docs/adr/](./docs/adr/)                                                                                     |
| OpenAPI spec              | [docs/openapi.yaml](./docs/openapi.yaml)                                                                     |

### ADRs

| #                                                                | Décision                | Date     |
| ---------------------------------------------------------------- | ----------------------- | -------- |
| [ADR-001](./docs/adr/ADR-001-migration-ddd-cqrs.md)              | Migration DDD/CQRS      | Nov 2025 |
| [ADR-002](./docs/adr/ADR-002-choix-prisma-orm.md)                | Prisma vs TypeORM       | Déc 2025 |
| [ADR-003](./docs/adr/ADR-003-azure-ad-b2c-authentication.md)     | Azure AD B2C            | Déc 2025 |
| [ADR-004](./docs/adr/ADR-004-tests-value-objects-entities.md)    | TDD Value Objects       | Déc 2025 |
| [ADR-005](./docs/adr/ADR-005-api-versioning-v2.md)               | Versioning API V2       | Déc 2025 |
| [ADR-006](./docs/adr/ADR-006-mysql-azure-cloud.md)               | MySQL Azure             | Déc 2025 |
| [ADR-007](./docs/adr/ADR-007-code-quality-enforcement.md)        | Qualité de code stricte | Déc 2024 |
| [ADR-008](./docs/adr/ADR-008-typescript-request-type-aliases.md) | Type Aliases Express    | Déc 2025 |
| [ADR-009](./docs/adr/ADR-009-resource-based-authorization.md)    | Autorisation hybride    | Déc 2025 |
| [ADR-010](./docs/adr/ADR-010-ci-cd-pipeline-optimization.md)     | Optimisation CI/CD      | Déc 2025 |

---

**Stack** : Node.js · TypeScript · Express · MySQL · Prisma · Azure AD B2C
**Architecture** : DDD/CQRS · Repository Pattern
**Tests** : Jest · TestContainers · Playwright
**Cloud** : Azure App Service · Render.com (staging) · Aiven MySQL (staging)
