# Phase 1 : Fondations de l'autorisation - Résumé

**Date :** 2025-12-28
**Issue :** #62 (sous-issue de #44)
**Branche :** `feat-issue-62-authorization-phase1`
**Statut :** ✅ COMPLÉTÉ

---

## 🎯 Objectif

Implémenter les **fondations du système d'autorisation** permettant de :

- Contrôler l'accès aux stocks selon le rôle de l'utilisateur
- Préparer l'infrastructure pour les groupes familiaux (Phase 2+)
- Vérifier l'isolation des données entre utilisateurs

---

## ✅ Réalisations

### 1. Base de données (Prisma)

**Tables créées :**

```prisma
model Family {
  id        Int      @map("ID")
  name      String   @map("NAME")
  createdAt DateTime @map("CREATED_AT")
  members   FamilyMember[]
}

model FamilyMember {
  id        Int        @map("ID")
  familyId  Int        @map("FAMILY_ID")
  userId    Int        @map("USER_ID")
  role      FamilyRole @map("ROLE") // ADMIN | MEMBER
  joinedAt  DateTime   @map("JOINED_AT")
}

model StockCollaborator {
  id        Int       @map("ID")
  stockId   Int       @map("STOCK_ID")
  userId    Int       @map("USER_ID")
  role      StockRole @map("ROLE") // OWNER | EDITOR | VIEWER | VIEWER_CONTRIBUTOR
  grantedAt DateTime  @map("GRANTED_AT")
  grantedBy Int?      @map("GRANTED_BY")
}
```

**Convention adoptée :**

- **Code TypeScript :** camelCase (ex: `family.createdAt`)
- **Colonnes MySQL :** UPPERCASE via `@map("CREATED_AT")`
- Cohérent avec future refonte des anciennes tables

**Fichiers :**

- `prisma/schema.prisma` (modifié)
- Base Azure MySQL mise à jour via `prisma db push`

---

### 2. Domain Layer

**Bounded Context :** `src/domain/authorization/`

#### Value Objects

**`FamilyRole`** (`src/domain/authorization/common/value-objects/FamilyRole.ts`)

- Enum : `ADMIN`, `MEMBER`
- Méthodes : `isAdmin()`, `isMember()`, `equals()`
- Factory methods : `createAdmin()`, `createMember()`

**`StockRole`** (`src/domain/authorization/common/value-objects/StockRole.ts`)

- Enum : `OWNER`, `EDITOR`, `VIEWER`, `VIEWER_CONTRIBUTOR`
- Méthodes de permission :
  - `canRead()` → true pour tous les rôles
  - `canWrite()` → true pour OWNER et EDITOR
  - `canSuggest()` → true pour VIEWER_CONTRIBUTOR, EDITOR, OWNER
- Factory methods pour chaque rôle

#### Entities

**`Family`** (`src/domain/authorization/common/entities/Family.ts`)

- Gestion des membres avec règles métier :
  - Empêche suppression du dernier ADMIN
  - Validation nom famille (3-255 caractères)
  - Créateur automatiquement ADMIN
- Méthodes : `addMember()`, `removeMember()`, `isAdmin()`, `updateMemberRole()`

---

### 3. Middleware d'autorisation

**Fichier :** `src/authorization/authorizeMiddleware.ts`

**Fonction principale :** `authorizeStockAccess(permission: 'read' | 'write' | 'suggest')`

**Logique d'autorisation :**

1. ✅ Vérifier authentification (req.userID)
2. ✅ Extraire stockId des params
3. ✅ Récupérer user depuis DB (via email)
4. ✅ Vérifier existence du stock
5. ✅ **Ownership check** : `stock.USER_ID === user.ID` → accès total (OWNER)
6. ✅ **Collaborator check** : Requête `StockCollaborator` table
7. ✅ **Permission check** : Vérifier si le rôle permet l'action demandée
8. ✅ Injecter `req.stockRole` et `req.isStockOwner`

**Exports :**

