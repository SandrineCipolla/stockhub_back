# Issue #42 - DTO Mapper Implementation

**Date :** 2025-12-09
**Statut :** ✅ Complété
**Durée :** ~4h
**Branche :** `feat/issue-42-dto-mapper`

---

## 🎯 Objectif

Créer un **DTO Mapper** pour transformer les entités du domaine DDD en objets JSON simples compatibles avec le Frontend React.

### Problème initial

Le Backend retournait des structures DDD complexes :
```json
{
  "id": 1,
  "label": "Café Arabica",
  "items": [
    {
      "label": "Sac 1kg",
      "quantity": { "value": 50 }  // ← Value Object
    }
  ],
  "minimumStock": 10
}
```

Le Frontend attendait un format plat :
```json
{
  "id": 1,
  "label": "Café Arabica",
  "quantity": 50,              // ← Somme calculée
  "unit": "kg",
  "minimumStock": 10,
  "status": "optimal"          // ← Logique métier calculée
}
```

---

## ✅ Ce qui a été fait

### 1. Création du DTO et Mapper

**Fichiers créés :**
- `src/api/dto/StockDTO.ts` - Interfaces DTO pour l'API
- `src/api/dto/mappers/StockMapper.ts` - Mapper domaine → API
- `tests/unit/api/dto/mappers/StockMapper.test.ts` - 16 tests unitaires

**Fonctionnalités :**
- Extraction des Value Objects (`StockLabel`, `StockDescription`)
- Calcul de la quantité totale (somme de tous les items)
- Calcul du stock minimum total
- **Calcul du statut automatique** selon les règles métier :
  - `out-of-stock` : quantity === 0
  - `critical` : quantity < 10% minimumStock
  - `low` : quantity < 30% minimumStock
  - `optimal` : quantity >= 30% minimumStock

### 2. Intégration dans la couche Visualization

**Modifications :**
- `StockVisualizationService` : Retourne maintenant des `Stock` entités complètes
- `PrismaStockVisualizationRepository` : Charge les stocks **avec leurs items** via Prisma
- `StockControllerVisualization` : Utilise `StockMapper.toDTO()` avant de retourner la réponse

### 3. Tests sans `as` type assertions

**Helpers créés :**
- `tests/helpers/stockMockFactory.ts` - Factory pour créer des mocks de Stock
- `tests/helpers/requestMockFactory.ts` - Factory pour créer des mocks de Request/Response

**Amélioration :** Tous les tests utilisent maintenant des factories type-safe au lieu de `as unknown as Type`.

### 4. Décision architecturale : `label` vs `name`

