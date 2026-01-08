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
  - ⚠️ **IMPORTANT**: Éviter l'utilisation de `as` (type assertion) sauf si vraiment impossible autrement
  - Préférer le type narrowing, les type guards, ou refactorer pour avoir un typage correct
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

1. **Session documentée** : Créer `docs/sessions/YYYY-MM-DD-description.md` (voir `docs/7-SESSIONS.md` pour template)
2. **ROADMAP.md**: Marquer les issues complétées
3. **ADR** (Architecture Decision Records): Documenter les décisions architecturales
4. **Tests**: Ajouter tests pour nouvelles features
5. **GitHub Project**: Mettre à jour le statut des tâches
6. **CHANGELOG**: Automatique via Release Please

**Checklist documentation session** :

- [ ] Fichier session créé dans `docs/sessions/` avec format `YYYY-MM-DD-description.md`
- [ ] Objectifs, réalisations, et décisions techniques documentés
- [ ] `docs/7-SESSIONS.md` mis à jour avec entrée pour la session
- [ ] Commits référencés, issues/PRs liées mentionnées

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

## Best Practices from Code Reviews

Cette section compile les meilleures pratiques identifiées lors des code reviews pour maintenir une qualité de code élevée.

### 1. Repository Pattern - Encapsuler l'accès aux données

**Principe**: Isoler les requêtes base de données dans des repositories dédiés.

❌ **À éviter**:

```typescript
// Dans un middleware
const user = await prisma.users.findUnique({
  where: { EMAIL: email },
});
```

✅ **Recommandé**:

```typescript
// AuthorizationRepository.ts
export class AuthorizationRepository {
  constructor(private prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.users.findUnique({
      where: { EMAIL: email },
    });
  }
}

// Dans le middleware
const user = await authRepository.findUserByEmail(email);
```

**Avantages**: Testabilité, réutilisabilité, séparation des responsabilités.

---

### 2. Typed Errors - Éviter les Error génériques

**Principe**: Créer des classes d'erreurs typées pour faciliter le debugging et le handling.

❌ **À éviter**:

```typescript
throw new Error('Family name is required');
throw new Error('Family must have at least one admin');
```

✅ **Recommandé**:

```typescript
// errors/FamilyErrors.ts
export class FamilyNameRequiredError extends Error {
  constructor() {
    super('Family name is required');
    this.name = 'FamilyNameRequiredError';
  }
}

export class NoAdminError extends Error {
  constructor() {
    super('Family must have at least one admin');
    this.name = 'NoAdminError';
  }
}

// Utilisation
throw new FamilyNameRequiredError();
throw new NoAdminError();
```

**Avantages**: Type safety, error handling précis, meilleur debugging.

---

### 3. Constants - Utiliser des constantes pour les valeurs magiques

**Principe**: Extraire les valeurs hardcodées dans des constantes nommées.

❌ **À éviter**:

```typescript
if (permission === 'read') {
  /* ... */
}
if (permission === 'write') {
  /* ... */
}
```

✅ **Recommandé**:

```typescript
// constants/permissions.ts
export const PERMISSIONS = {
  READ: 'read' as const,
  WRITE: 'write' as const,
  SUGGEST: 'suggest' as const,
} as const;

export const ROUTES = {
  STOCKS_LIST: '/stocks',
  STOCK_DETAIL: '/stocks/:stockId',
} as const;

// Utilisation
if (permission === PERMISSIONS.READ) {
  /* ... */
}
```

**Avantages**: Maintenabilité, refactoring sûr, autocomplete.

---

### 4. Logic in Value Objects - Déplacer la logique métier dans les Value Objects

**Principe**: Les Value Objects doivent contenir leur propre logique de validation et comportement.

❌ **À éviter**:

```typescript
// Dans le middleware
switch (stockRole.role) {
  case StockRoleEnum.OWNER:
  case StockRoleEnum.EDITOR:
    return true;
  case StockRoleEnum.VIEWER_CONTRIBUTOR:
    return requiredPermission === 'suggest';
  default:
    return false;
}
```

