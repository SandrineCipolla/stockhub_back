# DDD/CQRS Stock Manipulation Module - Documentation

## Vue d'ensemble

Cette PR implémente le **bounded context "Manipulation"** pour la gestion des stocks selon les principes **DDD (Domain-Driven Design)** et **CQRS (Command Query Responsibility Segregation)**.

## Architecture en couches

```
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (à venir)                      │
│              StockControllerManipulation + Routes            │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│                                                              │
│  Commands (Request):                                         │
│  - CreateStockCommand                                        │
│  - AddItemToStockCommand                                     │
│  - UpdateItemQuantityCommand                                 │
│                                                              │
│  Command Handlers (Use Cases):                               │
│  - CreateStockCommandHandler                                 │
│  - AddItemToStockCommandHandler                              │
│  - UpdateItemQuantityCommandHandler                          │
│                                                              │
│  Repository Interface:                                       │
│  - IStockCommandRepository                                   │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
│                                                              │
│  Value Objects:                                              │
│  - StockLabel (validation 3-50 chars)                        │
│  - StockDescription (validation 1-200 chars)                 │
│  - Quantity (validation >= 0)                                │
│                                                              │
│  Entities (Aggregate Root):                                  │
│  - Stock (méthodes métier: create, addItem, etc.)            │
│  - StockItem                                                 │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                       │
│                                                              │
│  Repositories:                                               │
│  - PrismaStockCommandRepository (implémentation Prisma)      │
│    + Logging Azure Application Insights                     │
│    + Gestion erreurs                                         │
└─────────────────────────────────────────────────────────────┘
```

## Composants implémentés

### 1. Domain Layer (Logique métier)

#### Value Objects
- **StockLabel** : Encapsule et valide le label d'un stock
  - Validation : 3-50 caractères
  - Immutable
  - Trim automatique

- **StockDescription** : Encapsule et valide la description
  - Validation : 1-200 caractères
  - Immutable
  - Trim automatique

- **Quantity** : Encapsule et valide les quantités
  - Validation : >= 0

#### Entities
- **Stock** (Aggregate Root) :
  - Factory method `create()` avec validation
  - `addItem()` : Ajoute un item avec validation (pas de doublons)
  - `updateItemQuantity()` : Met à jour la quantité
  - `getLowStockItems()` : Retourne les items en stock faible
  - `hasLowStockItems()` : Vérifie la présence de stock faible
  - `removeItem()` : Supprime un item
  - `getItemById()` : Récupère un item par ID

### 2. Application Layer (Orchestration)

#### Commands (DTOs)
Les Commands sont de simples objets de transfert de données qui représentent une **intention d'action** :

```typescript
// Exemple : Créer un stock
new CreateStockCommand(
    'Stock Cuisine',
    'Aliments périssables',
    'alimentation',
    123 // userId
)
```

#### Command Handlers (Use Cases)
Les Handlers **exécutent** les Commands en orchestrant le domaine et le repository :

```typescript
class CreateStockCommandHandler {
    async handle(command: CreateStockCommand): Promise<Stock> {
        // 1. Créer l'entité du domaine (valide les règles métier)
        const stock = Stock.create({
            label: command.label,
            description: command.description,
            category: command.category,
            userId: command.userId
        });

        // 2. Sauvegarder via le repository
        return await this.stockRepository.save(stock);
    }
}
```

#### Repository Interface
`IStockCommandRepository` définit le contrat pour la persistance :
- `save(stock)` : Créer un stock
- `findById(stockId)` : Récupérer un stock
- `addItemToStock(stockId, item)` : Ajouter un item
- `updateItemQuantity(stockId, itemId, quantity)` : Mettre à jour la quantité

### 3. Infrastructure Layer (Technique)

#### PrismaStockCommandRepository
Implémentation concrète du repository avec :
- **Prisma Client** pour les requêtes MySQL
- **Azure Application Insights** pour le logging
- **Gestion des erreurs** avec try/catch/finally
- **Conversion Prisma ↔ Domain** via `toDomain()`

```typescript
async save(stock: Stock): Promise<Stock> {
    let success = false;
    try {
        const createdStock = await prisma.stocks.create({
            data: {
                LABEL: stock.getLabelValue(),
                DESCRIPTION: stock.getDescriptionValue(),
                CATEGORY: stock.category as any,
                USER_ID: userId
            }
        });
        success = true;
        return this.toDomain(createdStock);
    } catch (error) {
        rootException(error);
        throw error;
    } finally {
        rootDependency({ ... }); // Azure logging
    }
}
```

## Tests unitaires

### Tests des Value Objects
- ✅ StockLabel : validation min/max, trim, types
- ✅ StockDescription : validation, trim, types
- Structure : 1 describe par méthode → 1 describe par contexte → 1 it