**Initialement :** Le DTO utilisait `name` (pensant que c'était ce que le Frontend attendait)

**Problème identifié :** Incohérence avec la base de données qui utilise `LABEL`

**Solution finale :** Uniformisation sur `label` partout :
- ✅ Base de données : `LABEL`
- ✅ Domaine DDD : `StockLabel`
- ✅ DTO API : `label`
- ✅ Frontend : `label` (à modifier)

**Raison :** Cohérence avec la source de vérité (BDD) + moins de confusion conceptuelle

---

## 🐛 Problèmes rencontrés et solutions

### Problème 1 : Tests E2E cassés après implémentation

**Symptôme :**
```
Expected: s.name === 'E2E Test Stock'
Received: s.label === 'E2E Test Stock'
```

**Cause :** Les tests E2E cherchaient `name` mais le DTO retournait `label`

**Solution :**
```typescript
// Avant
const createdStock = stocks.find(s => s.name === 'E2E Test Stock');

// Après
const createdStock = stocks.find(s => s.label === 'E2E Test Stock');
```

**Fichier modifié :** `tests/e2e/stock-management/stock-manipulation.e2e.test.ts`

---

### Problème 2 : Tests d'intégration échouaient

**Symptôme :**
```
- Expected: name: 'Stock Alimentation'
+ Received: label: 'Stock Alimentation'
```

**Cause :** Tests d'intégration vérifiaient l'ancien format sans les champs DTO

**Solution :**
```typescript
expect(response.body[0]).toMatchObject({
  id: expect.any(Number),
  label: 'Stock Alimentation',        // ← Changé de 'name'
  description: '...',
  quantity: expect.any(Number),       // ← Nouveau champ
  unit: expect.any(String),           // ← Nouveau champ
  minimumStock: expect.any(Number),   // ← Nouveau champ
  status: expect.any(String)          // ← Nouveau champ
});
```

**Fichier modifié :** `tests/integration/stock-management/api/StockApiV2.integration.test.ts`

---

### Problème 3 : Tests unitaires du Controller cassés

**Symptôme :**
```
Type '{ value: 42 }' is missing property 'empty' from UserIdentifier
```

**Cause :** Les mocks n'implémentaient pas complètement l'interface `UserIdentifier`

**Solution :** Création d'un helper dédié
```typescript
// tests/helpers/requestMockFactory.ts
export function createMockUserIdentifier(value: number = 42) {
  return {
    empty: false,
    value
  };
}
```

**Résultat :** Plus besoin de `as` pour typer, objets type-safe

---

### Problème 4 : TypeScript erreurs sur `stock.category`

**Symptôme :**
```
Property 'toString' does not exist on type 'never'
```

**Cause :** TypeScript ne pouvait pas inférer si `category` était `string` ou `enum`

**Solution :**
```typescript
// Avant
const category = typeof stock.category === 'string'
  ? stock.category
  : stock.category.toString();  // ← Erreur TS

// Après
let category: string;
if (typeof stock.category === 'string') {
  category = stock.category;
} else {
  category = String(stock.category);  // ← OK
}
```

---

### Problème 5 : Repository ne chargeait pas les items

**Symptôme :** `stock.items` était toujours un tableau vide

**Cause :** Prisma ne chargeait pas automatiquement les relations

**Solution :** Ajouter `include: { items: true }` dans les requêtes Prisma
```typescript
// Avant
const stock = await this.prisma.stocks.findFirst({
  where: { ID: stockId }
});

// Après
const stock = await this.prisma.stocks.findFirst({
  where: { ID: stockId },
  include: { items: true }  // ← Charger les items
});
```

---

## 📊 Résultats

### Tests
- ✅ **16/16** tests unitaires StockMapper
- ✅ **6/6** tests unitaires Controller
- ✅ **3/3** tests intégration
- ✅ **7/7** tests E2E
- ✅ **0** erreur TypeScript
- ✅ **0** utilisation de `as` pour forcer les types

### Performance
- Pas d'impact négatif (une seule transformation en fin de chaîne)
- Requête Prisma optimisée avec `include`

### Code Quality
- Tous les endpoints V2 retournent maintenant des DTOs cohérents
- Séparation claire : Domaine ≠ API
- Facilement testable et maintenable

---

## 🔄 Impact sur le Frontend

### Changements nécessaires

Le Frontend doit remplacer `name` par `label` dans les types et composants.

**Fichier à modifier :** `src/types/stock.ts`
```typescript
// Avant
export interface Stock {
  id: number;
  name: string;  // ← À changer
  // ...
}

// Après
export interface Stock {
  id: number;
  label: string;  // ← Cohérent avec API
  // ...
}
```

**Chercher/remplacer dans tout le Frontend :**
- `stock.name` → `stock.label`
- `s.name` → `s.label`
- etc.

**Estimation :** ~5-10 fichiers à modifier, ~10 minutes de travail

---

## 📝 Commits réalisés

1. **feat: create DTO interfaces and StockMapper for API responses**
   - Création DTO, Mapper, tests, mock factories

2. **feat: integrate StockMapper in visualization layer**
   - Intégration dans Service, Repository, Controller

3. **test: update all tests to use 'label' in DTOs**
   - Mise à jour de tous les tests (unitaires, intégration, E2E)

---

## 🎓 Leçons apprises

### Ce qui a bien fonctionné
- **TDD** : Écrire les tests avant le mapper a clarifié les besoins
- **Mock factories** : Éviter `as` rend le code plus robuste
- **Commits atomiques** : 3 commits séparés facilitent le review

### Ce qui a pris du temps
- **Synchronisation tests** : Mettre à jour tests unitaires + intégration + E2E prend du temps
- **Décision `name` vs `label`** : Hésitation initiale, mais bon choix final

### Bonnes pratiques appliquées
- ✅ Un seul endroit pour la transformation (StockMapper)
- ✅ Tests exhaustifs (16 tests pour le mapper)
- ✅ Documentation des règles métier dans les commentaires
- ✅ Type-safety sans `as`

---

## 🚀 Prochaines étapes

### Court terme
1. ✅ Committer les changements (FAIT)
2. ⏳ Mettre à jour le Frontend pour utiliser `label`
3. ⏳ Fermer l'issue GitHub #42

### Moyen terme (Issue #37)
- Utiliser le même pattern pour les endpoints POST/PATCH
- Créer des DTOs pour les commandes (CreateStockCommand, etc.)

### Long terme
- Documenter dans les ADRs le choix du pattern DTO Mapper
- Ajouter des DTOs pour les autres modules (predictions, containers)

---

**Auteur :** Sandrine Cipolla
**Assistant :** Claude Code (Sonnet 4.5)
**Date de finalisation :** 2025-12-09