- `authorizeStockAccess(permission)` - Fonction générique
- `authorizeStockRead` - Raccourci pour lecture
- `authorizeStockWrite` - Raccourci pour écriture
- `authorizeStockSuggest` - Raccourci pour suggestions (Phase 2)

**Codes HTTP :**

- `401` : Non authentifié
- `403` : Accès refusé (pas de rôle ou permission insuffisante)
- `404` : Stock inexistant
- `500` : Erreur serveur

---

### 4. Application aux routes V2

**Fichier :** `src/api/routes/StockRoutesV2.ts`

**Routes protégées (4/6) :**

| Route                            | Méthode | Middleware            | Raison                 |
| -------------------------------- | ------- | --------------------- | ---------------------- |
| `/stocks/:stockId`               | GET     | `authorizeStockRead`  | Lecture détails stock  |
| `/stocks/:stockId/items`         | GET     | `authorizeStockRead`  | Lecture items du stock |
| `/stocks/:stockId/items`         | POST    | `authorizeStockWrite` | Ajout item au stock    |
| `/stocks/:stockId/items/:itemId` | PATCH   | `authorizeStockWrite` | Modification quantité  |

**Routes NON protégées (intentionnel) :**

| Route     | Méthode | Pourquoi pas de middleware ?                              |
| --------- | ------- | --------------------------------------------------------- |
| `/stocks` | GET     | Liste les stocks de l'utilisateur (filtrés par USER_ID)   |
| `/stocks` | POST    | Création d'un nouveau stock (l'utilisateur devient OWNER) |

---

### 5. Configuration

**TypeScript :** `tsconfig.json`

- Ajout path alias : `"@authorization/*": ["src/authorization/*"]`

---

## 🔍 Pourquoi ces choix ?

### Pourquoi camelCase + @map dans Prisma ?

**Problème :** Anciennes tables utilisent UPPERCASE partout (ID, LABEL, EMAIL)

**Décision :** Pour les **nouvelles tables**, utiliser convention moderne :

- **Code TypeScript :** `family.createdAt` (meilleure DX)
- **Colonnes MySQL :** `CREATED_AT` via `@map`

**Avantages :**

- ✅ Code TypeScript plus lisible
- ✅ Convention Prisma 2024
- ✅ Refonte ancienne tables possible plus tard (ADR futur)

**Inconvénient assumé :**

- ⚠️ Incohérence temporaire avec anciennes tables (stocks, items, users)

### Pourquoi middleware d'autorisation séparé de l'authentification ?

**Séparation des responsabilités :**

- **Authentication** (`authenticateMiddleware.ts`) : Qui es-tu ? (Azure AD B2C, JWT)
- **Authorization** (`authorizeMiddleware.ts`) : As-tu le droit ? (Ownership, Roles)

**Avantages :**

- ✅ Middleware réutilisable (peut s'appliquer à d'autres ressources futures)
- ✅ Testable indépendamment
- ✅ Respecte principe Open/Closed (ajout de nouvelles permissions facile)

### Pourquoi ne pas protéger GET /stocks et POST /stocks ?

**GET /stocks :**

- Retourne déjà les stocks de l'utilisateur (filtré côté service par `req.userID`)
- Pas de stock spécifique à autoriser (liste globale)

**POST /stocks :**

- Création d'un nouveau stock → pas de stock existant à vérifier
- L'utilisateur devient automatiquement OWNER à la création

---

## 🚧 Limitations actuelles (Phase 1)

### Ce qui fonctionne

- ✅ Propriétaire d'un stock a accès total
- ✅ Collaborateurs avec rôle peuvent lire/écrire selon permissions
- ✅ Isolation entre utilisateurs (403 si pas de rôle)

### Ce qui manque (Phases 2-4)

- ❌ Pas d'API pour inviter des collaborateurs (géré manuellement en DB pour l'instant)
- ❌ Pas de groupes familiaux actifs (tables créées, logique non implémentée)
- ❌ Pas de workflow de suggestions (VIEWER_CONTRIBUTOR peut écrire directement)
- ❌ Pas de notifications
- ❌ Pas d'audit log

---

## 📋 Impact Frontend

