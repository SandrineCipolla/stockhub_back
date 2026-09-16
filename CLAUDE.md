# StockHub V2 - Backend

API Node.js/Express avec architecture DDD/CQRS pour la gestion de stocks intelligente avec prédictions ML.

Process de contribution (branches, commits, PR, workflow par ticket, gestion des issues GitHub) → voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Repositories du projet

### Backend (ce repo)

- **Chemin local**: `C:\Users\sandr\Dev\Perso\Projets\stockhub\stockhub_back`
- **URL GitHub**: https://github.com/SandrineCipolla/stockhub_back
- **Prod (Azure App Service)**: https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net/
- **Staging (Render.com)**: déployé automatiquement depuis la branche `staging`, DB Aiven MySQL
- **Description**: API REST StockHub avec architecture DDD/CQRS et authentification Azure AD B2C
- **Tech**: Node.js, Express, TypeScript, Prisma, MySQL, Azure AD B2C (versions exactes dans `package.json`)

### Frontend

- **Chemin local**: `C:\Users\sandr\Dev\RNCP7\StockHubV2\Front_End\stockHub_V2_front`
- **URL GitHub**: https://github.com/SandrineCipolla/stockHub_V2_front
- **Démo live**: https://stock-hub-v2-front.vercel.app/
- **Tech**: React, TypeScript, Vite, TailwindCSS (versions exactes dans son `package.json`)

### Design System

- **Chemin local**: `C:\Users\sandr\Dev\RNCP7\stockhub_design_system`
- **URL GitHub**: https://github.com/SandrineCipolla/stockhub_design_system
- **Package**: `@stockhub/design-system` (version exacte dans son `package.json`)

### Wiki Global du Projet

- **URL**: https://github.com/SandrineCipolla/stockHub_V2_front/wiki
- **Hébergé sur** : repo frontend (couvre les 3 repos)
- **Pages clés** : Architecture Globale, Backend Guide, CICD et Déploiement, ADR, Qualité & Métriques
- **À mettre à jour** quand : nouveaux environnements, changements d'infra, pipeline CI/CD modifié

### GitHub Project

- **URL**: https://github.com/users/SandrineCipolla/projects/3
- **Utilisation**: Suivre et mettre à jour les tâches après chaque modification importante

## Scripts disponibles

```bash
# Développement
npm run start:dev        # Serveur dev avec hot reload
npm run start:prod       # Serveur de production

# Tests
npm run test:unit        # Tests unitaires
npm run test:integration # Tests d'intégration (TestContainers)
npm run test:e2e         # Tests E2E (Playwright)
npm run test:coverage    # Rapport de couverture

# Build & Database
npm run build            # Build TypeScript + Webpack
npm run migrate:test     # Migrations Prisma pour base de test

# Qualité
npm run lint             # ESLint 0 warnings
npm run format           # Prettier
npm run knip             # Détection code mort
```

Liste complète et à jour des scripts : `package.json`.

## Architecture DDD/CQRS

```
src/
  domain/               # Logique métier (entités, value objects, use cases)
    stock-management/
      manipulation/     # Command side (CQRS), use cases écriture
      visualization/    # Query side (CQRS), services lecture
    authorization/      # Entités famille, rôles
  infrastructure/       # Implémentations Prisma (repositories)
  api/                  # Controllers, routes, DTOs
  authentication/       # Azure AD B2C (Passport Bearer)
  authorization/        # Middleware autorisation stocks
  config/
  Utils/                # logger.ts, cloudLogger.ts
tests/
  domain/               # Tests unitaires domain layer
  integration/          # Tests avec TestContainers MySQL
  e2e/                  # Tests Playwright
```

**Règle absolue** : domain → infrastructure → api (jamais l'inverse)

## Standards critiques

- **TypeScript strict** : 0 erreur, éviter `as` (préférer type narrowing)
- **ESLint** : 0 warning (`--max-warnings 0`)
- **Logging** : jamais de `console.*`, utiliser `rootController`, `rootDatabase`, `rootSecurity`
- **Tests** : écrire tests pour chaque nouvelle feature
- **DI Pattern** : `prismaClient ?? new PrismaClient()` pour la testabilité

📖 **Guides détaillés** :

- Best practices code review → `docs/technical/CODE-REVIEW-BEST-PRACTICES.md`
- Système de logging → `docs/technical/LOGGER-GUIDE.md`
- Dependency Injection → `docs/technical/DEPENDENCY-INJECTION-BEST-PRACTICES.md`
- Tests E2E → `docs/technical/e2e-testing.md`
- Azure AD B2C → `docs/technical/azure-b2c-setup.md`
- Guide de rédaction (ADR et documentation) → `docs/technical/guide-redaction.md`

## Authentification & Autorisation

- **Auth** : Azure AD B2C, Passport Bearer Token, `authenticateMiddleware.ts`
- **Authz** : Rôles OWNER, EDITOR, VIEWER, VIEWER_CONTRIBUTOR. Permissions read/write/suggest
- **ADR** : `docs/adr/ADR-009-resource-based-authorization.md`

## Path Aliases TypeScript

```json
"@domain/*" | "@infrastructure/*" | "@api/*" | "@services/*"
"@authentication/*" | "@authorization/*" | "@utils/*" | "@config/*"
```

## ADR (Architecture Decision Records)

`docs/adr/`. Liste à jour dans `docs/adr/INDEX.md`.

Créer une ADR pour toute décision architecturale importante. Format et convention de nommage : `docs/adr/TEMPLATE.md`. Guide de rédaction : `docs/technical/guide-redaction.md`.

## Intégration Frontend

**Base URL** : `https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net/api/v2`
**Auth** : `Authorization: Bearer <access_token>`

Liste complète et à jour des endpoints : `docs/openapi.yaml` (Swagger `/api-docs`).

---

**Rappel critique** :

- Respecter l'architecture DDD/CQRS (domain → infrastructure → api)
- Utiliser Prisma pour tous les accès base de données
- Éviter `as` : préférer type narrowing ou type guards
- Process de contribution complet → [CONTRIBUTING.md](CONTRIBUTING.md)
