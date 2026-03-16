# Prompt Claude Code — Back #75 + #93 : Aligner modèle items et shape API GET /stocks

## Contexte

**Issues** : #75 + #93 — une seule PR  
**Repo** : `stockhub_back`  
**Gap identifié** (audit préalable déjà fait, ne pas re-auditer) :

1. `GET /api/v2/stocks` → retourne `{ id, label, description, category }` — pas d'items, pas d'agrégats
2. `GET /api/v2/stocks/:id` → retourne `[stock]` **array-wrappé** — pas d'items, pas d'agrégats
3. `GET /api/v2/stocks/:id/items` → retourne les items **sans `status`**
4. `StockItem` n'a pas de `getStatus()`, `Stock` n'a pas de `getCriticalItemsCount()`
5. `StockWithoutItems` et `StockSummary` sont identiques et minimaux (4 champs seulement)
6. Prisma schema inclut `items: Item[]` mais les requêtes ne font **pas** `include: { items: true }`

---

## Shape cible

### `GET /api/v2/stocks` — liste

```typescript
Array<{
  id: number;
  label: string;
  description: string;
  category?: string;
  totalItems: number;
  totalQuantity: number;
  criticalItemsCount: number; // items status "critical" ou "out-of-stock"
}>;
```

### `GET /api/v2/stocks/:id` — détail (doit retourner un objet, pas un array)

```typescript
{
  id: number
  label: string
  description: string
  category?: string
  totalItems: number
  totalQuantity: number
  criticalItemsCount: number
  items: Array<{
    id: number
    label: string
    description?: string
    quantity: number            // valeur brute (pas objet { value: ... })
    minimumStock?: number
    status: "optimal" | "low" | "critical" | "out-of-stock" | "overstocked"
    unit?: string
  }>
}
```

---

## Règles de calcul du status item

```
quantity === 0                     → "out-of-stock"
quantity <= minimumStock           → "critical"
quantity <= minimumStock * 1.5     → "low"
quantity > minimumStock * 3        → "overstocked"
sinon                              → "optimal"
```

Si `minimumStock` est `null` ou `undefined`, utiliser `1` comme valeur par défaut.

---

## Modifications à apporter — dans l'ordre

### 1. Entité `StockItem` — ajouter `getStatus()`

Localiser l'entité (probablement `src/stocks/domain/entities/StockItem.ts`).
Ajouter la méthode `getStatus()` en respectant la structure existante du Value Object `Quantity`.

```typescript
getStatus(): "optimal" | "low" | "critical" | "out-of-stock" | "overstocked" {
  const qty = this.quantity.value   // adapter si quantity est déjà un number
  const min = this.minimumStock ?? 1
  if (qty === 0) return "out-of-stock"
  if (qty <= min) return "critical"
  if (qty <= min * 1.5) return "low"
  if (qty > min * 3) return "overstocked"
  return "optimal"
}
```

### 2. Entité `Stock` — ajouter `getCriticalItemsCount()`

Localiser l'entité (probablement `src/stocks/domain/entities/Stock.ts`).
`getTotalItems()` et `getTotalQuantity()` existent peut-être déjà — vérifier et compléter.

```typescript
getCriticalItemsCount(): number {
  return this.items.filter(
    item => item.getStatus() === "critical" || item.getStatus() === "out-of-stock"
  ).length
}
```

### 3. Repository — ajouter `include: { items: true }`

Localiser le repository Prisma (probablement `src/stocks/infrastructure/repositories/StockRepository.ts`).

Dans les méthodes `findAll()` et `findById()`, ajouter l'include :

```typescript
// findAll()
return await prisma.stock.findMany({
  where: { userId },
  include: { items: true }, // ← ajouter
});

// findById()
return await prisma.stock.findUnique({
  where: { id },
  include: { items: true }, // ← ajouter
});
```

### 4. Mapper / DTO — consolider `StockWithoutItems` et `StockSummary`

Localiser les types (probablement dans `src/stocks/application/dtos/` ou `src/stocks/domain/`).

Remplacer les deux types minimaux par un seul `StockSummaryDto` incluant les agrégats :

