# Prompt Claude Code — Back #75 + #93 : Aligner modèle items et shape API GET /stocks

## Contexte

Deux issues liées qui doivent être traitées dans une seule PR :

- **#75** — Migrate stock properties → items with calculated aggregates
- **#93** — Consolidate visualization models / align GET /stocks avec frontend

Ces deux issues bloquent **Front #99** (StockDetailPage).

---

## Objectif

Le frontend attend une shape précise sur `GET /api/v2/stocks` et `GET /api/v2/stocks/:id`.
Il faut aligner le modèle backend (DDD) avec ce que le frontend consomme réellement,
en ajoutant les aggregates calculés manquants.

---

## Étape 0 — Audit préalable (lire avant de modifier quoi que ce soit)

```bash
# 1. Lire la shape actuelle retournée par l'API
cat src/stocks/infrastructure/controllers/StockController.ts

# 2. Lire le ViewModel / DTO de réponse actuel
find src -name "*.dto.ts" -o -name "*ViewModel*" -o -name "*Mapper*" | head -20

# 3. Lire l'entité Stock DDD
find src -name "Stock.ts" | grep -v test | grep -v node_modules

# 4. Lire l'entité StockItem / Item DDD
find src -name "StockItem.ts" -o -name "Item.ts" | grep -v test | grep -v node_modules

# 5. Vérifier la migration Prisma actuelle
cat prisma/schema.prisma

# 6. Lire itemsAPI.ts côté frontend pour voir la shape attendue
# (si accessible via le projet front monté)
```

Rapporte le contenu de ces fichiers avant de continuer.

---

## Étape 1 — Identifier le gap entre shape actuelle et shape attendue

### Shape attendue par le frontend (`itemsAPI.ts` / `useItems.ts`)

Le frontend s'attend à recevoir sur `GET /api/v2/stocks/:id` :

```typescript
{
  id: number
  label: string
  description: string
  category?: string
  items: Array<{
    id: number
    label: string
    description?: string
    quantity: number          // valeur brute (pas objet)
    minimumStock?: number
    status: "optimal" | "low" | "critical" | "out-of-stock" | "overstocked"
    unit?: string
  }>
  // Aggregates calculés
  totalItems: number
  totalQuantity: number
  criticalItemsCount: number  // items avec status "critical" ou "out-of-stock"
}
```

Sur `GET /api/v2/stocks` (liste) :

```typescript
Array<{
  id: number;
  label: string;
  description: string;
  category?: string;
  totalItems: number;
  totalQuantity: number;
  criticalItemsCount: number;
}>;
```

### Règles de calcul des statuts items

```
quantity === 0                    → "out-of-stock"
quantity <= minimumStock          → "critical"
quantity <= minimumStock * 1.5    → "low"
quantity > minimumStock * 3       → "overstocked"  (optionnel)
sinon                             → "optimal"
```

Si `minimumStock` est null/undefined, utiliser `1` comme valeur par défaut.

---

## Étape 2 — Modifications à apporter

### 2a. Value Object ou méthode sur StockItem — calcul du statut

Dans l'entité `StockItem` (ou `Item`), ajouter une méthode `getStatus()` :

```typescript
getStatus(): "optimal" | "low" | "critical" | "out-of-stock" | "overstocked" {
  const qty = this.quantity.value  // ou this.quantity si déjà number
  const min = this.minimumStock ?? 1
  if (qty === 0) return "out-of-stock"
  if (qty <= min) return "critical"
  if (qty <= min * 1.5) return "low"
  if (qty > min * 3) return "overstocked"
  return "optimal"
}
```

> Adapter selon la structure réelle de l'entité (Value Object Quantity ou number brut).
> Ne pas casser les tests unitaires existants sur StockItem.

### 2b. Aggregates sur l'entité Stock

Dans l'entité `Stock`, s'assurer que ces méthodes existent et sont correctes :