✅ **Recommandé**:

```typescript
// StockRole.ts (Value Object)
export class StockRole {
  constructor(private role: StockRoleEnum) {}

  hasRequiredPermission(permission: RequiredPermission): boolean {
    switch (this.role) {
      case StockRoleEnum.OWNER:
      case StockRoleEnum.EDITOR:
        return true;
      case StockRoleEnum.VIEWER_CONTRIBUTOR:
        return permission === 'suggest';
      default:
        return false;
    }
  }
}

// Dans le middleware
if (!stockRole.hasRequiredPermission(requiredPermission)) {
  return res.status(403).json({ error: 'Insufficient permissions' });
}
```

**Avantages**: Cohésion, testabilité, réutilisabilité.

---

### 5. Factory Methods - Créer des helpers pour les objets complexes

**Principe**: Utiliser des factory methods pour éviter la duplication de code de création d'objets.

❌ **À éviter**:

```typescript
const family = new Family({
  name: params.name,
  members: [
    {
      id: 0,
      userId: params.creatorUserId,
      role: FamilyRoleEnum.ADMIN,
      joinedAt: new Date(),
    },
  ],
});
```

✅ **Recommandé**:

```typescript
// Dans Family.ts
private static createAdminMember(userId: number): FamilyMemberData {
  return {
    id: 0,
    userId,
    role: FamilyRoleEnum.ADMIN,
    joinedAt: new Date(),
  };
}

// Utilisation
const family = new Family({
  name: params.name,
  members: [Family.createAdminMember(params.creatorUserId)],
});
```

**Avantages**: DRY, moins de duplication, évolution centralisée.

---

### 6. Reuse Existing Methods - Réutiliser les méthodes existantes

**Principe**: Éviter de réimplémenter une logique qui existe déjà dans une méthode.

❌ **À éviter**:

```typescript
removeMember(userId: number): void {
  const index = this.members.findIndex(m => m.userId === userId);
  if (index === -1) {
    throw new Error('Member not found');
  }
  this.members.splice(index, 1);
}
```

✅ **Recommandé**:

```typescript
removeMember(userId: number): void {
  const member = this.getMember(userId); // Réutilise la méthode existante
  if (!member) {
    throw new MemberNotFoundError(userId);
  }
  const index = this.members.indexOf(member);
  this.members.splice(index, 1);
}
```

**Avantages**: DRY, maintenance simplifiée, cohérence.

---

### 7. Extract Complex Logic - Extraire la logique complexe dans des méthodes dédiées

**Principe**: Déplacer les vérifications complexes dans des méthodes privées bien nommées.

❌ **À éviter**:

```typescript
removeMember(userId: number): void {
  // ...
  if (this.members.filter(m => m.role === FamilyRoleEnum.ADMIN).length === 0) {
    throw new Error('Family must have at least one admin');
  }
}
```

✅ **Recommandé**:

```typescript
private hasAdmin(): boolean {
  return this.members.some(m => m.role === FamilyRoleEnum.ADMIN);
}

removeMember(userId: number): void {
  // ...
  if (!this.hasAdmin()) {
    throw new NoAdminError();
  }
}
```

**Avantages**: Lisibilité, testabilité, intention claire.

---

### 8. Null Object Pattern - Retourner des objets vides au lieu de undefined

**Principe**: Éviter les `undefined` en retournant des objets neutres (Null Object Pattern).

❌ **À éviter**:

```typescript
getMember(userId: number): FamilyMemberData | undefined {
  return this.members.find(m => m.userId === userId);
}

// Usage problématique
const member = family.getMember(123);
if (member) { // Vérification nécessaire partout
  // ...
}
```

✅ **Recommandé (si applicable)**:

```typescript
// NullMember.ts
export const NULL_MEMBER: FamilyMemberData = {
  id: -1,
  userId: -1,
  role: FamilyRoleEnum.VIEWER,
  joinedAt: new Date(0),
};

getMember(userId: number): FamilyMemberData {
  return this.members.find(m => m.userId === userId) ?? NULL_MEMBER;
}
```

