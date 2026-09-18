# ADR 001: Migration vers une architecture DDD/CQRS

**Statut:** ✅ Accepté et en cours d'implémentation

**Date:** Novembre 2024

**Contexte:** Migration progressive du code legacy vers DDD/CQRS

**Décideurs:** Équipe de développement StockHub

---

## Besoin métier

StockHub est une application de gestion de stocks personnelle destinée à des individus ou des familles. Le domaine est volontairement restreint — l'encadrant RNCP l'a lui-même noté : _"ton domaine reste très restreint en termes de complexité"_. Alors pourquoi DDD/CQRS sur un périmètre aussi limité ?

**1. Les invariants métier existent, même sur un domaine simple.**
Même restreint, le domaine porte des règles réelles : un item ne peut pas avoir un label vide, la quantité ne peut pas être négative, deux items du même stock ne peuvent pas avoir le même label. Sans DDD, ces règles se dispersent entre controllers, services et repositories — et finissent par être dupliquées ou oubliées. Le DDD impose de les centraliser dans le domaine, là où elles ne peuvent pas être contournées.

**2. Le projet RNCP exige la démonstration de maîtrise architecturale.**
Ce projet est un support de soutenance professionnelle. Choisir une architecture Transaction Script aurait été plus rapide mais n'aurait pas permis de démontrer la capacité à structurer une application selon les standards de l'industrie. Le DDD/CQRS est un choix délibéré d'apprentissage et de démonstration — pas un sur-engineering aveugle.

**3. La complexité augmente avec les features.**
Le domaine initial (stocks + items) est simple, mais le projet intègre ensuite un module d'autorisation par rôles familiaux et des prédictions IA. Sans séparation claire des couches, chaque ajout de feature risque de dégrader l'ensemble. La base DDD permet d'absorber cette complexité sans réécriture.