```typescript
getTotalItems(): number        // items.length
getTotalQuantity(): number     // sum de quantity.value sur tous les items
getCriticalItemsCount(): number // items dont status est "critical" ou "out-of-stock"
```

> Ces méthodes existent peut-être déjà (le README les mentionne). Vérifier et compléter si besoin.

### 2c. DTO / ViewModel de réponse

Créer ou mettre à jour le mapper/DTO pour produire la shape attendue.
Chercher l'emplacement exact (ex: `StockResponseDto`, `StockMapper`, `toViewModel`).

```typescript
// StockDetailResponseDto ou équivalent
export interface StockDetailResponse {
  id: number;
  label: string;
  description: string;
  category?: string;
  totalItems: number;
  totalQuantity: number;
  criticalItemsCount: number;
  items: StockItemResponse[];
}

export interface StockItemResponse {
  id: number;
  label: string;
  description?: string;
  quantity: number;
  minimumStock?: number;
  status: 'optimal' | 'low' | 'critical' | 'out-of-stock' | 'overstocked';
  unit?: string;
}
```

### 2d. Controller — utiliser le nouveau DTO

Vérifier que `StockController.getStockById()` et `StockController.getAllStocks()`
utilisent bien le nouveau mapper pour sérialiser la réponse.

---

## Étape 3 — Tests

### Tests unitaires à mettre à jour / ajouter

```bash
# Localiser les tests existants
find tests -name "StockItem*" -o -name "Stock.test*" | grep -v node_modules
```

Ajouter des tests pour `getStatus()` sur StockItem :

```typescript
describe("StockItem.getStatus()", () => {
  it("should return out-of-stock when quantity is 0", ...)
  it("should return critical when quantity <= minimumStock", ...)
  it("should return low when quantity <= minimumStock * 1.5", ...)
  it("should return optimal otherwise", ...)
  it("should use 1 as default minimumStock when not set", ...)
})
```

Vérifier que les tests existants passent toujours :

```bash
npm run test:unit
```

---

## Étape 4 — Vérification manuelle

```bash
# Démarrer le serveur
npm run start:dev

# Tester les endpoints (adapter l'URL et le token)
curl -X GET http://localhost:3006/api/v2/stocks \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .

curl -X GET http://localhost:3006/api/v2/stocks/1 \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

Vérifier que la réponse contient bien :

- `totalItems`, `totalQuantity`, `criticalItemsCount` au niveau du stock
- `status` calculé sur chaque item
- `quantity` comme nombre (pas objet `{ value: ... }`)

---

## Étape 5 — Conventional commit et PR

```bash
git checkout -b feat/align-api-items-shape

# Après modifications et tests verts :
git add -A
git commit -m "feat(stocks): align GET /stocks response shape with frontend

- Add getStatus() method on StockItem entity
- Add getCriticalItemsCount() aggregate on Stock entity
- Update StockResponseDto to include calculated aggregates
- Flatten quantity value object to number in response
- Closes #75
- Closes #93"

git push origin feat/align-api-items-shape
```

Ouvrir une PR vers `main` avec le titre :
`feat(stocks): align API response shape with frontend — closes #75 #93`

---

## Points d'attention

- **Ne pas modifier** le schéma Prisma ni les migrations — uniquement la couche service/mapper/DTO
- **Preserving DDD** : `Quantity` reste un Value Object dans le domaine, on ne le flatten qu'au niveau du DTO de sortie
- **Backward compat** : si `GET /api/v1/stocks` existe toujours, ne pas le modifier
- **Tests** : `npm run test:unit` doit passer avant le push (le hook pre-push vérifiera)

---

## Résultat attendu

Après cette PR :

- `GET /api/v2/stocks` retourne la liste avec aggregates
- `GET /api/v2/stocks/:id` retourne le détail complet avec items statusés
- **Front #99 StockDetailPage peut être implémentée sans mock**