**Note**: Utiliser avec précaution. Parfois `undefined` est plus explicite.

---

### 9. Methods on Business Objects - Ajouter des méthodes sur les objets métier

**Principe**: Les objets métier doivent encapsuler leurs propres comportements.

❌ **À éviter**:

```typescript
// Vérification externe
const isAdmin = member.role === FamilyRoleEnum.ADMIN;
```

✅ **Recommandé**:

```typescript
// FamilyMember.ts
export class FamilyMember {
  constructor(private data: FamilyMemberData) {}

  isAdmin(): boolean {
    return this.data.role === FamilyRoleEnum.ADMIN;
  }

  canManageMembers(): boolean {
    return this.isAdmin();
  }
}

// Utilisation
if (member.isAdmin()) {
  /* ... */
}
```

**Avantages**: Encapsulation, cohésion, expressivité.

---

### 10. File Organization - Séparer les enums dans des fichiers dédiés

**Principe**: Les enums doivent être dans des fichiers séparés pour faciliter leur réutilisation.

❌ **À éviter**:

```typescript
// StockRole.ts
export enum StockRoleEnum {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export class StockRole {
  // ...
}
```

✅ **Recommandé**:

```typescript
// StockRoleEnum.ts
export enum StockRoleEnum {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

// StockRole.ts
import { StockRoleEnum } from './StockRoleEnum';

export class StockRole {
  // ...
}
```

**Avantages**: Réutilisabilité, imports clairs, séparation des responsabilités.

---

### 11. Split Large Test Files - Diviser les fichiers de tests volumineux

**Principe**: Les fichiers de tests de plus de 500 lignes doivent être divisés.

❌ **À éviter**:

```
Family.test.ts (1200 lignes)
  - create()
  - addMember()
  - removeMember()
  - getMember()
  - etc.
```

✅ **Recommandé**:

```
Family.create.test.ts
Family.addMember.test.ts
Family.removeMember.test.ts
Family.getMember.test.ts
```

**Avantages**: Lisibilité, maintenance, navigation facile, parallélisation.

---

### 12. Input Validation - Valider les entrées avec des messages clairs

**Principe**: Toujours valider les inputs avec des messages d'erreur explicites.

✅ **Déjà bien fait** (exemple à suivre):

```typescript
export class StockRole {
  constructor(role: string) {
    if (!Object.values(StockRoleEnum).includes(role as StockRoleEnum)) {
      throw new InvalidStockRoleError(`Invalid role: ${role}`);
    }
    this.role = role as StockRoleEnum;
  }
}
```

**Avantages**: Fail-fast, debugging facile, error messages utiles.

---

### Checklist Best Practices

Avant chaque PR, vérifier:

- [ ] **Repository Pattern**: Tous les accès DB sont dans des repositories
- [ ] **Typed Errors**: Pas de `throw new Error()` générique
- [ ] **Constants**: Pas de strings/numbers hardcodés
- [ ] **Logic in VOs**: La logique métier est dans les Value Objects
- [ ] **Factory Methods**: Pas de duplication dans la création d'objets
- [ ] **Reuse Methods**: Pas de réimplémentation de logique existante
- [ ] **Extract Logic**: Pas de logique complexe inline
- [ ] **Null Object**: Utilisation appropriée (si applicable)
- [ ] **Methods on Objects**: Comportements encapsulés dans les objets
- [ ] **File Organization**: Enums dans des fichiers séparés
- [ ] **Test Files**: Fichiers de tests < 500 lignes
- [ ] **Input Validation**: Toutes les entrées sont validées
- [ ] **Logging**: Pas de `console.*`, utilisation de `rootController`, `rootDatabase`, etc.
- [ ] **Security**: Pas de credentials, tokens, ou infos sensibles dans les logs

---

## Logging System

Le projet utilise un système de logging structuré à deux niveaux : `logger.ts` (logs locaux) et `cloudLogger.ts` (monitoring cloud Azure Application Insights).

### Architecture du Logging

