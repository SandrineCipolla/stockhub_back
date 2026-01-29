# Bonnes pratiques : Injection de dépendances (Dependency Injection)

**Date de création :** 2025-12-28
**Contexte :** Issue #71 - Tests d'intégration bloqués par dépendances hardcodées

---

## 🎯 Principe général

**Toute classe ou fonction qui dépend d'une ressource externe (base de données, API, service) DOIT accepter cette dépendance en paramètre.**

### Pourquoi ?

1. **Testabilité :** Permet d'injecter des mocks ou des instances de test
2. **Flexibilité :** Permet de changer l'implémentation sans modifier le code
3. **Isolation :** Les tests peuvent utiliser leur propre base de données sans affecter la production

---

## ❌ Problème rencontré : Issue #71

### Code problématique

```typescript
// ❌ MAUVAIS : PrismaClient hardcodé
const prisma = new PrismaClient();

export function authorizeStockAccess(requiredPermission: RequiredPermission = 'read') {
  return async (req: AuthorizedRequest, res: express.Response, next: express.NextFunction) => {
    // Utilise le PrismaClient hardcodé
    const user = await prisma.users.findUnique({ ... });
    const stock = await prisma.stocks.findUnique({ ... });
  };
}
```

### Conséquences

- **Tests d'intégration bloqués :** Impossible d'injecter le PrismaClient de test
- **Tests utilisent la base de production :** Risque de polluer les données réelles
- **Tests interdépendants :** Modifications dans la base persistent entre tests
- **Pas d'isolation :** Impossible d'utiliser TestContainers ou bases de test

### Symptômes observés

```typescript
// Test d'intégration
describe('Authorization Middleware Integration Tests', () => {
  let setup: TestDatabaseSetup;

  beforeAll(async () => {
    setup = await setupTestDatabase(); // Crée une base MySQL de test
  });

  it('should authorize owner', async () => {
    const user = await setup.prisma.users.create({ ... }); // ✅ Créé dans base de test

    const app = express();
    app.get('/stocks/:id', authorizeStockRead, handler); // ❌ Middleware utilise base PRODUCTION

    // Le middleware ne trouve pas l'utilisateur créé dans la base de test !
    await request(app).get('/stocks/1').expect(401); // ❌ Échec
  });
});
```

---

## ✅ Solution : Pattern d'injection avec fallback

### Code corrigé

```typescript
// ✅ BON : PrismaClient injectable avec fallback
export function authorizeStockAccess(
  requiredPermission: RequiredPermission = 'read',
  prismaClient?: PrismaClient  // ← Paramètre optionnel
) {
  const prisma = prismaClient ?? new PrismaClient(); // ← Fallback pour production

  return async (req: AuthorizedRequest, res: express.Response, next: express.NextFunction) => {
    const user = await prisma.users.findUnique({ ... });
    const stock = await prisma.stocks.findUnique({ ... });
  };
}
```

### Utilisation en production (pas de changement)

```typescript
// Production : utilise le fallback (nouveau PrismaClient automatique)
router.get('/stocks/:id', authorizeStockRead(), handler);
```

### Utilisation dans les tests

```typescript
// Tests : injection du PrismaClient de test
it('should authorize owner', async () => {
  const user = await setup.prisma.users.create({ ... });

  const app = express();
  app.get('/stocks/:id', authorizeStockRead(setup.prisma), handler); // ← Injection

  await request(app).get('/stocks/1').expect(200); // ✅ Succès
});
```

---

## 📋 Pattern à suivre

### Pour les Repositories

```typescript
// ✅ Pattern existant dans le projet
export class PrismaStockCommandRepository implements IStockCommandRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async save(stock: Stock, userId: number): Promise<Stock> {
    return await this.prisma.stocks.create({ ... });
  }
}
```

### Pour les Middlewares Express

```typescript
// ✅ Pattern pour middlewares
export function myMiddleware(optionalConfig?: SomeConfig, prismaClient?: PrismaClient) {
  const prisma = prismaClient ?? new PrismaClient();

  return async (req: Request, res: Response, next: NextFunction) => {
    // Utiliser prisma ici
  };
}

// Exports shortcuts avec injection
export const myMiddlewareRead = (prismaClient?: PrismaClient) => myMiddleware('read', prismaClient);
```

