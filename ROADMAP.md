# 🗺️ StockHub Backend - Roadmap

**Date de création:** 2025-12-09
**Version actuelle:** 1.0.0
**Statut:** DDD Domain Layer complet, API Layer à finaliser

---

## 📋 Vue d'ensemble

### ✅ Déjà fait (PR #38 mergée)
- Architecture DDD/CQRS avec bounded context `stock-management`
- **Module Manipulation (WRITE SIDE):**
  - Value Objects: `StockLabel`, `StockDescription`, `Quantity`
  - Entity: `Stock` (Aggregate Root)
  - Commands: `CreateStockCommand`, `AddItemToStockCommand`, `UpdateItemQuantityCommand`
  - Command Handlers implémentés
  - `PrismaStockCommandRepository` implémenté
  - Tests unitaires + intégration
- **Module Visualization (READ SIDE):**
  - Service + Repository + Controller
  - Routes GET complètes

### ❌ Manque actuellement
1. **API Layer pour Manipulation** (Issue #37) - BLOQUANT
2. **DTO Mapper** pour compatibilité Frontend
3. **Couche d'autorisation** (feedback encadrant)
4. **ADRs** (Architecture Decision Records)
5. **Audit npm** dans CI/CD

---

## 🎯 Phases de développement

### Phase 1: Déblocage connexion Frontend (CRITIQUE)
**Objectif:** Permettre au Frontend de consommer l'API
**Durée estimée:** 3-4h
**Issues associées:** #37, #42 (nouveau), #43 (nouveau)

#### Issue #42: Créer DTO Mapper pour compatibilité Frontend
**Priorité:** HAUTE
**Dépendances:** Aucune
**Description:**
Le Frontend attend un format différent du Backend:

**Frontend attend:**
```json
{
  "id": 1,
  "name": "Café Arabica",
  "quantity": 50,
  "unit": "kg",
  "minimumStock": 10,
  "status": "optimal"
}
```

**Backend retourne actuellement:**
```json
{
  "id": 1,
  "label": "Café Arabica",
  "items": [{
    "label": "Sac 1kg",
    "quantity": { "value": 50 }
  }],
  "minimumStock": 10
}
```

**Tâches:**
- [ ] Créer `src/api/dto/StockDTO.ts`
- [ ] Mapper `label` → `name`
- [ ] Aplatir `quantity.value` → `quantity`
- [ ] Ajouter champ `unit` (string)
- [ ] Implémenter logique de calcul `status`:
  - `critical`: quantity < 10% minimumStock
  - `low`: quantity < 30% minimumStock
  - `optimal`: quantity >= 30% minimumStock
  - `out-of-stock`: quantity === 0
- [ ] Ajouter tests unitaires pour le mapper

**Acceptation:**
```typescript
// Exemple d'utilisation
const dto = StockMapper.toDTO(stock);
// dto.name === stock.label.value
// dto.status === 'low' si quantity < 30% minimumStock
```

---

#### Issue #37: Implémenter API Layer Manipulation (EXISTANTE)
**Priorité:** HAUTE
**Dépendances:** #42 (DTO Mapper)
**État actuel:** Domain Layer complet, API Layer manquant

**Tâches:**
- [ ] Créer `src/api/controllers/StockControllerManipulation.ts`
- [ ] Implémenter endpoint `POST /api/v2/stocks`
  - Body: `{ label, description, minimumStock, userId }`
  - Valider données avec Zod
  - Appeler `CreateStockCommandHandler`
  - Retourner DTO via `StockMapper.toDTO()`
- [ ] Implémenter endpoint `POST /api/v2/stocks/:stockId/items`
  - Body: `{ label, quantity, expirationDate? }`
  - Appeler `AddItemToStockCommandHandler`
  - Retourner DTO mis à jour
- [ ] Implémenter endpoint `PATCH /api/v2/stocks/:stockId/items/:itemId`
  - Body: `{ quantity }`
  - Appeler `UpdateItemQuantityCommandHandler`
  - Retourner DTO mis à jour
- [ ] Ajouter routes dans `src/api/routes/StockRoutesV2.ts`
- [ ] Tests manuels Postman/REST Client
- [ ] Tests E2E Playwright (scénario complet CRUD)

**Acceptation:**
```bash
# Créer stock
POST /api/v2/stocks
→ 201 Created, retourne DTO

# Ajouter item
POST /api/v2/stocks/1/items
→ 200 OK, retourne DTO avec items

# Modifier quantité
PATCH /api/v2/stocks/1/items/1
→ 200 OK, retourne DTO mis à jour
```

---

#### Issue #43: Tests E2E pour scénario CRUD complet
**Priorité:** HAUTE
**Dépendances:** #37
**Description:**

Créer un test E2E Playwright qui valide le flux complet:
1. Authentification utilisateur
2. Création d'un stock
3. Ajout de 3 items
4. Modification quantité d'un item
5. Vérification état final (status calculé correctement)

**Tâches:**
- [ ] Créer `tests/e2e/stock-manipulation.spec.ts`
- [ ] Configurer authentification Azure AD (Issue #41 liée)
- [ ] Implémenter scénario complet
- [ ] Vérifier DTOs retournés
- [ ] Vérifier cohérence données en BDD

**Acceptation:**
```bash
npx playwright test tests/e2e/stock-manipulation.spec.ts
→ 100% passing
```

---

### Phase 2: Qualité & Sécurité (POST-MVP)
**Objectif:** Adresser feedback encadrant
**Durée estimée:** 6-8h
**Issues à créer:** #44, #45, #46

#### Issue #44: Implémenter couche d'autorisation
**Priorité:** MOYENNE
**Description:**

Actuellement: seulement **authentification** (JWT Azure AD)
Manque: **autorisation** (qui peut accéder à quoi)

**Tâches:**
- [ ] Définir modèle de permissions (RBAC ou ABAC)
- [ ] Créer middleware `authorize(resource, action)`
- [ ] Appliquer aux routes:
  - User peut seulement lire/modifier SES stocks
  - Admin peut tout faire
- [ ] Tests unitaires middleware
- [ ] Documenter dans ADR

**Exemple:**
```typescript
router.post('/stocks',
  passport.authenticate('oauth-bearer', { session: false }),
  authorize('stock', 'create'), // NOUVEAU
  stockController.createStock
);
```

---

#### Issue #45: Ajouter audit npm à la CI/CD
**Priorité:** MOYENNE
**Description:**

Feedback encadrant: "manque dans la CI/CD : npm audit pour les dépendances"

**Tâches:**
- [ ] Ajouter `npm audit` dans `.github/workflows/ci.yml`
- [ ] Configurer seuils d'alerte (high/critical)
- [ ] Bloquer CI si vulnérabilités critiques
- [ ] Ajouter badge dans README

**Acceptation:**
```yaml
# .github/workflows/ci.yml
- name: Security Audit
  run: |
    npm audit --audit-level=high
```

---

#### Issue #46: Documenter décisions techniques (ADRs)
**Priorité:** HAUTE (pour RNCP)
**Description:**

Feedback encadrant: "Il manque cependant des ADR ou l'équivalent qui **justifient les choix**"

**Tâches:**
- [ ] Créer `docs/adr/` (Architecture Decision Records)
- [ ] ADR-001: Pourquoi DDD/CQRS pour ce projet
- [ ] ADR-002: Choix de Prisma vs TypeORM
- [ ] ADR-003: Azure AD B2C pour auth
- [ ] ADR-004: Pourquoi tests sur Value Objects
- [ ] ADR-005: Stratégie de versioning API (V2 sans V1)
- [ ] ADR-006: Choix MySQL Azure vs autres clouds

**Template ADR:**
```markdown
# ADR-XXX: [Titre]

Date: 2025-12-09
Statut: Accepté

## Contexte
[Problème à résoudre]

## Décision
[Solution choisie]

## Conséquences
[Avantages / Inconvénients]

## Alternatives considérées
[Autres options évaluées]
```

---

### Phase 3: Features avancées (POST-RNCP)
**Objectif:** Compléter features ML et Leisure Mode
**Durée estimée:** 15-20h

#### Issue #47: Module ML Predictions
**Priorité:** BASSE
**Description:**

Implémenter prédictions de rupture de stock via scikit-learn

**Tâches:**
- [ ] Créer bounded context `predictions`
- [ ] Script Python pour entraînement modèle
- [ ] API endpoint `GET /api/v2/predictions/:stockId`
- [ ] Tests avec données historiques

---

#### Issue #48: Leisure Mode - Unités de mesure
**Priorité:** BASSE
**Description:**

Ajouter support des unités de mesure Leisure (bouteilles, verres)

**Tâches:**
- [ ] Migration Prisma: ajouter champ `unit` à `Item`
- [ ] Modifier Value Object `Quantity` pour inclure unité
- [ ] Mettre à jour DTOs

---

#### Issue #49: Container Management
**Priorité:** BASSE
**Description:**

Gestion des contenants (fûts, bouteilles, caisses)

**Tâches:**
- [ ] Créer bounded context `containers`
- [ ] Endpoints CRUD containers
- [ ] Relation `Item` ↔ `Container`

---

## 📊 Priorisation globale

### Avant connexion Frontend (CRITIQUE)
1. ✅ Issue #42 - DTO Mapper (1h)
2. ✅ Issue #37 - API Layer (2h)
3. ✅ Issue #43 - Tests E2E (1h)

### Avant présentation RNCP (IMPORTANTE)
4. ✅ Issue #46 - ADRs (3h)
5. ⚠️ Issue #44 - Autorisation (4h)
6. ⚠️ Issue #45 - npm audit (30min)

### Post-RNCP (OPTIONNEL)
7. 🔮 Issue #47 - ML Predictions
8. 🔮 Issue #48 - Leisure Units
9. 🔮 Issue #49 - Containers

---

## 🔄 Workflow recommandé

### Pour chaque issue
1. **Créer branche:** `git checkout -b feat/issue-42-dto-mapper`
2. **Développer:** TDD (tests → code → refactor)
3. **Vérifier qualité:**
   ```bash
   npm run lint
   npm run type-check
   npm run test:unit
   npm run test:integration
   ```
4. **Commit:** Conventional Commits
   ```bash
   git commit -m "feat(api): add DTO mapper for frontend compatibility"
   ```
5. **Push + PR:** `gh pr create --title "feat: DTO Mapper (Issue #42)"`
6. **Review:** Attendre validation encadrant si possible
7. **Merge:** Squash and merge dans `main`

---

## 📅 Timeline suggérée

| Semaine | Focus | Issues |
|---------|-------|--------|
| S1 (Actuelle) | Déblocage Frontend | #42, #37, #43 |
| S2 | Documentation RNCP | #46 (ADRs) |
| S3 | Sécurité | #44, #45 |
| S4+ | Features avancées | #47, #48, #49 |

---

## ✅ Critères de succès

### MVP Frontend-Backend connecté
- [x] DDD Architecture complète
- [ ] API CRUD fonctionnelle (POST/PATCH)
- [ ] DTOs compatibles Frontend
- [ ] Tests E2E passants
- [ ] Documentation technique (ADRs)

### Production-ready
- [ ] Couche d'autorisation
- [ ] npm audit dans CI/CD
- [ ] Tests coverage > 80%
- [ ] Lighthouse Performance > 90

---

**Auteur:** Sandrine Cipolla
**Dernière mise à jour:** 2025-12-09
**Reviewer:** [Encadrant RNCP]
