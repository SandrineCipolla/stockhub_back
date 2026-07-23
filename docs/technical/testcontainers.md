# Tests d'intégration - Documentation

## Vue d'ensemble

Cette documentation explique la stratégie de tests d'intégration mise en place pour le backend StockHub, en utilisant **TestContainers** pour tester les repositories avec une vraie base de données MySQL.

## Table des matières

1. [Concepts](#concepts)
2. [Architecture](#architecture)
3. [Technologies utilisées](#technologies-utilisées)
4. [Configuration](#configuration)
5. [Écriture de tests](#écriture-de-tests)
6. [Exécution des tests](#exécution-des-tests)
7. [Bonnes pratiques](#bonnes-pratiques)
8. [Dépannage](#dépannage)

---

## Concepts

### Tests unitaires vs Tests d'intégration

| Type              | Tests unitaires            | Tests d'intégration             |
| ----------------- | -------------------------- | ------------------------------- |
| **Scope**         | Une fonction/classe isolée | Plusieurs composants ensemble   |
| **Dépendances**   | Mockées (jest.fn())        | Réelles (vraie DB, vrai Prisma) |
| **Vitesse**       | Très rapides (ms)          | Plus lents (secondes)           |
| **Isolation**     | Totale                     | Partielle                       |
| **Configuration** | jest.config.js             | jest.integration.config.js      |
| **Emplacement**   | tests/domain/              | tests/integration/              |

### Pourquoi TestContainers ?

**TestContainers** permet de :

- ✅ Tester avec une **vraie base de données MySQL** (pas SQLite ou mock)
- ✅ Garantir l'**isolation** : chaque test démarre un container propre
- ✅ Détecter les **bugs spécifiques à MySQL** (types, contraintes, relations)
- ✅ Valider que **Prisma fonctionne correctement** avec notre schéma
- ✅ Tester les **transactions, cascades, et triggers**

---

## Architecture

### Structure des fichiers

```
stockhub_back/
├── tests/
│   ├── domain/                          # Tests unitaires (mocks)
│   │   └── stock-management/
│   │       ├── common/
│   │       └── manipulation/
│   │           └── command-handlers/
│   │
│   ├── integration/                     # Tests d'intégration (vraie DB)
│   │   └── stock-management/
│   │       ├── api/
│   │       │   └── StockApiV2.integration.test.ts
│   │       └── repositories/
│   │           └── PrismaStockCommandRepository.integration.test.ts
│   │
│   ├── setupTests.ts                    # Setup pour tests unitaires
│   └── setupIntegrationEnv.ts           # Setup pour tests d'intégration
│
├── jest.config.js                       # Configuration tests unitaires
└── jest.integration.config.js           # Configuration tests d'intégration
```

### Flux d'un test d'intégration

```
┌─────────────────────────────────────────────────────────────────┐
│  1. beforeAll() - Démarre le container MySQL                    │
│     - TestContainers lance MySQL:8.0 dans Docker                │
│     - Récupère host/port dynamique du container                 │
│     - Configure DATABASE_URL pour pointer vers le container     │
│     - Exécute `prisma db push` pour créer le schéma            │
│     - Crée une instance PrismaClient connectée au container     │
│     - Injecte PrismaClient dans le repository                   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. beforeEach() - Nettoie la base de données                   │
│     - DELETE FROM items                                         │
│     - DELETE FROM stocks                                        │
│     - DELETE FROM users                                         │
│     - INSERT INTO users (user de test)                          │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Test - Exécute le scénario de test                         │
│     - Given: Prépare les données (via repository ou Prisma)    │
│     - When: Exécute l'opération à tester (repository.method()) │
│     - Then: Vérifie les résultats (assertions)                 │
│     - And: Vérifie directement en DB si nécessaire              │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. afterAll() - Arrête le container                            │
│     - prisma.$disconnect()                                      │
│     - container.stop()                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technologies utilisées

### TestContainers

**Installation :**

```bash
npm install --save-dev @testcontainers/mysql testcontainers
```

**Rôle :** Démarre un container Docker MySQL temporaire pour chaque suite de tests.

### Prisma Client

**Rôle :** ORM pour communiquer avec MySQL. Dans les tests d'intégration, on utilise le vrai Prisma (pas de mock).

### Jest

**Configuration :** `jest.integration.config.js` avec :

- Timeout de 60s (pour démarrage container)
- Pattern de fichiers : `**/*.integration.test.ts`

---

## Configuration

### jest.integration.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFiles: ['dotenv/config'],
  testMatch: ['**/tests/integration/**/*.integration.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupIntegrationEnv.ts'],
  testTimeout: 60000, // 60 secondes pour TestContainers
  verbose: true,
};
```

### setupIntegrationEnv.ts

```typescript
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

console.log('⚡ Integration tests - DATABASE_URL =', process.env.DATABASE_URL);
```

---

## Écriture de tests

### Template de base

```typescript
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { MyRepository } from '../../../../src/infrastructure/.../MyRepository';

const execAsync = promisify(exec);

describe('MyRepository Integration Tests', () => {
  let container: StartedMySqlContainer;
  let prisma: PrismaClient;
  let repository: MyRepository;

  beforeAll(async () => {
    // 1. Démarrer MySQL container
    container = await new MySqlContainer('mysql:8.0')
      .withDatabase('test_db')
      .withUsername('test')
      .withRootPassword('test')
      .start();

    const connectionString = `mysql://test:test@${container.getHost()}:${container.getPort()}/test_db`;

    // 2. Configurer DATABASE_URL
    process.env.DATABASE_URL = connectionString;

    // 3. Créer le schéma Prisma
    await execAsync('npx prisma db push --skip-generate --accept-data-loss', {
      env: { ...process.env, DATABASE_URL: connectionString },
    });

    // 4. Créer PrismaClient connecté au container
    prisma = new PrismaClient({
      datasources: {
        db: { url: connectionString },
      },
    });

    // 5. Injecter Prisma dans le repository
    repository = new MyRepository(prisma);
  }, 60000); // Timeout 60s

  afterAll(async () => {
    await prisma.$disconnect();
    await container.stop();
  });

  beforeEach(async () => {
    // Nettoyer la DB avant chaque test
    await prisma.items.deleteMany({});
    await prisma.stocks.deleteMany({});
    await prisma.users.deleteMany({});

    // Créer un user de test
    await prisma.users.create({
      data: { ID: 1, EMAIL: 'test@test.com' },
    });
  });

  describe('methodName()', () => {
    describe('when doing something', () => {
      it('should have expected behavior', async () => {
        // Given: Préparer les données
        const input = {
          /* ... */
        };

        // When: Exécuter l'opération
        const result = await repository.methodName(input);

        // Then: Vérifier le résultat
        expect(result).toBeDefined();
        expect(result.someProperty).toBe('expected value');

        // And: Vérifier en DB (optionnel)
        const dbRecord = await prisma.someTable.findUnique({
          where: { ID: result.id },
        });
        expect(dbRecord).toBeDefined();
      });
    });
  });
});
```

### Injection de dépendance (Dependency Injection)

**Problème :** Si le repository crée son propre PrismaClient au chargement du module, il ne pointera pas vers le container de test.

**Solution :** Rendre le repository injectable :

```typescript
export class PrismaStockCommandRepository implements IStockCommandRepository {
    private prisma: PrismaClient;

    constructor(prismaClient?: PrismaClient) {
        // Si on injecte un client, on l'utilise
        // Sinon, on crée un nouveau client (comportement par défaut)
        this.prisma = prismaClient ?? new PrismaClient();
    }

    async save(stock: Stock): Promise<Stock> {
        // Utilise this.prisma au lieu de prisma global
        const result = await this.prisma.stocks.create({...});
        return result;
    }
}
```

**Dans le test :**

```typescript
// Injecter le PrismaClient du container
repository = new PrismaStockCommandRepository(prisma);
```

**En production :**

```typescript
// Pas d'injection, utilise la DB de production
repository = new PrismaStockCommandRepository();
```

---

## Exécution des tests

### Commandes

```bash
# Exécuter TOUS les tests d'intégration
npm test -- --config=jest.integration.config.js

# Exécuter un fichier spécifique
npm test -- --config=jest.integration.config.js PrismaStockCommandRepository.integration.test.ts

# Exécuter avec logs détaillés
npm test -- --config=jest.integration.config.js --verbose
```

### Scripts package.json (recommandé)

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "test": "jest --runInBand --detectOpenHandles --forceExit",
    "test:unit": "jest --config=jest.config.js",
    "test:integration": "jest --config=jest.integration.config.js",
    "test:all": "npm run test:unit && npm run test:integration"
  }
}
```

Usage :

```bash
npm run test:unit         # Tests unitaires uniquement
npm run test:integration  # Tests d'intégration uniquement
npm run test:all          # Tous les tests
```

---

## Bonnes pratiques

### ✅ DO

1. **Nommer les fichiers avec `.integration.test.ts`**
   - Permet de les distinguer des tests unitaires
   - Respecte le pattern de jest.integration.config.js

2. **Utiliser Given/When/Then**

   ```typescript
   it('should create stock with items', async () => {
       // Given: Un stock avec 2 items
       const stock = Stock.create({...});

       // When: On sauvegarde le stock
       const result = await repository.save(stock);

       // Then: Le stock est persisté avec ses items
       expect(result.id).toBeGreaterThan(0);
   });
   ```

3. **Nettoyer entre chaque test**
   - Utiliser `beforeEach()` pour DELETE FROM tables
   - Garantit l'isolation des tests

4. **Tester avec des données réalistes**
   - Valeurs proches de la production
   - Cas limites (chaînes vides, valeurs négatives, etc.)

5. **Vérifier en DB quand nécessaire**
   ```typescript
   // Vérifier que les données sont vraiment en DB
   const dbRecord = await prisma.stocks.findUnique({
     where: { ID: savedStock.id },
     include: { items: true },
   });
   expect(dbRecord?.items).toHaveLength(2);
   ```

### ❌ DON'T

1. **Ne pas mocker dans les tests d'intégration**
   - Si vous mockez, c'est un test unitaire
   - Utilisez les vraies implémentations

2. **Ne pas partager l'état entre tests**
   - Chaque test doit être indépendant
   - Utiliser `beforeEach()` pour nettoyer

3. **Ne pas tester la logique métier**
   - Les tests d'intégration testent l'**intégration** (Repository + DB)
   - La logique métier est testée dans les tests unitaires

4. **Ne pas oublier le timeout**
   - TestContainers peut prendre 10-30s pour démarrer
   - Définir `testTimeout: 60000` dans jest.integration.config.js

---

## Dépannage

### Erreur : "The table `items` does not exist"

**Cause :** Le schéma Prisma n'a pas été créé dans le container.

**Solution :**

```typescript
await execAsync('npx prisma db push --skip-generate --accept-data-loss', {
  env: { ...process.env, DATABASE_URL: connectionString },
});
```

### Erreur : "Expected 1 arguments, but got 0" pour MySqlContainer

**Cause :** Nouvelle version de @testcontainers/mysql nécessite l'image.

**Solution :**

```typescript
container = await new MySqlContainer('mysql:8.0') // Spécifier l'image
  .withDatabase('test_db')
  .withRootPassword('test') // Utiliser withRootPassword au lieu de withPassword
  .start();
```

### Les tests trouvent des données d'un test précédent

**Cause :** `beforeEach()` ne nettoie pas correctement.

**Solution :**

```typescript
beforeEach(async () => {
  // Ordre important : supprimer les enfants avant les parents
  await prisma.items.deleteMany({}); // Enfant
  await prisma.stocks.deleteMany({}); // Parent
  await prisma.users.deleteMany({}); // Parent
});
```

### Erreur : Repository utilise la mauvaise DB

**Cause :** Le repository crée son PrismaClient avant que DATABASE_URL soit configurée.

**Solution :** Utiliser l'injection de dépendance (voir section [Injection de dépendance](#injection-de-dépendance-dependency-injection)).

### Tests très lents

**Optimisations :**

1. Utiliser `--runInBand` pour exécuter les tests séquentiellement
2. Réutiliser le container pour toute la suite de tests (beforeAll)
3. Ne nettoyer que dans beforeEach, pas dans afterEach

---

## Injection de dépendances pour les tests

### Problème : Repositories avec Prisma global

Initialement, les repositories créaient leur propre instance Prisma au chargement du module :

```typescript
// ❌ AVANT - Problème pour les tests
const prisma = new PrismaClient(); // Créé au chargement, pointe vers Azure

export class PrismaStockVisualizationRepository {
    async getAllStocks(userId: number): Promise<Stock[]> {
        return await prisma.stocks.findMany({...}); // Utilise toujours Azure
    }
}
```

**Conséquence :** Impossible d'injecter le Prisma du container de test → les tests utilisaient la vraie DB Azure !

### Solution : Constructor Injection Pattern

```typescript
// ✅ APRÈS - Testable
export class PrismaStockVisualizationRepository {
    private prisma: PrismaClient;

    constructor(prismaClient?: PrismaClient) {
        // Si injection (test), utilise le client fourni
        // Sinon (production), crée un nouveau client
        this.prisma = prismaClient ?? new PrismaClient();
    }

    async getAllStocks(userId: number): Promise<Stock[]> {
        return await this.prisma.stocks.findMany({...});
    }
}
```

### Usage en production vs tests

**Production (pas d'injection) :**

```typescript
// src/api/routes/StockRoutesV2.ts
const configureStockRoutesV2 = async (prismaClient?: PrismaClient): Promise<Router> => {
  const repository = new PrismaStockVisualizationRepository(); // Pas de param
  // → Utilise new PrismaClient() par défaut (Azure)
};
```

**Tests (avec injection) :**

```typescript
// Test d'intégration
const testPrisma = new PrismaClient({
  datasources: { db: { url: containerConnectionString } },
});

const repository = new PrismaStockVisualizationRepository(testPrisma);
// → Utilise le Prisma du container TestContainers
```

### Cascade d'injection

Pour tester les API, l'injection doit se propager à travers les couches :

```
Test
  ↓ injecte prisma
configureStockRoutesV2(prisma)
  ↓ injecte prisma
PrismaStockVisualizationRepository(prisma)
  ↓ utilise
Container MySQL (TestContainers)
```

```typescript
// Dans le test API
const stockRoutesV2 = await configureStockRoutesV2(prisma);
app.use('/api/v2', stockRoutesV2);
```

---

## Tests d'intégration API

### Différence avec tests Repository

| Aspect    | Tests Repository         | Tests API                       |
| --------- | ------------------------ | ------------------------------- |
| **Scope** | Repository + DB          | API + Service + Repository + DB |
| **Outil** | TestContainers           | TestContainers + Supertest      |
| **Mock**  | Aucun                    | UserService (auth)              |
| **Testé** | save(), findById(), etc. | GET /stocks, POST /stocks, etc. |

### Template de test API

```typescript
import request from 'supertest';
import express from 'express';
import {MySqlContainer} from '@testcontainers/mysql';
import {PrismaClient} from '@prisma/client';
import configureStockRoutesV2 from '../../../../src/api/routes/StockRoutesV2';

// Mock UserService pour éviter la vraie DB Azure pour l'auth
jest.mock('../../../../src/services/userService', () => {
    return {
        UserService: jest.fn().mockImplementation(() => {
            return {
                convertOIDtoUserID: jest.fn().mockResolvedValue({
                    empty: false,
                    value: 1
                })
            };
        })
    };
});

describe('Stock API Integration Tests', () => {
    let container: StartedMySqlContainer;
    let prisma: PrismaClient;
    let app: express.Express;

    beforeAll(async () => {
        // 1. Start MySQL container
        container = await new MySqlContainer('mysql:8.0').start();

        // 2. Configure Prisma
        prisma = new PrismaClient({
            datasources: { db: { url: containerUrl } }
        });

        // 3. Create Express app
        app = express();
        app.use(express.json());

        // 4. Mock authentication
        app.use((req, res, next) => {
            (req as any).userID = 'test-user-oid-123';
            next();
        });

        // 5. Configure routes WITH injected Prisma
        const stockRoutesV2 = await configureStockRoutesV2(prisma);
        app.use('/api/v2', stockRoutesV2);
    }, 60000);

    it('should get all stocks', async () => {
        // Given: Create stocks in container DB
        await prisma.stocks.create({
            data: { LABEL: 'Test Stock', ... }
        });

        // When: Call API
        const response = await request(app)
            .get('/api/v2/stocks')
            .expect(200);

        // Then: Verify response
        expect(response.body).toHaveLength(1);
    });
});
```

### Mocking vs Injection

**UserService : Mocké** ✅

- Pourquoi ? ReadUserRepository utilise mysql2/promise (pas Prisma)
- Trop complexe d'injecter aussi mysql2
- L'auth sera testée dans les E2E

**PrismaRepositories : Injectés** ✅

- Pourquoi ? On teste vraiment l'intégration avec MySQL
- L'injection de Prisma est simple et propre

---

## Exemples complets

### 1. Test d'intégration Repository

Voir : [`tests/integration/stock-management/repositories/PrismaStockCommandRepository.integration.test.ts`](../../tests/integration/stock-management/repositories/PrismaStockCommandRepository.integration.test.ts)

**Scénarios testés :**

1. ✅ `save()` - Créer un stock avec 2 items et vérifier la persistance en MySQL
2. ✅ `addItemToStock()` - Ajouter un item à un stock existant et vérifier la mise à jour

### 2. Test d'intégration API

Voir : [`tests/integration/stock-management/api/StockApiV2.integration.test.ts`](../../tests/integration/stock-management/api/StockApiV2.integration.test.ts)

**Scénarios testés :**

1. ✅ `GET /api/v2/stocks` - Retourne tableau vide si aucun stock
2. ✅ `GET /api/v2/stocks` - Retourne tous les stocks de l'utilisateur
3. ✅ `GET /api/v2/stocks` - Retourne 401 si non authentifié

---

## Architecture testable - Résumé

### Principe SOLID : Dependency Inversion

```
High-level modules should not depend on low-level modules.
Both should depend on abstractions.
```

### Nos repositories suivent ce principe :

```typescript
// Abstraction (interface)
export interface IStockCommandRepository {
  save(stock: Stock): Promise<Stock>;
}

// Implémentation concrète (avec injection)
export class PrismaStockCommandRepository implements IStockCommandRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }
}
```

### Avantages :

1. **Testabilité** : Injection du Prisma de test
2. **Flexibilité** : Changement de DB facile
3. **Isolation** : Tests n'affectent pas la prod
4. **Maintenabilité** : Code plus modulaire

---

## Ressources

- [TestContainers Documentation](https://node.testcontainers.org/)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Jest Configuration](https://jestjs.io/docs/configuration)
- [Dependency Injection Pattern](https://en.wikipedia.org/wiki/Dependency_injection)
- [DDD/CQRS Architecture](ddd-cqrs-guide.md)