```
src/Utils/
  ├── logger.ts        # Système de logging local (typescript-logging)
  └── cloudLogger.ts   # Intégration Azure Application Insights
```

**Principe**: Tous les logs doivent passer par le système `logger.ts`, qui sont automatiquement capturés par `cloudLogger.ts` pour monitoring en production.

---

### 1. Logger Local (`logger.ts`)

**Bibliothèque**: `typescript-logging-category-style`

**Structure hiérarchique**:

```typescript
import { rootController, rootDatabase, rootSecurity, rootUtils } from '@utils/logger';

// Catégories principales
rootController; // Pour les controllers et routes
rootDatabase; // Pour les repositories
rootSecurity; // Pour l'authentification/autorisation
rootUtils; // Pour les utilitaires

// Sous-catégories (child categories)
const rootConfigureStockRoutes = rootController.getChildCategory('configureStockRoutes');
const rootStockRepository = rootDatabase.getChildCategory('stockRepository');
```

**Méthodes disponibles**:

```typescript
rootController.info('Message informatif', data);      // Niveau INFO
rootController.error('Message d'erreur', error);      // Niveau ERROR
rootController.warn('Message d'avertissement');       // Niveau WARN
rootController.debug('Message de debug', metadata);   // Niveau DEBUG
```

---

### 2. Cloud Logger (`cloudLogger.ts`)

**Intégration**: Azure Application Insights

**Configuration automatique**:

```typescript
appInsights
  .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoCollectConsole(true) // ⚠️ Capture automatique des logs console
  .setAutoCollectRequests(true)
  .setAutoCollectExceptions(true)
  .start();
```

**Fonctions disponibles**:

```typescript
import { rootCloudEvent, rootDependency, rootException } from '@utils/cloudLogger';

// Tracker un événement métier
rootCloudEvent('StockCreated', { stockId: 123, category: 'alimentation' });

// Tracker une dépendance externe (API, DB)
rootDependency({
  target: 'MySQL',
  name: 'findStockById',
  data: 'SELECT * FROM STOCKS WHERE ID = ?',
  duration: 45,
  resultCode: 200,
  success: true,
  dependencyTypeName: 'SQL',
});

// Tracker une exception
rootException(new Error('Database connection failed'));
```

---

### 3. Bonnes Pratiques de Logging

#### ❌ À ÉVITER - Utilisation de console.\*

```typescript
// ❌ MAUVAIS: Pas de structure, pas de contexte, pas de monitoring cloud
console.log('Stock créé:', stock);
console.error('Erreur lors de la création:', error);
console.info('Nouvelle quantité:', quantity);
console.warn('Stock faible:', stockId);
```

**Problèmes**:

- Pas de catégorisation
- Pas de niveau de log (tout est au même niveau dans la console)
- Pas de métadonnées (timestamp, hostname, etc.)
- Difficile à filtrer en production
- Peut exposer des informations sensibles sans contrôle

---

#### ✅ RECOMMANDÉ - Utilisation du logger structuré

**Dans les routes/controllers**:

```typescript
import { rootController } from '@utils/logger';

router.get('/stocks', async (req, res) => {
  try {
    await stockController.getAllStocks(req, res);
  } catch (error) {
    rootController.error('Error in GET /stocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Dans les repositories**:

```typescript
import { rootDatabase } from '@utils/logger';

export class PrismaStockRepository {
  private logger = rootDatabase.getChildCategory('stockRepository');

  async findById(id: number): Promise<Stock | null> {
    try {
      this.logger.info('Finding stock by ID: {id}', id);
      const stock = await this.prisma.stocks.findUnique({ where: { ID: id } });
      return stock;
    } catch (error) {
      this.logger.error('Error finding stock by ID: {id}', id, error);
      throw error;
    }
  }
}
```

**Dans les services**:

```typescript
import { rootSecurity } from '@utils/logger';

export class AuthService {
  private logger = rootSecurity.getChildCategory('authService');