### Pour les Services

```typescript
// ✅ Pattern pour services
export class MyService {
  constructor(
    private repository: IMyRepository,
    private prisma?: PrismaClient
  ) {
    this.prisma = prisma ?? new PrismaClient();
  }

  async doSomething() {
    return await this.prisma.myTable.findMany();
  }
}
```

---

## 🔍 Checklist avant d'écrire du code

Avant d'écrire une nouvelle classe, service, ou middleware qui accède à la base de données :

- [ ] **Est-ce que cette classe/fonction accède à PrismaClient ?**
  - ✅ OUI → Accepter `prismaClient?: PrismaClient` en paramètre
  - ❌ NON → Pas besoin d'injection

- [ ] **Est-ce que je veux tester cette classe/fonction ?**
  - ✅ OUI → OBLIGATOIRE d'utiliser l'injection de dépendances
  - ❌ NON → Recommandé quand même pour la flexibilité

- [ ] **Est-ce que j'ai créé des tests d'intégration ?**
  - ✅ OUI → Vérifier que j'injecte `setup.prisma` dans tous les composants testés
  - ❌ NON → Créer des tests d'intégration

---

## 📚 Exemples dans le projet

### ✅ Exemples corrects

| Fichier                                 | Pattern utilisé                                      |
| --------------------------------------- | ---------------------------------------------------- |
| `PrismaStockCommandRepository.ts`       | Constructor injection avec fallback                  |
| `PrismaStockVisualizationRepository.ts` | Constructor injection avec fallback                  |
| `AuthorizationRepository.ts` (PR #73)   | Repository Pattern DDD (encapsulation complète)      |
| `authorizeMiddleware.ts` (après PR #73) | Repository injection avec fallback                   |
| `StockRoutesV2.ts`                      | Injection repository + partage instance PrismaClient |

### ❌ Exemples à corriger (si rencontrés)

```typescript
// ❌ À ÉVITER
const prisma = new PrismaClient(); // Global hardcodé

export class MyService {
  async getData() {
    return prisma.data.findMany(); // Utilise le global
  }
}
```

```typescript
// ✅ À UTILISER
export class MyService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async getData() {
    return this.prisma.data.findMany();
  }
}
```

---

## 🧪 Impact sur les tests

### Avant (Issue #71 - tests skippés)

```typescript
describe.skip('Authorization Middleware Integration Tests', () => {
  // FIXME: Le middleware crée son propre PrismaClient
  // Impossible d'injecter le client de test
});
```

**Résultat :** 0 tests d'intégration pour l'autorisation

### Après (Issue #71 corrigée)

```typescript
describe('Authorization Middleware Integration Tests', () => {
  let setup: TestDatabaseSetup;

  beforeAll(async () => {
    setup = await setupTestDatabase(); // MySQL TestContainer
  });

  it('should authorize owner', async () => {
    const app = express();
    app.get('/stocks/:id', authorizeStockRead(setup.prisma), handler);
    // ✅ Tests utilisent la base de test isolée
  });
});
```

**Résultat :** 9 tests d'intégration actifs avec isolation complète

---

## 🎓 Références

### Liens utiles

- [Dependency Injection Pattern - Wikipedia](https://en.wikipedia.org/wiki/Dependency_injection)
- [SOLID Principles - Dependency Inversion](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

### Issues associées

- **Issue #71 :** Refactor authorizeMiddleware to accept PrismaClient injection
- **Issue #62 :** Phase 1 Authorization (contenait les tests skippés initialement)

### ADRs connexes

- **ADR-002 :** Choix de Prisma ORM (mentionne l'importance de la testabilité)
- **ADR-004 :** Tests Value Objects et Entities (principe d'isolation)

---

## 🏛️ Évolution : Repository Pattern (DDD)

**Date de mise à jour :** 2026-01-06
**Contexte :** Code review PR #72/#73 - Amélioration architecture DDD

### Problème identifié lors de la code review

**Commentaire du reviewer (PR #73) :**

> **issue(blocking)**: prisma client creation should be in a repository.

Bien que l'injection de PrismaClient ait résolu le problème de testabilité, le middleware violait toujours les principes DDD :

```typescript
// ❌ Middleware couplé à Prisma (pas DDD)
export function authorizeStockAccess(
  requiredPermission: RequiredPermission = 'read',
  prismaClient?: PrismaClient  // Dépendance technique dans le middleware
) {
  const prisma = prismaClient ?? new PrismaClient();

  return async (req, res, next) => {
    // Middleware contient de la logique d'accès aux données
    const user = await prisma.users.findUnique({ ... });
    const stock = await prisma.stocks.findUnique({ ... });
    const collaborator = await prisma.stockCollaborator.findUnique({ ... });
  };
}
```

**Problèmes :**

1. **Violation de la séparation des couches** : Le middleware (couche application) accède directement à Prisma (couche infrastructure)
2. **Couplage fort** : Le middleware connaît le schéma Prisma et les détails d'implémentation
3. **Pas DDD** : Pas d'abstraction entre la logique métier et la persistance
4. **Difficile à tester unitairement** : Impossible de mocker facilement les requêtes

### Solution : Repository Pattern

Le **Repository Pattern** est un pattern DDD qui encapsule toute la logique d'accès aux données dans une classe dédiée.

#### Étape 1 : Créer le Repository

```typescript
// src/authorization/repositories/AuthorizationRepository.ts
import { PrismaClient, StockRole as PrismaStockRole } from '@prisma/client';

export interface UserIdentity {
  ID: number;
}

export interface StockIdentity {
  ID: number;
  USER_ID: number | null;
}

export interface CollaboratorRole {
  role: PrismaStockRole;
}

/**
 * Repository for authorization-related database queries
 * Encapsulates Prisma queries to improve testability and maintainability
 */
export class AuthorizationRepository {
  constructor(private prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<UserIdentity | null> {
    return this.prisma.users.findUnique({
      where: { EMAIL: email },
      select: { ID: true },
    });
  }

  async findStockById(stockId: number): Promise<StockIdentity | null> {
    return this.prisma.stocks.findUnique({
      where: { ID: stockId },
      select: { ID: true, USER_ID: true },
    });
  }

  async findCollaboratorByUserAndStock(
    stockId: number,
    userId: number
  ): Promise<CollaboratorRole | null> {
    return this.prisma.stockCollaborator.findUnique({
      where: { stockId_userId: { stockId, userId } },
      select: { role: true },
    });
  }
}
```

**Avantages du Repository :**

- ✅ **Encapsulation** : Toute la logique Prisma est dans un seul endroit
- ✅ **Abstraction** : Le middleware ne connaît plus Prisma
- ✅ **DDD** : Séparation claire entre domaine et infrastructure
- ✅ **Testabilité** : Facile de mocker le repository avec des interfaces
- ✅ **Maintenabilité** : Changements de schéma localisés dans le repository

#### Étape 2 : Refactorer le Middleware

```typescript
// src/authorization/authorizeMiddleware.ts
import { AuthorizationRepository } from './repositories/AuthorizationRepository';

// ✅ BON : Injection du Repository (pas de PrismaClient)
export function authorizeStockAccess(
  requiredPermission: RequiredPermission = 'read',
  repository?: AuthorizationRepository // ← Repository au lieu de PrismaClient
) {
  const authRepository = repository ?? new AuthorizationRepository(new PrismaClient());

  return async (req, res, next) => {
    // Utilise le repository (méthodes métier)
    const user = await authRepository.findUserByEmail(req.userID);
    const stock = await authRepository.findStockById(stockId);
    const collaborator = await authRepository.findCollaboratorByUserAndStock(stockId, user.ID);
  };
}
```

**Améliorations :**

- 🏛️ **Architecture DDD** : Middleware → Repository → Prisma (séparation des couches)
- 📦 **Encapsulation** : Le middleware appelle des méthodes métier (`findUserByEmail`) au lieu de méthodes techniques (`prisma.users.findUnique`)
- 🧪 **Tests unitaires** : Possibilité de mocker le repository facilement
- 🔧 **Maintenance** : Changements de schéma Prisma isolés dans le repository

#### Étape 3 : Mettre à jour les Routes

```typescript
// src/api/routes/StockRoutesV2.ts
const configureStockRoutesV2 = async (prismaClient?: PrismaClient): Promise<Router> => {
  const prisma = prismaClient ?? new PrismaClient();
  const authorizationRepository = new AuthorizationRepository(prisma);  // ← Créer le repository

  router.get(
    '/stocks/:stockId',
    authorizeStockRead(authorizationRepository),  // ← Injecter le repository
    async (req, res) => { ... }
  );
};
```

#### Étape 4 : Mettre à jour les Tests

```typescript
// tests/integration/authorization/authorizeMiddleware.integration.test.ts
describe('Authorization Middleware Integration Tests', () => {
  let setup: TestDatabaseSetup;
  let repository: AuthorizationRepository; // ← Repository de test

  beforeAll(async () => {
    setup = await setupTestDatabase();
    repository = new AuthorizationRepository(setup.prisma); // ← Injection du Prisma de test
  });

  it('should authorize owner', async () => {
    const app = express();
    app.get('/stocks/:id', authorizeStockRead(repository), handler); // ← Injection du repository
    // ✅ Tests utilisent le repository avec la base de test
  });
});
```

### Comparaison Avant/Après

| Aspect              | Avant (PrismaClient injection) | Après (Repository Pattern)                           |
| ------------------- | ------------------------------ | ---------------------------------------------------- |
| **Architecture**    | ❌ Middleware couplé à Prisma  | ✅ Séparation DDD (Middleware → Repository → Prisma) |
| **Testabilité**     | ⚠️ Injection possible          | ✅ Facile à mocker avec interfaces                   |
| **Maintenabilité**  | ❌ Logique Prisma dispersée    | ✅ Logique centralisée dans le repository            |
| **DDD**             | ❌ Violation séparation layers | ✅ Conforme architecture DDD                         |
| **Lisibilité**      | ⚠️ Méthodes techniques         | ✅ Méthodes métier (`findUserByEmail`)               |
| **Réutilisabilité** | ❌ Logique dupliquée           | ✅ Repository partagé entre middlewares              |

### Pattern complet : Injection avec Repository

```typescript
// ✅ Pattern DDD complet
class AuthorizationRepository {
  constructor(private prisma: PrismaClient) {}
  // Méthodes d'accès aux données
}

function authorizeMiddleware(repository?: AuthorizationRepository) {
  const repo = repository ?? new AuthorizationRepository(new PrismaClient());
  // Utilise le repository
}

// En production
app.use(authorizeMiddleware()); // Utilise le fallback

// En tests
const testRepo = new AuthorizationRepository(testPrisma);
app.use(authorizeMiddleware(testRepo)); // Injecte le repository de test
```

---

## 📝 Résumé

**Règle d'or :** Toute dépendance externe doit être injectable avec un fallback pour la production.

```typescript
// ✅ Pattern universel
constructor(dependency?: ExternalDependency) {
  this.dependency = dependency ?? new ExternalDependency();
}
```

**Avantages :**

- ✅ Tests isolés et rapides
- ✅ Aucun impact sur le code production (fallback transparent)
- ✅ Flexibilité pour changer d'implémentation
- ✅ Respecte les principes SOLID (Dependency Inversion)

**À retenir :** Si vous écrivez `new PrismaClient()` directement dans une classe/fonction, demandez-vous si elle sera testée. Si oui, utilisez l'injection de dépendances.

---

**Auteur :** Sandrine Cipolla
**Assistance :** Claude Code (Sonnet 4.5)
**Date de création :** 2025-12-28 (Issue #71 - Injection de dépendances)
**Mise à jour :** 2026-01-06 (PR #73 - Repository Pattern DDD)
**Issues :** #71, #73