**Pourquoi CQRS en complément ?**
Les besoins de lecture (liste de stocks, détail d'un stock) et d'écriture (ajouter un item, modifier une quantité) ont des profiles très différents. La lecture doit être rapide et retourner des DTOs plats ; l'écriture doit passer par la validation du domaine. Séparer les deux chemin (Query / Command) permet d'optimiser chaque côté indépendamment.

---

## Contexte et problème

### Situation actuelle (Legacy)

Le code actuel du backend StockHub présente plusieurs problèmes architecturaux:

```typescript
// ❌ Exemple de code legacy
class StockService {
  async createStock(label: string, description: string, userId: number) {
    // Validation dans le service (mauvais endroit)
    if (!label || label.trim().length < 3) {
      throw new Error('Label must be at least 3 characters');
    }
    if (label.length > 100) {
      throw new Error('Label too long');
    }

    // Logique métier éparpillée
    const normalizedLabel = label.trim();

    // Appel direct au repository (couplage fort)
    const stock = await this.writeStockRepository.createStock(normalizedLabel, description, userId);

    // Logique métier après la persistence (incohérent)
    if (stock.items && stock.items.length > 0) {
      // ... traitement
    }

    return stock;
  }
}
```

### Problèmes identifiés

1. **Logique métier dispersée**
   - Validation dans les services
   - Règles business dans les controllers
   - Aucune protection des invariants

2. **Couplage fort**
   - Services couplés directement à Prisma
   - Impossible de tester sans DB
   - Difficile de changer de technologie de persistence

3. **Manque de clarté**
   - Pas de séparation READ/WRITE
   - Même modèle pour affichage et modification
   - Requêtes non optimisées

4. **Testabilité limitée**
   - Tests nécessitent une DB
   - Mocks complexes
   - Difficile de tester les règles métier isolément

5. **Évolutivité compromise**
   - Ajouter une règle métier impacte plusieurs fichiers
   - Risque de régression élevé
   - Code difficile à maintenir

---

## Décision

Nous adoptons une architecture **Domain-Driven Design (DDD)** avec séparation **CQRS (Command Query Responsibility Segregation)** pour le module de gestion des stocks.

### Principes adoptés

1. **Logique métier dans le domaine**
   - Entities et Value Objects contiennent les règles business
   - Protection des invariants par encapsulation
   - Auto-validation des Value Objects

2. **Séparation READ/WRITE (CQRS)**
   - READ: Queries optimisées pour l'affichage
   - WRITE: Commands avec validation métier stricte

3. **Indépendance de l'infrastructure**
   - Le domaine ne connaît pas Prisma
   - Interfaces repository dans le domaine
   - Implémentations dans l'infrastructure

4. **Architecture en couches**
   - API → Application → Domain → Infrastructure
   - Dépendances unidirectionnelles (vers le domaine)

---

## Implémentation

### 1. Couche Domain

#### Value Objects

Exemple : `src/domain/stock-management/common/value-objects/StockLabel.ts` (validation encapsulée, impossible de construire une instance invalide).

**Avantages:**

- ✅ Impossible de créer un StockLabel invalide
- ✅ Validation centralisée (un seul endroit)
- ✅ Réutilisable partout
- ✅ Auto-documenté (règles visibles dans le code)

#### Entities avec logique métier

Exemple : `src/domain/stock-management/common/entities/Stock.ts` (`addItem()` rejette label vide, quantité négative et doublons case-insensitive).

**Avantages:**

- ✅ Règles métier centralisées
- ✅ Impossible de créer un état invalide
- ✅ Testable sans DB
- ✅ Code expressif (révèle l'intention métier)

### 2. Séparation CQRS

#### READ Side (Visualization)

Service : `src/domain/stock-management/visualization/services/StockVisualizationService.ts`. Repository : `src/infrastructure/stock-management/visualization/repositories/PrismaStockVisualizationRepository.ts`.

#### WRITE Side (Manipulation)

Handler : `src/domain/stock-management/manipulation/use-cases/AddItemToStockCommandHandler.ts`. Repository : `src/infrastructure/stock-management/manipulation/repositories/PrismaStockCommandRepository.ts`.

**Avantages:**

- ✅ READ: Performances optimales (pas de chargement inutile)
- ✅ WRITE: Validation métier garantie
- ✅ Séparation des préoccupations claire

### 3. Testabilité améliorée

#### Tests unitaires domaine (sans DB)

Exemple : `tests/domain/stock-management/common/entities/Stock.test.ts` (règles métier testées sans base de données, dont le rejet des doublons insensible à la casse).

#### Tests d'intégration (avec DB)

Exemple : `tests/integration/stock-management/repositories/PrismaStockCommandRepository.integration.test.ts` (validation métier garantie par l'entité, vérifiée avec une vraie base via TestContainers).

---

## Conséquences

### Positives ✅

1. **Maintenabilité**
   - Code auto-documenté (intentions claires)
   - Changements localisés (une règle = un endroit)
   - Moins de bugs (validation automatique)

2. **Testabilité**
   - 53 tests unitaires domaine (rapides, sans DB)
   - Tests d'intégration ciblés
   - Couverture métier complète

3. **Performance**
   - READ optimisé (queries spécialisées)
   - WRITE avec validation (protection des données)

4. **Évolutivité**
   - Facile d'ajouter des règles métier
   - Architecture extensible (Domain Events, Event Sourcing)
   - Migration progressive possible

5. **Onboarding**
   - Architecture claire et standard
   - Patterns reconnus (DDD, CQRS)
   - Documentation riche

### Négatives ⚠️

1. **Complexité initiale**
   - Plus de fichiers (séparation en couches)
   - Courbe d'apprentissage DDD
   - **Mitigation:** Documentation + exemples

2. **Migration progressive**
   - Code legacy coexiste avec nouveau code
   - Deux patterns en parallèle temporairement
   - **Mitigation:** Plan de migration clair, issue #37

3. **Overhead pour opérations simples**
   - CRUD simple nécessite Command + Handler + Repository
   - Plus de code que direct Prisma
   - **Mitigation:** Accepté car gains long terme > coût court terme

4. **Performance WRITE**
   - Chargement complet de l'agrégat (stock + items)
   - Plus coûteux que UPDATE direct
   - **Mitigation:** Acceptable car WRITE << READ en volume

---

## Alternatives considérées

### Alternative 1: Transaction Script (garder le legacy)

**Principe:** Services avec logique métier + appels directs DB

```typescript
class StockService {
    async createStock(...) {
        // Validation + logique + persistence dans le service
    }
}
```

**Pourquoi rejeté:**

- ❌ Logique dispersée
- ❌ Difficile à tester
- ❌ Couplage fort Prisma
- ❌ Ne scale pas avec la complexité

### Alternative 2: Active Record

**Principe:** Modèles Prisma avec méthodes métier

```typescript
// Étendre les modèles Prisma
class StockModel extends PrismaStock {
  addItem() {
    /* logique */
  }
}
```

**Pourquoi rejeté:**

- ❌ Couplage fort ORM
- ❌ Modèle DB ≠ modèle métier
- ❌ Difficile de changer de DB
- ❌ Tests nécessitent DB

### Alternative 3: CQRS complet avec Event Sourcing

**Principe:** Séparation DB READ/WRITE + historique événements

**Pourquoi rejeté (pour l'instant):**

- ⚠️ Trop complexe pour les besoins actuels
- ⚠️ Infrastructure additionnelle (message queue)
- ⚠️ Eventual consistency (complexité applicative)
- ✅ **Possible évolution future** si besoin

---

## Métriques de succès

### Qualité du code

- ✅ 53 tests unitaires domaine (vs 0 avant)
- ✅ Couverture métier 100% (méthodes utilisées)
- ✅ Zéro console.log dans nouveau code
- ✅ Logging structuré (Application Insights)

### Performance

- ✅ READ: Queries optimisées (SELECT avec COUNT)
- ⚠️ WRITE: +20ms latence acceptable (validation métier)

### Maintenabilité

- ✅ Temps ajout règle métier: ~10min (vs 2h avant)
- ✅ Localisation changement: 1 fichier (vs 3-5 avant)
- ✅ Bugs régression: 0 (tests domaine)

### Adoption équipe

- ✅ Documentation complète (README + ADR)
- ✅ Exemples concrets (PR #40, feature/ddd-stock-manipulation-routes)
- ✅ Patterns clairs et reproductibles

---

## Plan de migration

### Phase 1: ✅ Complété (Nov-Déc 2024)

- [x] Module manipulation en DDD/CQRS
- [x] Tests unitaires domaine
- [x] Documentation architecture
- [x] ADR 001

### Phase 2: 🔄 En cours (Déc 2024)

- [ ] Migration routes legacy vers DDD
- [ ] Suppression ancien StockService
- [ ] Suppression writeStockRepository

### Phase 3: 📅 Planifié (2025 Q1)

- [ ] Module utilisateurs en DDD
- [ ] Module authentification en DDD
- [ ] Refactoring complet

### Phase 4: 📅 Futur

- [ ] Domain Events (audit trail)
- [ ] Event Sourcing (si nécessaire)
- [ ] Séparation DB READ/WRITE (si volumes élevés)

---

## Références

### Standards DDD/CQRS

- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [CQRS - Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
- [Implementing DDD - Vaughn Vernon](https://vaughnvernon.com/)

### Implémentation StockHub

- [Issue #37 - Migration DDD](https://github.com/SandrineCipolla/stockhub_back/issues/37)
- [PR #40 - E2E Tests](https://github.com/SandrineCipolla/stockhub_back/pull/40)
- [docs/technical/ddd-cqrs-guide.md](../technical/ddd-cqrs-guide.md)
- [docs/archive/ddd-manipulation-routes.md](../archive/ddd-manipulation-routes.md)

---

## Notes de révision

| Date     | Auteur     | Changement                        |
| -------- | ---------- | --------------------------------- |
| Nov 2024 | Équipe Dev | Création initiale                 |
| Déc 2024 | Équipe Dev | Ajout métriques de succès Phase 1 |

---

**Décision finale:** ✅ **ADOPTÉ**

Cette architecture est maintenant le standard pour tout nouveau code backend StockHub.