  async validateToken(token: string): Promise<boolean> {
    this.logger.debug('Validating token...');
    try {
      // Validation logic
      this.logger.info('Token validated successfully');
      return true;
    } catch (error) {
      this.logger.error('Token validation failed:', error);
      return false;
    }
  }
}
```

---

### 4. Catégories de Logs Disponibles

| Catégorie            | Import                              | Usage                                 |
| -------------------- | ----------------------------------- | ------------------------------------- |
| `rootMain`           | `import { rootMain }`               | Logs généraux de l'application        |
| `rootController`     | `import { rootController }`         | Controllers et routes                 |
| `rootDatabase`       | `import { rootDatabase }`           | Repositories et accès base de données |
| `rootSecurity`       | `import { rootSecurity }`           | Authentification et autorisation      |
| `rootUtils`          | `import { rootUtils }`              | Utilitaires et helpers                |
| `rootServerSetup`    | `import { rootServerSetup }`        | Configuration serveur                 |
| `rootUserService`    | `import { rootUserService }`        | Service utilisateur                   |
| `rootReadUserRepo`   | `import { rootReadUserRepository }` | Repository lecture utilisateur        |
| `rootWriteStockRepo` | `import { rootWriteStockRepo }`     | Repository écriture stock             |
| `rootSecurityAuthMW` | `import { rootSecurityAuthMW }`     | Middleware authentification           |

**Créer des sous-catégories**:

```typescript
import { rootController } from '@utils/logger';

// Créer une sous-catégorie spécifique
const routerLogger = rootController.getChildCategory('stockRoutes');
const methodLogger = routerLogger.getChildCategory('getAllStocks');

methodLogger.info('Fetching all stocks for user: {userId}', userId);
```

---

### 5. Niveaux de Log

| Niveau  | Quand l'utiliser                                          | Exemple                                          |
| ------- | --------------------------------------------------------- | ------------------------------------------------ |
| `debug` | Debugging détaillé (désactivé en production par défaut)   | Variables internes, flow d'exécution             |
| `info`  | Informations opérationnelles normales                     | Requête traitée, stock créé, connexion réussie   |
| `warn`  | Situation anormale mais non bloquante                     | Stock faible, token proche expiration            |
| `error` | Erreur nécessitant attention (exception, échec opération) | Base de données inaccessible, validation échouée |

**Configuration du niveau** (dans `logger.ts`):

```typescript
const provider = CategoryProvider.createProvider('ExampleProvider', {
  level: LogLevel.Info, // En production: Info (pas de debug)
});
```

---

### 6. Sécurité et Logs Sensibles

#### ⚠️ NE JAMAIS LOGGER:

```typescript
// ❌ MAUVAIS: Expose des informations sensibles
logger.info('Client ID: {clientID}', authConfig.credentials.clientID);
logger.info('User password: {password}', password);
logger.info('JWT token: {token}', token);
logger.info('Database connection string: {conn}', databaseUrl);
logger.info('API key: {key}', apiKey);
```

#### ✅ LOGGER EN TOUTE SÉCURITÉ:

```typescript
// ✅ BON: Informations non sensibles uniquement
logger.info('User logged in: {userId}', user.id);
logger.info('Stock created: {stockId}', stock.id);
logger.error('Database connection failed', error); // Pas de credentials
logger.info('Authentication attempt from IP: {ip}', request.ip);
```

**Règle d'or**: Si l'information peut être utilisée pour attaquer le système, **ne pas la logger en production**.

---

### 7. Format des Messages

**Utiliser des placeholders**:

```typescript
// ✅ BON: Placeholders structurés
logger.info('Stock {stockId} created by user {userId}', stockId, userId);
logger.error('Failed to create stock {stockId}: {reason}', stockId, reason, error);

// ❌ MAUVAIS: Concaténation de strings
logger.info(`Stock ${stockId} created by user ${userId}`);
logger.error('Failed to create stock ' + stockId + ': ' + reason);
```

**Avantages des placeholders**:

- Facilite le parsing et l'analyse
- Meilleure performance (pas de string interpolation)
- Structuration automatique des données

---

### 8. Monitoring en Production (Azure Application Insights)

**Flux automatique**:

```
1. Code utilise rootController.error(...)
   ↓
