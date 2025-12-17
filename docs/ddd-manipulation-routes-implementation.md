# Implémentation des Routes Manipulation - API v2

**Date:** 16 décembre 2024
**Issue:** [#37](https://github.com/SandrineCipolla/stockhub_back/issues/37)
**Branche:** `feature/ddd-stock-manipulation-routes`

## Vue d'ensemble

Implémentation des routes POST/PATCH manquantes pour compléter le module **manipulation** (WRITE SIDE) en suivant l'architecture DDD/CQRS.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│  StockControllerManipulation (nouveau)                       │
│    ├─ POST   /api/v2/stocks                                 │
│    ├─ POST   /api/v2/stocks/:stockId/items                  │
│    └─ PATCH  /api/v2/stocks/:stockId/items/:itemId          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  Command Handlers (existants, réutilisés)                   │
│    ├─ CreateStockCommandHandler                             │
│    ├─ AddItemToStockCommandHandler                          │
│    └─ UpdateItemQuantityCommandHandler                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
│  Entities & Value Objects                                   │
│    ├─ Stock (avec méthodes métier)                          │
│    ├─ StockItem                                             │
│    ├─ StockLabel                                            │
│    ├─ StockDescription                                      │
│    └─ Quantity                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│  PrismaStockCommandRepository                               │
│    ├─ save(stock)                                           │
│    ├─ addItemToStock(stockId, item)                         │
│    └─ updateItemQuantity(stockId, itemId, quantity)         │
└─────────────────────────────────────────────────────────────┘
```

## Fichiers créés

### 1. Controller Manipulation

**Fichier:** `src/api/controllers/StockControllerManipulation.ts`

```typescript
export class StockControllerManipulation {
    constructor(
        private readonly createStockHandler: CreateStockCommandHandler,
        private readonly addItemHandler: AddItemToStockCommandHandler,
        private readonly updateQuantityHandler: UpdateItemQuantityCommandHandler,
        private readonly userService: UserService
    ) {}

    public async createStock(req: AuthenticatedRequest, res: Response) {
        const userID = await this.userService.convertOIDtoUserID(req.userID);
        const command = new CreateStockCommand(/* ... */);
        const stock = await this.createStockHandler.handle(command);
        res.status(HTTP_CODE_CREATED).json(stock);
    }

    public async addItemToStock(req: AuthenticatedRequest, res: Response) { /* ... */ }
    public async updateItemQuantity(req: AuthenticatedRequest, res: Response) { /* ... */ }
}
```

**Responsabilités:**
- Extraction et validation des données de la requête
- Conversion OID → UserID via UserService
- Création des Commands
- Appel des Command Handlers
- Retour des réponses HTTP appropriées (201 Created, 200 OK)
- Gestion des erreurs avec logging structuré

### 2. Interface AuthenticatedRequest

**Fichier:** `src/api/types/AuthenticatedRequest.ts`

```typescript
import {Request} from "express";

export interface AuthenticatedRequest extends Request {
    userID: string;
}
```

**Problème résolu:**

Avant, on devait écrire partout:
```typescript
const OID = (req as any).userID as string;  // ❌ Double "as"
```

Maintenant:
```typescript
public async createStock(req: AuthenticatedRequest, res: Response) {
    const OID = req.userID;  // ✅ Typé correctement
}
```

**Avantages:**
- Typage fort pour `req.userID` (ajouté par le middleware d'authentification)
- Réduction drastique des type assertions (`as`)
- Auto-complétion IDE
- Détection d'erreurs à la compilation

### 3. Routes API v2

**Fichier:** `src/api/routes/StockRoutesV2.ts` (modifié)

```typescript
const manipulationController = new StockControllerManipulation(
    createStockHandler,
    addItemHandler,
    updateQuantityHandler,
    userService
);

// Manipulation routes
router.post("/stocks", async (req, res) => {
    await manipulationController.createStock(req as any, res);
});

router.post("/stocks/:stockId/items", async (req, res) => {
    await manipulationController.addItemToStock(req as any, res);
});

router.patch("/stocks/:stockId/items/:itemId", async (req, res) => {
    await manipulationController.updateItemQuantity(req as any, res);
});
```

**Note:** Le `req as any` dans les routes est nécessaire car Express type `req` comme `Request` standard, mais notre controller attend `AuthenticatedRequest`. C'est acceptable ici car le middleware d'authentification garantit la présence de `userID`.

## Routes API

### POST /api/v2/stocks - Créer un stock

**Request:**
```json
POST /api/v2/stocks
Authorization: Bearer <token>

{
  "label": "Stock Cuisine",
  "description": "Produits alimentaires périssables",
  "category": "alimentation"
}
```

**Response (201 Created):**
```json
{
  "id": 42,
  "label": "Stock Cuisine",
  "description": "Produits alimentaires périssables",
  "category": "alimentation",
  "items": []
}
```

**Validations:**
- Label: minimum 3 caractères, maximum 50 caractères
- Description: non vide
- Category: non vide
- UserID: extrait du token JWT

---

### POST /api/v2/stocks/:stockId/items - Ajouter un item

**Request:**
```json
POST /api/v2/stocks/42/items
Authorization: Bearer <token>

{
  "label": "Tomates",
  "description": "Tomates fraîches",
  "quantity": 10,
  "minimumStock": 3
}
```

**Response (201 Created):**
```json
{
  "id": 42,
  "label": "Stock Cuisine",
  "items": [
    {
      "ID": 1,
      "LABEL": "Tomates",
      "DESCRIPTION": "Tomates fraîches",
      "QUANTITY": 10,
      "minimumStock": 3
    }
  ]
}
```

**Validations:**
- Label: non vide, pas de duplicate (case-insensitive)
- Quantity: >= 0
- MinimumStock: par défaut 1

---

### PATCH /api/v2/stocks/:stockId/items/:itemId - Mettre à jour la quantité

**Request:**
```json
PATCH /api/v2/stocks/42/items/1
Authorization: Bearer <token>

{
  "quantity": 25
}
```

**Response (200 OK):**
```json
{
  "id": 42,
  "label": "Stock Cuisine",
  "items": [
    {
      "ID": 1,
      "LABEL": "Tomates",
      "QUANTITY": 25,
      "minimumStock": 3
    }
  ]
}
```

**Validations:**
- Quantity: >= 0
- Item doit exister dans le stock

## Tests

### Tests du Controller

**Fichier:** `tests/api/controllers/StockControllerManipulation.test.ts`

Structure avec describe imbriqués:

```typescript
describe('StockControllerManipulation', () => {
    describe('createStock()', () => {
        describe('when the handler call is successful', () => {
            it('should return 201 and the created stock', async () => {
                // Test happy path
            })
        })

        describe('when the handler call fails', () => {
            it('should call sendError', async () => {
                // Test error handling
            })
        })
    })

    describe('addItemToStock()', () => { /* ... */ })
    describe('updateItemQuantity()', () => { /* ... */ })
})
```

**Couverture:**
- Happy paths (201 Created, 200 OK)
- Error handling (sendError appelé)
- Validation des réponses

### Tests de l'entité Stock

**Fichier:** `tests/domain/stock-management/common/entities/Stock.test.ts`

Ajout de 12 nouveaux tests pour les méthodes métier utilisées en production:

```typescript
describe('Stock', () => {
    describe('addItem()', () => {
        describe('when adding a valid item', () => { /* ... */ })
        describe('when label is empty', () => { /* ... */ })
        describe('when quantity is negative', () => { /* ... */ })
        describe('when item with same label already exists', () => { /* ... */ })
        describe('when item with same label but different case', () => { /* ... */ })
    })

    describe('updateItemQuantity()', () => {
        describe('when updating with a valid quantity', () => { /* ... */ })
        describe('when quantity is negative', () => { /* ... */ })
        describe('when item does not exist', () => { /* ... */ })
    })

    describe('getLowStockItems()', () => {
        describe('when no items are low on stock', () => { /* ... */ })
        describe('when some items are low on stock', () => { /* ... */ })
    })

    describe('hasLowStockItems()', () => {
        describe('when there are no low stock items', () => { /* ... */ })
        describe('when there are low stock items', () => { /* ... */ })
    })
})
```

**Total:** 53 tests unitaires domaine ✅ tous passent

## Gestion des erreurs

### Logging structuré

```typescript
try {
    const stock = await this.createStockHandler.handle(command);
    rootMain.info(`createStock OID=${OID} stockId=${stock.id}`);
    res.status(HTTP_CODE_CREATED).json(stock);
} catch (err) {
    rootException(err as Error);        // Application Insights
    sendError(res, err as CustomError); // Response client
}
```

**Logs envoyés à Application Insights:**
- `rootMain.info()` - Opérations réussies avec contexte (OID, stockId)
- `rootException()` - Exceptions avec stack trace complète

### Réponses d'erreur

La fonction `sendError()` gère automatiquement:
- `ValidationError` → 400 Bad Request
- `NotFoundError` → 404 Not Found
- `DatabaseError` → 500 Internal Server Error
- Autres erreurs → 500 avec message générique

## Principes DDD appliqués

### Séparation des responsabilités

| Couche | Responsabilité | Exemple |
|--------|----------------|---------|
| **API** | HTTP, validation format, auth | StockControllerManipulation |
| **Application** | Orchestration, use cases | CreateStockCommandHandler |
| **Domain** | Logique métier, règles business | Stock.addItem() |
| **Infrastructure** | Persistence, DB | PrismaStockCommandRepository |

### Logique métier dans le domaine

```typescript
// ✅ CORRECT - Logique dans l'entité Stock
class Stock {
    addItem(params: {...}): StockItem {
        // Validation métier
        if (!params.label || params.label.trim() === '') {
            throw new Error('Item label cannot be empty');
        }

        // Règle business: pas de duplicates
        const existingItem = this.items.find(
            item => item.LABEL.toLowerCase() === params.label.toLowerCase()
        );
        if (existingItem) {
            throw new Error(`Item "${params.label}" already exists`);
        }

        const newItem = new StockItem(/* ... */);
        this.items.push(newItem);
        return newItem;
    }
}
```

### Value Objects pour validation

```typescript
// StockLabel - Encapsulation + validation
export class StockLabel {
    private readonly value: string;
    private static readonly MIN_LENGTH = 3;
    private static readonly MAX_LENGTH = 50;

    constructor(label: string) {
        if (typeof label !== "string") {
            throw new Error("Stock label must be a string.");
        }
        const normalized = label.trim();
        if (normalized.length < StockLabel.MIN_LENGTH) {
            throw new Error(`Stock label must be at least ${StockLabel.MIN_LENGTH} characters.`);
        }
        this.value = normalized;
    }

    public getValue(): string {
        return this.value;
    }
}
```

## Qualité du code

### Minimisation des type assertions

**Avant (code legacy):**
```typescript
const OID = (req as any).userID as string;           // ❌ Double "as"
const stock = mockData as any as Stock;               // ❌ Double "as"
sendError(res, err as CustomError);                   // ❌ "as" nécessaire mais dupliqué
```

**Après (nouveau code):**
```typescript
// Controller
public async createStock(req: AuthenticatedRequest, res: Response) {
    const OID = req.userID;  // ✅ Pas de "as"
}

// Tests
const mockStock: Partial<Stock> = { /* ... */ };  // ✅ Partial au lieu de "as any"
```

**"as" restants (justifiés):**
- `err as Error` dans les catch blocks (TypeScript type err comme `unknown`)
- `req as any` dans les routes Express (limitation du typage Express)
- `err as CustomError` pour sendError (pattern établi dans la codebase)

### Conventions de nommage

- **Interfaces:** `IStockCommandRepository`, `AuthenticatedRequest`
- **DTOs:** `CreateStockCommand`, `AddItemToStockCommand`
- **Handlers:** `CreateStockCommandHandler` (suffixe Handler)
- **Controllers:** `StockControllerManipulation` (suffixe Controller)
- **Value Objects:** `StockLabel`, `StockDescription`, `Quantity`

## Prochaines étapes

### Documentation à compléter (issue séparée)

- [ ] README architecture DDD/CQRS
- [ ] ADR (Architecture Decision Record) - Migration DDD
- [ ] Diagramme de flux CQRS (READ vs WRITE)
- [ ] Guide de contribution avec patterns DDD

### Améliorations futures (hors scope issue #37)

- [ ] Validation des payloads avec Joi ou Zod
- [ ] Pagination des listes de stocks
- [ ] Events domain pour audit trail
- [ ] Cache Redis pour la READ side

## Références

- [Issue #37](https://github.com/SandrineCipolla/stockhub_back/issues/37) - Implémentation DDD/CQRS
- [PR #40](https://github.com/SandrineCipolla/stockhub_back/pull/40) - E2E tests (merged)
- [Martin Fowler - CQRS](https://martinfowler.com/bliki/CQRS.html)
- [DDD - Eric Evans](https://www.domainlanguage.com/ddd/)