```typescript
export interface StockSummaryDto {
  id: number;
  label: string;
  description: string;
  category?: string;
  totalItems: number;
  totalQuantity: number;
  criticalItemsCount: number;
}

export interface StockItemDto {
  id: number;
  label: string;
  description?: string;
  quantity: number; // flatten du Value Object
  minimumStock?: number;
  status: 'optimal' | 'low' | 'critical' | 'out-of-stock' | 'overstocked';
  unit?: string;
}

export interface StockDetailDto extends StockSummaryDto {
  items: StockItemDto[];
}
```

Créer ou mettre à jour le mapper pour produire ces DTOs depuis les entités domain :

```typescript
export function toStockSummaryDto(stock: Stock): StockSummaryDto {
  return {
    id: stock.id,
    label: stock.label,
    description: stock.description,
    category: stock.category,
    totalItems: stock.getTotalItems(),
    totalQuantity: stock.getTotalQuantity(),
    criticalItemsCount: stock.getCriticalItemsCount(),
  };
}

export function toStockDetailDto(stock: Stock): StockDetailDto {
  return {
    ...toStockSummaryDto(stock),
    items: stock.items.map(item => ({
      id: item.id,
      label: item.label,
      description: item.description,
      quantity: item.quantity.value, // flatten
      minimumStock: item.minimumStock,
      status: item.getStatus(),
      unit: item.unit,
    })),
  };
}
```

### 5. Controller — corriger le array-wrap et utiliser les nouveaux DTOs

Localiser le controller (probablement `src/stocks/infrastructure/controllers/StockController.ts`).

```typescript
// GET /stocks — retourner un array de StockSummaryDto
async getAllStocks(req, res) {
  const stocks = await this.stockService.getAllStocks(userId)
  return res.json(stocks.map(toStockSummaryDto))   // pas de wrap supplémentaire
}

// GET /stocks/:id — retourner UN objet StockDetailDto (pas un array !)
async getStockById(req, res) {
  const stock = await this.stockService.getStockById(id)
  if (!stock) return res.status(404).json({ message: "Stock not found" })
  return res.json(toStockDetailDto(stock))   // objet seul, pas [stock]
}
```

---

## Tests à ajouter / mettre à jour

### Unitaires — `StockItem.getStatus()`

```typescript
describe("StockItem", () => {
  describe("when calling getStatus()", () => {
    it("should return 'out-of-stock' when quantity is 0", ...)
    it("should return 'critical' when quantity equals minimumStock", ...)
    it("should return 'critical' when quantity is below minimumStock", ...)
    it("should return 'low' when quantity is between min and min * 1.5", ...)
    it("should return 'optimal' in normal range", ...)
    it("should return 'overstocked' when quantity exceeds min * 3", ...)
    it("should use 1 as default minimumStock when not set", ...)
  })
})
```

### Unitaires — `Stock.getCriticalItemsCount()`

```typescript
describe("Stock", () => {
  describe("when calling getCriticalItemsCount()", () => {
    it("should count items with status critical or out-of-stock", ...)
    it("should return 0 when all items are optimal", ...)
  })
})
```

### Intégration — shape de réponse API

Vérifier que les tests d'intégration existants sur `GET /stocks` et `GET /stocks/:id`
sont mis à jour pour asserter la nouvelle shape (agrégats + items).

```bash
npm run test:unit
npm run test:integration
```

---

## Conventional commit et PR

```bash
git checkout -b feat/align-api-items-shape

git add -A
git commit -m "feat(stocks): align GET /stocks response shape with frontend

- Add getStatus() method on StockItem entity
- Add getCriticalItemsCount() aggregate on Stock entity
- Add include items in Prisma queries (findAll, findById)
- Consolidate StockWithoutItems/StockSummary into StockSummaryDto
- Add StockDetailDto and StockItemDto with computed status
- Fix GET /stocks/:id returning array instead of single object
- Closes #75
- Closes #93"

git push origin feat/align-api-items-shape
```

**PR titre** : `feat(stocks): align API response shape with frontend — closes #75 #93`

---

## Checklist avant PR

- [ ] `npm run test:unit` → 0 échec
- [ ] `npm run test:integration` → 0 échec
- [ ] `npm run type-check` → 0 erreur TypeScript
- [ ] `npm run lint` → 0 warning
- [ ] `GET /api/v2/stocks` → array avec agrégats, pas de wrap
- [ ] `GET /api/v2/stocks/:id` → objet seul avec items + agrégats (pas array !)
- [ ] Chaque item a un champ `status` calculé
- [ ] `GET /api/v1/stocks` intact (ne pas toucher les routes V1)