2. logger.ts affiche en console (développement)
   ↓
3. cloudLogger.ts capture automatiquement (.setAutoCollectConsole: true)
   ↓
4. Logs envoyés vers Azure Application Insights
   ↓
5. Analyse et alertes dans Azure Portal
```

**Métriques collectées automatiquement**:

- ✅ Requêtes HTTP (latence, statut)
- ✅ Exceptions non catchées
- ✅ Dépendances externes (DB, APIs)
- ✅ Performance serveur (CPU, mémoire)
- ✅ Logs console (via `rootController`, `rootDatabase`, etc.)

---

### 9. Exemples Complets

#### Exemple 1: Routes Express

```typescript
import { Router } from 'express';
import { rootController } from '@utils/logger';

const configureStockRoutes = async (): Promise<Router> => {
  const logger = rootController.getChildCategory('configureStockRoutes');
  logger.info('Configuring stock routes...');

  const router = Router();

  router.get('/stocks', async (req, res) => {
    try {
      await stockController.getAllStocks(req, res);
    } catch (error) {
      rootController.error('Error in GET /stocks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  logger.info('Stock routes configured successfully');
  return router;
};
```

#### Exemple 2: Repository Prisma

```typescript
import { rootDatabase } from '@utils/logger';

export class PrismaStockCommandRepository {
  private logger = rootDatabase.getChildCategory('stockCommandRepository');

  async createStock(command: CreateStockCommand): Promise<Stock> {
    this.logger.info('Creating stock: {label}', command.label);

    try {
      const stock = await this.prisma.stocks.create({
        data: {
          LABEL: command.label,
          DESCRIPTION: command.description,
          CATEGORY: command.category,
        },
      });

      this.logger.info('Stock created successfully: {stockId}', stock.ID);
      return stock;
    } catch (error) {
      this.logger.error('Failed to create stock: {label}', command.label, error);
      throw error;
    }
  }
}
```

#### Exemple 3: Middleware d'authentification

```typescript
import { rootSecurity } from '@utils/logger';

export const authenticateMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const logger = rootSecurity.getChildCategory('authMiddleware');

  logger.debug('Authenticating request...');

  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.warn('Authentication failed: No token provided');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validation du token
    logger.info('Token validated successfully for user: {userId}', user.id);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
```

---

### 10. Checklist Logging

Avant chaque commit, vérifier:

- [ ] **Pas de console.\***: Aucun `console.log`, `console.error`, `console.warn`, `console.info`
- [ ] **Logger structuré**: Utilisation de `rootController`, `rootDatabase`, etc.
- [ ] **Placeholders**: Messages avec `{placeholder}` au lieu de concaténation
- [ ] **Pas d'infos sensibles**: Pas de credentials, tokens, passwords, clientID dans les logs
- [ ] **Niveau approprié**: `debug` pour détails, `info` pour opérations, `warn` pour anomalies, `error` pour erreurs
- [ ] **Sous-catégories**: Utilisation de `.getChildCategory()` pour logs spécifiques
- [ ] **Try/catch loggés**: Toutes les exceptions sont loggées avec `logger.error()`

---

### Documentation Complète

- **Fichiers sources**: `src/Utils/logger.ts`, `src/Utils/cloudLogger.ts`
- **Bibliothèque**: [typescript-logging](https://github.com/mreuvers/typescript-logging)
- **Azure Application Insights**: [Documentation Microsoft](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)

---

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
6. ✅ **Logging correct**: Pas de `console.*`, utilisation de `rootController`, `rootDatabase`, etc.
7. ✅ **Pas d'infos sensibles**: Pas de credentials, tokens, passwords dans les logs
8. ✅ Conventional Commit respecté (vérifié par commitlint)

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
- ⚠️ **Éviter `as` (type assertion)** - Préférer type narrowing ou type guards
- Les hooks pre-commit et pre-push automatisent les vérifications
