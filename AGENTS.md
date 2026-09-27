# AGENTS.md - StockHub V2 Backend

API Node.js/Express avec architecture DDD/CQRS pour la gestion de stocks intelligente avec prédictions ML.

Process de contribution (branches, commits, PR, workflow par ticket, gestion des issues GitHub) voir [CONTRIBUTING.md](CONTRIBUTING.md).

Règles pour tout agent IA travaillant sur ce repo (Claude Code, Cursor, etc.). `CLAUDE.md` importe ce fichier.

<!-- commun:debut repositories v1 -->
<!-- Bloc commun aux trois repos StockHub : le modifier à l'identique dans les trois, en incrémentant la version. Vérifié par check-docs. -->

## Repositories du projet StockHub

| Repo          | GitHub                                                    | Branche principale | Chemin local (poste de Sandrine)                                  |
| ------------- | --------------------------------------------------------- | ------------------ | ----------------------------------------------------------------- |
| Frontend      | https://github.com/SandrineCipolla/stockHub_V2_front      | `main`             | `C:\Users\sandr\Dev\RNCP7\StockHubV2\Front_End\stockHub_V2_front` |
| Backend       | https://github.com/SandrineCipolla/stockhub_back          | `main`             | `C:\Users\sandr\Dev\Perso\Projets\stockhub\stockhub_back`         |
| Design System | https://github.com/SandrineCipolla/stockhub_design_system | `master`           | `C:\Users\sandr\Dev\RNCP7\stockhub_design_system`                 |

### Environnements

| Env        | Frontend                                                                                                 | Backend                                                                                             | Base de données             |
| ---------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------- |
| Local      | `localhost:5173`                                                                                         | `localhost:3006` (Docker)                                                                           | MySQL Docker, port 3308     |
| Staging    | Vercel, branche `staging` : https://stock-hub-v2-front-git-staging-sandrinecipollas-projects.vercel.app/ | Render.com, suit `main` : https://stockhub-back.onrender.com/api                                    | Aiven MySQL                 |
| Production | Azure Static Web Apps, branche `main` : https://brave-field-03611eb03.5.azurestaticapps.net              | Azure App Service, plan F1 : https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net | Azure MySQL Flexible Server |

- Répartition des hébergeurs : [ADR-013 du frontend](https://github.com/SandrineCipolla/stockHub_V2_front/blob/main/docs/adr/ADR-013-production-azure-previews-vercel.md). Le staging est en réparation (frontend #314).
- Le plan F1 d'Azure App Service a un quota CPU journalier : `npm run azure:start` avant de tester en production, `npm run azure:stop` après (repo backend).
- Design System : Storybook sur https://68f5fbe10f495706cb168751-nufqfdjaoc.chromatic.com/, package `@stockhub/design-system` installé depuis GitHub (version dans le `package.json` du frontend).

### Suivi

- GitHub Project commun aux trois repos : https://github.com/users/SandrineCipolla/projects/3, à mettre à jour après chaque modification importante.
- Wiki transverse : https://github.com/SandrineCipolla/stockHub_V2_front/wiki

<!-- commun:fin repositories -->

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

- Best practices code review → `docs/technical/code-review-best-practices.md`
- Système de logging → `docs/technical/logger-guide.md`
- Dependency Injection → `docs/technical/dependency-injection-best-practices.md`
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

Créer un ADR pour toute décision architecturale importante. Format et convention de nommage : `docs/adr/TEMPLATE.md`. Guide de rédaction : `docs/technical/guide-redaction.md`.

## Intégration Frontend

**Base URL** : URL du backend de l'environnement visé (section Environnements ci-dessus), suivie de `/api/v2`
**Auth** : `Authorization: Bearer <access_token>`

Liste complète et à jour des endpoints : `docs/openapi.yaml` (Swagger `/api-docs`).

---

**Rappel critique** :

- Respecter l'architecture DDD/CQRS (domain → infrastructure → api)
- Utiliser Prisma pour tous les accès base de données
- Éviter `as` : préférer type narrowing ou type guards
- Process de contribution complet → [CONTRIBUTING.md](CONTRIBUTING.md)