### Tests de l'entité Stock
- ✅ Méthode `create()` avec tous les cas limites
- ✅ Méthodes métier : addItem, updateItemQuantity, etc.
- ✅ Cas d'erreur et validation des règles métier

### Tests des Command Handlers (avec mocks)
- ✅ CreateStockCommandHandler : 3 tests (nominal, erreur label, erreur DB)
- ✅ AddItemToStockCommandHandler : 3 tests
- ✅ UpdateItemQuantityCommandHandler : 3 tests
- **Approche** : Mocks du repository pour tester uniquement la logique du handler

Exemple de test avec mock :
```typescript
describe('CreateStockCommandHandler', () => {
    describe('handle()', () => {
        describe('when handling a valid CreateStockCommand', () => {
            it('should create stock and save it via repository', async () => {
                const mockRepository = {
                    save: jest.fn().mockResolvedValue(mockStock),
                    // ... autres méthodes mockées
                };

                const handler = new CreateStockCommandHandler(mockRepository);
                const command = new CreateStockCommand(...);

                const result = await handler.handle(command);

                expect(mockRepository.save).toHaveBeenCalledTimes(1);
                expect(result).toBe(mockStock);
            })
        })
    })
})
```

## Principes DDD appliqués

### 1. Bounded Context
**Manipulation** est séparé de **Visualization** (lecture seule)
- Écriture : Commands + Command Handlers
- Lecture : Queries + Query Handlers (déjà existant)

### 2. Aggregate Root
`Stock` est l'aggregate root qui :
- Protège les invariants métier
- Contrôle l'accès aux `StockItem` (entités enfants)
- Valide toutes les modifications

### 3. Value Objects
Encapsulation des valeurs métier avec validation :
- Immutables
- Auto-validés
- Pas d'identité (comparaison par valeur)

### 4. Repository Pattern
Abstraction de la persistance :
- Interface dans le domaine (`IStockCommandRepository`)
- Implémentation dans l'infrastructure (`PrismaStockCommandRepository`)
- Permet de changer de base de données sans toucher au domaine

## Séparation des responsabilités (CQRS)

### Write Side (Manipulation) - Cette PR
```
Command → CommandHandler → Domain Entity → Repository → Database
```

### Read Side (Visualization) - Déjà existant
```
Query → QueryHandler → QueryRepository → Database → DTO
```

## Conventions de nommage

| Concept | Convention | Exemple |
|---------|-----------|---------|
| Command | `{Action}Command` | `CreateStockCommand` |
| Command Handler | `{Action}CommandHandler` | `CreateStockCommandHandler` |
| Repository Interface | `I{Entity}CommandRepository` | `IStockCommandRepository` |
| Repository Implementation | `Prisma{Entity}CommandRepository` | `PrismaStockCommandRepository` |
| Value Object | `{Concept}` | `StockLabel`, `Quantity` |
| Test file | `{FileName}.test.ts` | `Stock.test.ts` |

## Structure des fichiers

```
src/
├── domain/
│   └── stock-management/
│       ├── common/
│       │   ├── entities/
│       │   │   ├── Stock.ts
│       │   │   └── StockItem.ts
│       │   └── value-objects/
│       │       ├── StockLabel.ts
│       │       ├── StockDescription.ts
│       │       └── Quantity.ts
│       └── manipulation/
│           ├── commands(Request)/
│           │   ├── CreateStockCommand.ts
│           │   ├── AddItemToStockCommand.ts
│           │   └── UpdateItemQuantityCommand.ts
│           ├── command-handlers(UseCase)/
│           │   ├── CreateStockCommandHandler.ts
│           │   ├── AddItemToStockCommandHandler.ts
│           │   └── UpdateItemQuantityCommandHandler.ts
│           └── repositories/
│               └── IStockCommandRepository.ts
├── infrastructure/
│   └── stock-management/
│       └── manipulation/
│           └── repositories/
│               └── PrismaStockCommandRepository.ts
└── tests/
    └── domain/
        └── stock-management/
            ├── common/
            │   ├── entities/
            │   │   └── Stock.test.ts
            │   └── value-objects/
            │       ├── StockLabel.test.ts
            │       └── StockDescription.test.ts
            └── manipulation/
                └── command-handlers/
                    ├── CreateStockCommandHandler.test.ts
                    ├── AddItemToStockCommandHandler.test.ts
                    └── UpdateItemQuantityCommandHandler.test.ts
```

## Prochaines étapes (PR suivante)

1. **Tests d'intégration** (Repository)
   - Setup TestContainers pour MySQL
   - Tests avec vraie base de données

2. **API Layer**
   - Controller `StockControllerManipulation`
   - Routes Express
   - Validation des inputs

3. **Tests E2E**
   - Playwright pour tester le flow complet
   - Scénario : Créer stock → Ajouter items → Vérifier → Modifier

## Ressources

- [DDD par Eric Evans](https://www.domainlanguage.com/ddd/)
- [CQRS par Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Azure Application Insights](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
