# StockHub V2 - Backend

API Node.js/Express avec architecture DDD/CQRS pour la gestion de stocks intelligente avec prédictions ML.

## Repositories du projet

### Backend (ce repo)

- **Chemin local**: `C:\Users\sandr\Dev\Perso\Projets\stockhub\stockhub_back`
- **URL GitHub**: https://github.com/SandrineCipolla/stockhub_back
- **Démo live**: https://stockhub-back.azurewebsites.net/
- **Description**: API REST StockHub avec architecture DDD/CQRS et authentification Azure AD B2C
- **Tech**: Node.js, Express 4.20.0, TypeScript 5.8.3, Prisma 6.16.0, MySQL, Azure AD B2C
- **Version**: v2.1.1

### Frontend

- **Chemin local**: `C:\Users\sandr\Dev\RNCP7\StockHubV2\Front_End\stockHub_V2_front`
- **URL GitHub**: https://github.com/SandrineCipolla/stockHub_V2_front
- **Démo live**: https://stock-hub-v2-front.vercel.app/
- **Description**: Application React StockHub V2 avec UI responsive et accessible
- **Tech**: React 19.1.0, TypeScript 5.8.3, Vite 6.3.5, TailwindCSS 3.4.1
- **Version**: v1.3.0

### Design System

- **Chemin local**: `C:\Users\sandr\Dev\RNCP7\stockhub_design_system`
- **URL GitHub**: https://github.com/SandrineCipolla/stockhub_design_system
- **Storybook**: https://68f5fbe10f495706cb168751-nufqfdjaoc.chromatic.com/
- **Package**: `@stockhub/design-system` v1.3.1
- **Composants**: 18 Web Components (5 atoms, 7 molecules, 6 organisms)

### GitHub Project

- **URL**: https://github.com/users/SandrineCipolla/projects/3
- **Utilisation**: Suivre et mettre à jour les tâches après chaque modification importante

## Conventions de code

### Scripts disponibles (Backend)

#### Développement

```bash
npm run start:dev        # Serveur de développement avec nodemon + hot reload
npm run start            # Serveur de production (dist/)
npm run start:prod       # Serveur de production avec dist/src/index.js
```

#### Tests

```bash
npm run test             # Tous les tests (unit + integration) avec TestContainers
npm run test:unit        # Tests unitaires uniquement
npm run test:integration # Tests d'intégration avec base de données test
npm run test:e2e         # Tests E2E avec Playwright + Azure AD B2C
npm run test:e2e:ui      # Tests E2E en mode UI
npm run test:e2e:headed  # Tests E2E en mode headless
npm run test:coverage    # Tests avec rapport de couverture
npm run test:ci          # Tests pour CI (sans TestContainers)
```

#### Build & Database

```bash
npm run build            # Build TypeScript + Webpack (avec Prisma generate)
npm run build:local      # Build TypeScript + alias resolution
npm run postinstall      # Génère automatiquement le Prisma Client
npm run migrate:test     # Migrations Prisma pour base de test
```

#### Qualité du code

```bash
npm run lint             # ESLint avec 0 warnings max
npm run lint:fix         # Correction automatique ESLint
npm run format           # Prettier (auto-formatting)
npm run format:check     # Vérifier formatage sans modifier
npm run knip             # Détection code mort
npm run knip:fix         # Suppression automatique code mort
```

## Git Hooks (Husky)

### Pre-commit (Rapide ~5-10s)

Exécuté automatiquement à chaque `git commit`:

- ✅ **git add -u**: Stage automatiquement tous les fichiers trackés modifiés
- ✅ **lint-staged**: Formatage Prettier + ESLint sur fichiers stagés
- ✅ **TypeScript**: Vérification des types (`tsc --noEmit`)

### Pre-push (Complet ~30-60s)

Exécuté automatiquement à chaque `git push`:

- ✅ **format:check**: Vérification formatage Prettier
- ✅ **lint**: ESLint avec 0 warnings
- ✅ **knip**: Détection code mort
- ✅ **test:unit**: Tous les tests unitaires (142 tests)