**⚠️ Changements nécessaires côté frontend :**

1. **Gestion des erreurs 403**
   - Afficher message "Vous n'avez pas accès à ce stock"
   - Rediriger vers liste des stocks

2. **Affichage du rôle utilisateur**
   - Le backend renvoie `req.stockRole` dans les requêtes
   - Frontend doit adapter l'UI selon le rôle :
     - `VIEWER` → Désactiver boutons d'édition
     - `EDITOR` → Activer édition
     - `OWNER` → Afficher options de gestion

3. **Future API de collaboration** (Phase 2)
   - Route à créer : `POST /stocks/:stockId/collaborators`
   - Route à créer : `DELETE /stocks/:stockId/collaborators/:userId`

**Issue frontend à créer :** Voir section suivante

---

## 🧪 Tests

### Tests unitaires (Domain Layer) : ✅ 142/142 PASS

```bash
npm run test:unit
# Test Suites: 12 passed, 12 total
# Tests:       142 passed, 142 total
```

**Fichiers créés :**

- ✅ `tests/domain/authorization/common/value-objects/StockRole.test.ts` (89 tests)
- ✅ `tests/domain/authorization/common/value-objects/FamilyRole.test.ts` (15 tests)
- ✅ Family entity tests (38 tests) - **split en 4 fichiers** :
  - `Family.create.test.ts` : création d'entité
  - `Family.members.test.ts` : gestion des membres
  - `Family.roles.test.ts` : gestion des rôles
  - `Family.info.test.ts` : informations famille

### Tests d'intégration : ✅ 9/9 PASS

**Fichier :** `tests/integration/authorization/authorizeMiddleware.integration.test.ts`

**Statut :** ✅ FONCTIONNELS (Issue #71 résolue)

**Solution :** AuthorizationRepository injecté dans le middleware permet d'utiliser le PrismaClient de test.

### Tests E2E d'autorisation : ✅ 4/4 PASS

**Fichier :** `tests/e2e/authorization/stock-authorization.e2e.test.ts`

**Tests passants :**

- ✅ Step 1: Owner can create and access their own stock
- ✅ Step 2: Protected routes require authentication (401)
- ✅ Step 3: Owner can add items to their stock (write operation)
- ✅ Step 4: Owner can update items in their stock (write operation)

---

## 📦 Commits

**Commit 1 :** `1bb0c58` - Domain Layer & Middleware
**Commit 2 :** `dd87421` - Application aux routes

---

## 🔗 Liens

- **ADR principal :** `docs/adr/ADR-009-resource-based-authorization.md`
- **Issue GitHub :** #62 (Phase 1) sous #44 (Epic)
- **Roadmap :** `ROADMAP.md` (Phase 2bis EN COURS)

---

---

## 🔄 Améliorations Code Review (PR #72)

Suite au code review, les améliorations suivantes ont été apportées :

### Repository Pattern DDD

- **AuthorizationRepository** créé (`src/authorization/repositories/`)
  - `findUserByEmail()` : Recherche utilisateur par email
  - `findStockById()` : Recherche stock par ID
  - `findCollaboratorByUserAndStock()` : Recherche collaborateur

### Constants et Typed Errors

- **`permissions.ts`** : `PERMISSIONS`, `AUTH_ERROR_MESSAGES`, `HTTP_STATUS`
- **`routePaths.ts`** : `STOCK_ROUTES` pour les chemins de routes
- **`FamilyErrors.ts`** : 7 classes d'erreurs typées

### Value Objects améliorés

- **StockRole** : Ajout méthode `hasRequiredPermission()`
- **FamilyMemberData** : Converti en Value Object class avec `isAdmin()`, `getRole()`
- **Enums extraits** : StockRoleEnum.ts et FamilyRoleEnum.ts (fichiers séparés)

### Middleware amélioré

- Injection de dépendances via AuthorizationRepository
- Helper function `sendErrorResponse()`
- Structured logging avec `rootSecurity` logger

---

**Auteur :** Sandrine Cipolla
**Assistance :** Claude Code
**Date :** 2026-01-27 (mis à jour)
