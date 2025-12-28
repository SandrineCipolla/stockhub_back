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

| Fichier                                  | Pattern utilisé                        |
| ---------------------------------------- | -------------------------------------- |
| `PrismaStockCommandRepository.ts`        | Constructor injection avec fallback    |
| `PrismaStockVisualizationRepository.ts`  | Constructor injection avec fallback    |
| `authorizeMiddleware.ts` (après fix #71) | Parameter injection avec fallback      |
| `StockRoutesV2.ts`                       | Injection du même PrismaClient partout |

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
**Date :** 2025-12-28
**Issue :** #71