### Commit-msg

- ✅ **commitlint**: Vérifie les Conventional Commits

### Bypass des hooks (si urgence)

```bash
git commit --no-verify -m "message"  # Skip pre-commit
git push --no-verify                 # Skip pre-push
```

## Standards de développement

### Stack technique

- **Node.js** + **Express 4.20.0**
- **TypeScript 5.8.3** (mode strict)
- **Prisma 6.16.0** (ORM)
- **MySQL 8.0** (Azure Database for MySQL)
- **Azure AD B2C** (authentification)
- **Passport.js** (stratégie Bearer Token)
- **Jest 29.7.0** (tests unitaires)
- **Playwright 1.57.0** (tests E2E)
- **TestContainers** (tests d'intégration avec base MySQL)
- **Webpack 5.96.1** (bundling pour production)

### Architecture du code (DDD/CQRS)

```
src/
  domain/                       # Couche Domain (logique métier)
    stock-management/
      common/
        entities/               # Entités (Stock, StockItem)
        value-objects/          # Value Objects (Quantity, StockLabel, StockDescription)
      manipulation/             # Command side (CQRS)
        command-handlers/       # Use Cases (CreateStock, AddItem, UpdateQuantity)
        commands/               # DTOs de commandes
        repositories/           # Interfaces de repositories (écriture)
      visualization/            # Query side (CQRS)
        services/               # Services de lecture
        queries/                # Interfaces de repositories (lecture)
        models/                 # DTOs de lecture (StockSummary, StockWithoutItems)
    authorization/
      common/
        entities/               # Family entity
        value-objects/          # StockRole, FamilyRole

  infrastructure/               # Couche Infrastructure
    stock-management/
      manipulation/
        repositories/           # Implémentations Prisma (écriture)
      visualization/
        repositories/           # Implémentations Prisma (lecture)

  api/                          # Couche API (interface HTTP)
    controllers/                # Controllers (Manipulation, Visualization)
    routes/                     # Routes Express (V1, V2)
    dto/                        # DTOs et Mappers
    types/                      # Types de requêtes

  authentication/               # Authentification Azure AD B2C
    authBearerStrategy.ts       # Stratégie Passport Bearer
    authenticateMiddleware.ts   # Middleware d'authentification

  authorization/                # Autorisation (Phase 1 - ressources)
    authorizeMiddleware.ts      # Middleware d'autorisation stock

  config/                       # Configuration
  services/                     # Services (UserService, etc.)
  Utils/                        # Utilitaires (logger, cloudLogger)

tests/
  domain/                       # Tests unitaires domain layer
  api/                          # Tests unitaires API layer
  unit/                         # Tests unitaires anciens (à migrer)
  integration/                  # Tests d'intégration avec TestContainers
  e2e/                          # Tests E2E avec Playwright
  helpers/                      # Helpers de tests (testContainerSetup)
```

### Qualité du code

- **TypeScript**: Mode strict, 0 erreur tolérée
- **ESLint**: 0 warning toléré (--max-warnings 0)
- **Prettier**: Formatage automatique avec `endOfLine: "lf"`
- **Knip**: Détection code mort activée
- **Tests**:
  - Unit: 142 tests ✅
  - Integration: 18 tests ✅
  - E2E: 4 tests ✅
- **TestContainers**: Base MySQL isolée pour tests d'intégration
- **Line endings**: LF forcé via `.gitattributes`

### Base de données

- **ORM**: Prisma 6.16.0
- **Database**: MySQL 8.0 (Azure Database for MySQL)
- **Migrations**: `prisma migrate dev`
- **Seed**: Scripts SQL dans `sql/` (`initialize_database.sql`, `seed_demo.sql`)
- **Mapping**: TypeScript (camelCase) ↔ MySQL (UPPERCASE) via `@map` et `@@map`

**Exemple de mapping**:

```prisma
model users {
  ID    Int    @id @default(autoincrement())
  EMAIL String @unique @db.VarChar(255)

  @@map("USERS")
}
```

### Authentification & Autorisation

**Azure AD B2C** (authentification):

- Stratégie Passport Bearer Token
- Middleware: `authenticateMiddleware.ts`
- Configuration: `src/config/authenticationConfig.ts`
- Variables d'environnement: `.env` (voir `docs/AZURE_B2C_ROPC_SETUP.md`)

**Autorisation Phase 1** (ressources):

- Middleware: `authorizeMiddleware.ts`
- Rôles Stock: OWNER, EDITOR, VIEWER, VIEWER_CONTRIBUTOR
- Permissions: read, write, suggest
- Pattern: Dependency Injection avec fallback `prismaClient ?? new PrismaClient()`
- Documentation: `docs/adr/ADR-009-resource-based-authorization.md`

## Workflow de développement

### Avant de commencer une feature

1. Vérifier le GitHub Project pour les tâches assignées
2. Créer une branche depuis `main` avec format: `feat-issue-XX-description`
3. S'assurer que les dépendances sont à jour: `npm install`

### Pendant le développement

1. Lancer le serveur dev: `npm run start:dev`
2. Respecter l'architecture DDD/CQRS
3. Créer les tests unitaires dans `tests/domain/` ou `tests/api/`
4. Utiliser Prisma pour les accès base de données
5. Suivre le pattern Repository (interfaces dans domain, implémentations dans infrastructure)
6. Documenter les décisions architecturales dans `docs/adr/`

### Tests

**Tests unitaires** (domain + API):

```bash
npm run test:unit
```

- Tester les Value Objects, Entities, Command Handlers
- Mocker les dépendances (repositories, services)
- Structure: `describe` générique → `describe` méthode → `describe` cas → `it` cas précis

**Tests d'intégration** (avec TestContainers):

```bash
npm run test:integration
```

- Utilise une vraie base MySQL via TestContainers
- Tester les repositories Prisma
- Tester les middlewares avec injection de PrismaClient test

**Tests E2E** (avec Playwright):

```bash
npm run test:e2e
npm run test:e2e:ui    # Mode UI
```

- Utilise Azure AD B2C ROPC (Resource Owner Password Credentials)
- Tester les flows complets (authentification + API)
- Nommer les tests: "Step 1:", "Step 2:", etc.

### Après chaque session de développement

**IMPORTANT**: Mettre à jour la documentation suivante:

1. **ROADMAP.md**: Marquer les issues complétées
2. **ADR** (Architecture Decision Records): Documenter les décisions architecturales
3. **Tests**: Ajouter tests pour nouvelles features
4. **GitHub Project**: Mettre à jour le statut des tâches
5. **CHANGELOG**: Automatique via Release Please

### Avant de pusher

```bash
npm run lint             # Vérifications ESLint
npm run format:check     # Vérifier formatage
npm run test:unit        # Tests unitaires
npm run build            # S'assurer que le build fonctionne
```

Les hooks pre-push feront ces vérifications automatiquement.

## Conventions de Branches & Commits

### Stratégie de Branches

**Format**: `<type>-issue-<num>-<description-kebab-case>`

**Exemples**:

- `feat-issue-62-authorization-phase1`
- `fix-issue-71-middleware-di`
- `docs-issue-46-adrs`

**Règle importante**: **Une branche = Une issue**

### Commits (Conventional Commits)

**Format**: `type(scope): message`

**Types**: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`, `style`

**Exemples**:

```bash
feat(authorization): Phase 1 - domain layer and middleware (Issue #62)
fix(authorization): enable PrismaClient injection in middleware (Issue #71)
test(authorization): add unit tests for domain layer (142 tests)
docs(adr): add ADR-009 for resource-based authorization
chore: add .gitattributes to enforce LF line endings
```

**Commitlint**: Hook pre-commit vérifie automatiquement le format.

### Pull Requests

**Format du titre**: `type: (issue XX) description`

**Exemples**:

- `feat: (issue 62) authorization phase1`
- `fix: (issue 71) middleware dependency injection for testability`

**Template**: Utiliser `.github/PULL_REQUEST_TEMPLATE.md` et le remplir complètement.

## Releases Automatiques (Release Please)

**Configuration**: `.github/workflows/release-please.yml`

### Comment ça fonctionne

1. Développement normal avec Conventional Commits
2. Merge dans `main` → Release Please crée/met à jour une PR de release
3. La PR contient: CHANGELOG.md généré + version bumpée
4. Merge de la PR de release → Tag Git + GitHub Release créés

### Versioning Sémantique

| Type de Commit                 | Exemple                               | Version Bump              |
| ------------------------------ | ------------------------------------- | ------------------------- |
| `feat:`                        | `feat(api): add new endpoint`         | 2.1.0 → **2.2.0** (MINOR) |
| `fix:`                         | `fix(auth): correct token validation` | 2.1.0 → **2.1.1** (PATCH) |
| `feat!:` ou `BREAKING CHANGE:` | `feat(api)!: change response format`  | 2.1.0 → **3.0.0** (MAJOR) |

## Architecture Decision Records (ADR)

**Localisation**: `docs/adr/`

**Index**: `docs/adr/INDEX.md`

**Template**: `docs/adr/TEMPLATE.md`

**ADRs actuels**:

- ADR-001: Migration DDD/CQRS
- ADR-002: Choix Prisma ORM
- ADR-003: Azure AD B2C Authentication
- ADR-004: Tests Value Objects & Entities
- ADR-005: API Versioning V2
- ADR-006: MySQL Azure Cloud
- ADR-007: Code Quality Enforcement
- ADR-008: TypeScript Request Type Aliases
- ADR-009: Resource-Based Authorization (Phase 1)
- ADR-010: CI/CD Pipeline Optimization

**Quand créer un ADR**:

- Décision architecturale importante
- Choix technologique majeur
- Pattern ou convention imposée
- Résolution de problème technique complexe

## Path Aliases TypeScript

Configuration dans `tsconfig.json`:

```json
{
  "paths": {
    "@domain/*": ["src/domain/*"],
    "@infrastructure/*": ["src/infrastructure/*"],
    "@api/*": ["src/api/*"],
    "@services/*": ["src/services/*"],
    "@authentication/*": ["src/authentication/*"],
    "@authorization/*": ["src/authorization/*"],
    "@utils/*": ["src/Utils/*"],
    "@config/*": ["src/config/*"],
    "@helpers/*": ["tests/helpers/*"]
  }
}
```

**Résolution** pour runtime: `tsc-alias` (build) et `tsconfig-paths` (dev).

## Dependency Injection Best Practices

**Pattern recommandé**: Injection optionnelle avec fallback

```typescript
// ✅ BON : Permet injection en tests, fallback en production
export function middleware(prismaClient?: PrismaClient) {
  const prisma = prismaClient ?? new PrismaClient();
  // ...
}

// ❌ MAUVAIS : Hardcodé, impossible à tester
const prisma = new PrismaClient();
export function middleware() {
  // Utilise toujours la même instance
}
```

**Documentation complète**: `docs/architecture/DEPENDENCY-INJECTION-BEST-PRACTICES.md`

## Naming conventions

### Fichiers & Dossiers

- Composants/Classes: `PascalCase` (ex: `StockVisualizationService.ts`)
- Fonctions utilitaires: `camelCase` (ex: `logger.ts`)
- Tests: `*.test.ts` (ex: `StockRole.test.ts`)
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

### Code

- Classes: `PascalCase` (ex: `StockRole`, `CreateStockCommandHandler`)
- Interfaces: `PascalCase` avec préfixe `I` (ex: `IStockCommandRepository`)
- Types: `PascalCase` (ex: `RequiredPermission`, `AuthorizedRequest`)
- Fonctions & variables: `camelCase` (ex: `authorizeStockAccess`, `userService`)
- Constantes: `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`)

### Tests

- Structure: 4 niveaux de `describe` + `it`
  1. Generic describe (composant/classe)
  2. Method describe (méthode testée)
  3. Case describe (scénario)
  4. Specific it (cas précis)

**Exemple**:

```typescript
describe('StockRole', () => {
  describe('canWrite()', () => {
    describe('when the role is OWNER', () => {
      it('should return true', () => {
        // test
      });
    });
  });
});
```

## Intégration avec le Frontend

### API Endpoints (V2)

**Base URL**: `https://stockhub-back.azurewebsites.net/api/v2`

**Authentification**: Bearer Token (Azure AD B2C)

**Headers requis**:

```
Authorization: Bearer <access_token>
```

**Endpoints principaux**:

- `GET /stocks` - Liste des stocks de l'utilisateur
- `GET /stocks/:stockId` - Détails d'un stock (avec autorisation)
- `GET /stocks/:stockId/items` - Items d'un stock (avec autorisation)
- `POST /stocks` - Créer un stock
- `POST /stocks/:stockId/items` - Ajouter un item (avec autorisation write)
- `PATCH /stocks/:stockId/items/:itemId` - Modifier quantité (avec autorisation write)

**Swagger/OpenAPI**: `docs/openapi.yaml`

### Format de données

Voir DTOs dans `src/api/dto/` et mappers dans `src/api/dto/mappers/`.

## Notes importantes

- **Version actuelle**: v2.1.1
- **Auteur**: Sandrine Cipolla
- **License**: ISC
- **Node version**: >= 18.0.0
- **Tests**: 164 tests (142 unit + 18 integration + 4 E2E)
- **Database**: MySQL 8.0 (Azure)
- **Authentication**: Azure AD B2C
- **Architecture**: DDD/CQRS

## Ressources & Liens utiles

### Documentation

- **Node.js**: https://nodejs.org/docs/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Express**: https://expressjs.com/
- **Prisma**: https://www.prisma.io/docs
- **Jest**: https://jestjs.io/docs/getting-started
- **Playwright**: https://playwright.dev/
- **TestContainers**: https://node.testcontainers.org/
- **Azure AD B2C**: https://learn.microsoft.com/en-us/azure/active-directory-b2c/

### Documentation interne

- `docs/adr/` - Architecture Decision Records
- `docs/architecture/` - Guides architecturaux
- `docs/E2E_TESTS_GUIDE.md` - Guide tests E2E
- `docs/AZURE_B2C_ROPC_SETUP.md` - Setup Azure AD B2C
- `ROADMAP.md` - Feuille de route du projet

## 🚨 Checklist avant chaque commit

1. ✅ Tous les fichiers modifiés sont automatiquement stagés (`git add -u` dans pre-commit)
2. ✅ `npm run format` - Code formaté (automatique via lint-staged)
3. ✅ `npm run lint` - Aucune erreur ESLint (automatique via lint-staged)
4. ✅ `tsc --noEmit` - Aucune erreur TypeScript (automatique via pre-commit)
5. ✅ Tests appropriés écrits (unit/integration/E2E)
6. ✅ Conventional Commit respecté (vérifié par commitlint)

## 🚨 Checklist avant chaque push

1. ✅ `npm run format:check` - Tous les fichiers formatés (automatique via pre-push)
2. ✅ `npm run lint` - 0 warnings (automatique via pre-push)
3. ✅ `npm run knip` - Pas de code mort (automatique via pre-push)
4. ✅ `npm run test:unit` - Tous les tests passent (automatique via pre-push)
5. ✅ ADR créé si décision architecturale importante
6. ✅ ROADMAP.md mis à jour si issue complétée
7. ✅ GitHub Project mis à jour

---

**🎯 Rappel CRITIQUE**:

- Toujours respecter l'architecture DDD/CQRS (domain → infrastructure → api)
- Utiliser Prisma pour tous les accès base de données
- Documenter les décisions architecturales dans des ADRs
- Écrire des tests pour chaque nouvelle fonctionnalité
- Pattern Dependency Injection avec fallback pour la testabilité
- Les hooks pre-commit et pre-push automatisent les vérifications
