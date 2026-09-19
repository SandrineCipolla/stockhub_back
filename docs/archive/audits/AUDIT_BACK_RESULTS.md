# Audit StockHub V2 Back-end — Résultats

> **Date** : 2026-03-09
> **Branche** : `feat-issue-24-upgrade-node22`
> **Mode** : Diagnostic uniquement — aucune modification de code

---

## AUDIT 1 — Architecture DDD et qualité du code

> Critères RNCP : Ce2.4 #1 #2 #3

---

### 1. Inventaire complet des fichiers `.ts` par dossier

#### `src/domain/` — Couche DOMAIN

| Fichier                                                                                              | Couche DDD  | Rôle                                 | Remarque                                                                    |
| ---------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------ | --------------------------------------------------------------------------- |
| `domain/stock-management/common/entities/Stock.ts`                                                   | DOMAIN      | Entité agrégat Stock avec invariants | ⚠️ Importe `StockCategory` depuis `@prisma/client` — violation DDD          |
| `domain/stock-management/common/entities/StockItem.ts`                                               | DOMAIN      | Entité item de stock                 | ⚠️ `quantity` est `public` (mutable sans validation)                        |
| `domain/stock-management/common/value-objects/Quantity.ts`                                           | DOMAIN      | Value Object quantité                | ⚠️ `value` est `public` (pas `private readonly`) — pas pleinement immutable |
| `domain/stock-management/common/value-objects/StockLabel.ts`                                         | DOMAIN      | Value Object libellé                 | ✅ `private readonly`, validation longueur                                  |
| `domain/stock-management/common/value-objects/StockDescription.ts`                                   | DOMAIN      | Value Object description             | ✅ `private readonly`, validation longueur max                              |
| `domain/stock-management/manipulation/commands(Request)/CreateStockCommand.ts`                       | APPLICATION | Command CQRS création stock          | Nom de dossier avec parenthèses — convention inhabituelle                   |
| `domain/stock-management/manipulation/commands(Request)/AddItemToStockCommand.ts`                    | APPLICATION | Command CQRS ajout item              | Idem                                                                        |
| `domain/stock-management/manipulation/commands(Request)/UpdateItemQuantityCommand.ts`                | APPLICATION | Command CQRS màj quantité            | Idem                                                                        |
| `domain/stock-management/manipulation/commands(Request)/UpdateStockCommand.ts`                       | APPLICATION | Command CQRS màj stock               | Idem                                                                        |
| `domain/stock-management/manipulation/commands(Request)/DeleteStockCommand.ts`                       | APPLICATION | Command CQRS suppression stock       | Idem                                                                        |
| `domain/stock-management/manipulation/commands(Request)/DeleteItemCommand.ts`                        | APPLICATION | Command CQRS suppression item        | Idem                                                                        |
| `domain/stock-management/manipulation/command-handlers(UseCase)/CreateStockCommandHandler.ts`        | APPLICATION | Use case création stock              | Respecte le pattern — dépend de l'interface IStockCommandRepository         |
| `domain/stock-management/manipulation/command-handlers(UseCase)/AddItemToStockCommandHandler.ts`     | APPLICATION | Use case ajout item                  | ✅                                                                          |
| `domain/stock-management/manipulation/command-handlers(UseCase)/UpdateItemQuantityCommandHandler.ts` | APPLICATION | Use case màj quantité                | ✅                                                                          |
| `domain/stock-management/manipulation/command-handlers(UseCase)/UpdateStockCommandHandler.ts`        | APPLICATION | Use case màj stock                   | ✅                                                                          |
| `domain/stock-management/manipulation/command-handlers(UseCase)/DeleteStockCommandHandler.ts`        | APPLICATION | Use case suppression stock           | ✅                                                                          |
| `domain/stock-management/manipulation/command-handlers(UseCase)/DeleteItemCommandHandler.ts`         | APPLICATION | Use case suppression item            | ✅                                                                          |
| `domain/stock-management/manipulation/repositories/IStockCommandRepository.ts`                       | DOMAIN      | Interface repository command (port)  | ✅ Abstraction pure — aucune dépendance infra                               |
| `domain/stock-management/visualization/queries/IStockVisualizationRepository.ts`                     | DOMAIN      | Interface repository query (port)    | ✅ Abstraction pure                                                         |
| `domain/stock-management/visualization/services/StockVisualizationService.ts`                        | APPLICATION | Service de lecture CQRS              | ✅ Dépend uniquement des interfaces domain                                  |
| `domain/stock-management/visualization/models/StockSummary.ts`                                       | DOMAIN      | Modèle de projection lecture         | ✅                                                                          |
| `domain/stock-management/visualization/models/StockWithoutItems.ts`                                  | DOMAIN      | Modèle de projection liste           | ✅                                                                          |
| `domain/authorization/common/entities/Family.ts`                                                     | DOMAIN      | Entité famille avec invariants       | ✅ Invariants solides (LastAdminError, etc.)                                |
| `domain/authorization/common/value-objects/FamilyRole.ts`                                            | DOMAIN      | Value Object rôle famille            | ✅ `private readonly`, `equals()` implémenté                                |
| `domain/authorization/common/value-objects/FamilyRoleEnum.ts`                                        | DOMAIN      | Enum rôles famille                   | ✅                                                                          |
| `domain/authorization/common/value-objects/StockRole.ts`                                             | DOMAIN      | Value Object rôle stock              | ✅ `private readonly`, `equals()`, `hasRequiredPermission()`                |
| `domain/authorization/common/value-objects/StockRoleEnum.ts`                                         | DOMAIN      | Enum rôles stock                     | ✅                                                                          |
| `domain/authorization/common/errors/FamilyErrors.ts`                                                 | DOMAIN      | Erreurs domaine famille              | ✅ Erreurs métier typées                                                    |

#### `src/infrastructure/` — Couche INFRASTRUCTURE

| Fichier                                                                                            | Couche DDD     | Rôle                                        | Remarque                                    |
| -------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------- | ------------------------------------------- |
| `infrastructure/stock-management/visualization/repositories/PrismaStockVisualizationRepository.ts` | INFRASTRUCTURE | Implémentation Prisma du repository query   | ✅ Implémente IStockVisualizationRepository |
| `infrastructure/stock-management/manipulation/repositories/PrismaStockCommandRepository.ts`        | INFRASTRUCTURE | Implémentation Prisma du repository command | ✅ Implémente IStockCommandRepository       |
| `infrastructure/stock-management/manipulation/types/prisma.ts`                                     | INFRASTRUCTURE | Types Prisma internes                       | ✅ Limité à l'infra                         |

#### `src/api/` — Couche PRESENTATION

| Fichier                                           | Couche DDD   | Rôle                                  | Remarque                                                   |
| ------------------------------------------------- | ------------ | ------------------------------------- | ---------------------------------------------------------- |
| `api/controllers/StockControllerVisualization.ts` | PRESENTATION | Controller HTTP lecture v2            | ⚠️ Importe `@core/errors` — alias non défini dans tsconfig |
| `api/controllers/StockControllerManipulation.ts`  | PRESENTATION | Controller HTTP écriture v2           | ⚠️ Importe `@core/errors` — même remarque                  |
| `api/routes/StockRoutesV2.ts`                     | PRESENTATION | Routeur Express v2 + composition root | ⚠️ Importe directement les implémentations infra (voir §4) |
| `api/routes/constants/routePaths.ts`              | PRESENTATION | Constantes chemins de routes          | ✅                                                         |
| `api/dto/StockDTO.ts`                             | APPLICATION  | DTO transfert données                 | ✅                                                         |
| `api/dto/mappers/StockMapper.ts`                  | APPLICATION  | Mapper entité → DTO                   | ✅                                                         |
| `api/types/AuthenticatedRequest.ts`               | PRESENTATION | Extension type Request Express        | ✅                                                         |
| `api/types/StockRequestTypes.ts`                  | PRESENTATION | Types requêtes typées                 | ✅                                                         |

#### `src/authorization/` — Couche PRESENTATION / INFRASTRUCTURE (hybride)

| Fichier                                                 | Couche DDD     | Rôle                                  | Remarque                                                           |
| ------------------------------------------------------- | -------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `authorization/authorizeMiddleware.ts`                  | PRESENTATION   | Middleware autorisation ressource     | ⚠️ Instancie `AuthorizationRepository` en interne (pas de DI pure) |
| `authorization/repositories/AuthorizationRepository.ts` | INFRASTRUCTURE | Repository Prisma pour l'autorisation | ⚠️ Non rattaché au dossier `infrastructure/`                       |
| `authorization/constants/permissions.ts`                | APPLICATION    | Constantes permissions                | ✅                                                                 |

#### `src/authentication/` — Couche INFRASTRUCTURE / PRESENTATION

| Fichier                                    | Couche DDD     | Rôle                                   | Remarque |
| ------------------------------------------ | -------------- | -------------------------------------- | -------- |
| `authentication/authenticateMiddleware.ts` | PRESENTATION   | Middleware authentification JWT Bearer | ✅       |
| `authentication/authBearerStrategy.ts`     | INFRASTRUCTURE | Stratégie Passport Azure B2C           | ✅       |

#### `src/config/` — HORS DDD (configuration transversale)

| Fichier                           | Couche DDD     | Rôle                       | Remarque                                                   |
| --------------------------------- | -------------- | -------------------------- | ---------------------------------------------------------- |
| `config/httpPortConfiguration.ts` | HORS DDD       | Configuration port HTTP    | ✅                                                         |
| `config/models.ts`                | HORS DDD       | Modèles de configuration   | ⚠️ Doublon avec `src/models.ts` ?                          |
| `config/openapi.config.ts`        | HORS DDD       | Configuration Swagger UI   | ✅                                                         |
| `config/runtimeMode.ts`           | HORS DDD       | Détection mode runtime     | ✅                                                         |
| `config/authenticationConfig.ts`  | INFRASTRUCTURE | Configuration Azure AD B2C | ✅                                                         |
| `authConfig.ts`                   | HORS DDD       | Config auth racine         | ⚠️ Doublon potentiel avec `config/authenticationConfig.ts` |

#### `src/Utils/` — HORS DDD (utilitaires transversaux)

| Fichier                | Couche DDD | Rôle                                  | Remarque                                    |
| ---------------------- | ---------- | ------------------------------------- | ------------------------------------------- |
| `Utils/logger.ts`      | HORS DDD   | Logger structuré (typescript-logging) | ✅                                          |
| `Utils/cloudLogger.ts` | HORS DDD   | Logger Application Insights           | ✅                                          |
| `Utils/httpCodes.ts`   | HORS DDD   | Constantes codes HTTP                 | ✅                                          |
| `Utils/itemFactory.ts` | HORS DDD   | Factory item (usage ?)                | ⚠️ À vérifier si utilisé (risque code mort) |
| `Utils/express.d.ts`   | HORS DDD   | Extension type Express                | ✅                                          |

#### `src/` racine — Code legacy V1 (HORS DDD structuré)

| Fichier                                | Couche DDD        | Rôle                                | Remarque                                                               |
| -------------------------------------- | ----------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| `controllers/stockController.ts`       | PRESENTATION V1   | Controller HTTP v1 (legacy)         | 🔴 Utilise `console.info` / `console.error` (violation règles logging) |
| `services/stockService.ts`             | APPLICATION V1    | Service métier v1 (legacy)          | ⚠️ Logique applicative sans DDD                                        |
| `services/userService.ts`              | APPLICATION V1    | Service utilisateur v1              | ⚠️ Partagé entre V1 et V2                                              |
| `services/readUserRepository.ts`       | INFRASTRUCTURE V1 | Repository lecture utilisateur      | ⚠️ SQL raw MySQL2, pas Prisma                                          |
| `services/writeUserRepository.ts`      | INFRASTRUCTURE V1 | Repository écriture utilisateur     | ⚠️ SQL raw MySQL2, pas Prisma                                          |
| `repositories/readStockRepository.ts`  | INFRASTRUCTURE V1 | Repository lecture stock (SQL raw)  | ⚠️ SQL raw MySQL2, pas Prisma                                          |
| `repositories/writeStockRepository.ts` | INFRASTRUCTURE V1 | Repository écriture stock (SQL raw) | ⚠️ SQL raw MySQL2, pas Prisma                                          |
| `routes/stockRoutes.ts`                | PRESENTATION V1   | Routes Express v1                   | ✅ Séparé de v2                                                        |
| `routes/userRoutes.ts`                 | PRESENTATION V1   | Routes utilisateur v1               | ✅                                                                     |
| `models.ts`                            | HORS DDD          | Modèles/types v1                    | ⚠️ Doublon avec `config/models.ts`                                     |
| `errors.ts`                            | HORS DDD          | Erreurs applicatives v1             | ⚠️ Coexiste avec erreurs domain v2                                     |
| `stockMapper.ts`                       | APPLICATION V1    | Mapper SQL → modèles v1             | ⚠️ Doublon avec `api/dto/mappers/StockMapper.ts`                       |
| `dbUtils.ts`                           | INFRASTRUCTURE V1 | Connexion MySQL2                    | ⚠️ Connexion raw, pas Prisma                                           |
| `configurationDb.ts`                   | INFRASTRUCTURE V1 | Configuration BDD                   | ⚠️ Doublon de configuration                                            |
| `initializeApp.ts`                     | HORS DDD          | Bootstrap application               | ✅ Composition root                                                    |
| `index.ts`                             | HORS DDD          | Point d'entrée                      | ✅                                                                     |
| `serverSetup/setupHttpServer.ts`       | HORS DDD          | Setup Express                       | ✅                                                                     |

---

### 2. Violations de la règle de dépendance DDD

#### 🔴 Violation critique — Domain importe de l'Infrastructure

**Fichier** : `src/domain/stock-management/common/entities/Stock.ts:4`

```typescript
import { StockCategory } from '@prisma/client';
```

Le domaine importe un type Prisma (infrastructure ORM). La règle de dépendance DDD impose que le domaine ne connaisse pas Prisma. La catégorie devrait être définie comme un enum domaine, et la conversion vers `StockCategory` Prisma devrait se faire dans la couche infrastructure.

#### ⚠️ Violation partielle — Présentation instancie directement l'Infrastructure

**Fichier** : `src/authorization/authorizeMiddleware.ts:31-32`

```typescript
const prisma = prismaClient ?? new PrismaClient();
const repository = new AuthorizationRepository(prisma);
```

Le middleware (présentation) crée lui-même son `AuthorizationRepository`. C'est géré partiellement par l'injection optionnelle (`prismaClient?`) mais ce n'est pas une injection propre via un conteneur DI.

**Fichier** : `src/api/routes/StockRoutesV2.ts:16-17`

```typescript
import { PrismaStockVisualizationRepository } from '@infrastructure/...';
import { PrismaStockCommandRepository } from '@infrastructure/...';
```

La couche route (présentation) importe et instancie directement les repositories Prisma. C'est acceptable dans un **composition root** dédié, mais idéalement ce câblage devrait être dans `initializeApp.ts`, pas dans le fichier de routes.

#### ⚠️ Violation de nommage — Commands dans le dossier `domain/`

Les dossiers `command-handlers(UseCase)` et `commands(Request)` contiennent du code **APPLICATION** (use cases, DTOs de commande) mais sont placés dans `src/domain/`. Ce devrait être dans `src/application/`.

---

### 3. Analyse des Value Objects — Immutabilité

| Value Object       | Champs `private readonly`   | Méthode `equals()` | Invariants              | Verdict     |
| ------------------ | --------------------------- | ------------------ | ----------------------- | ----------- |
| `Quantity`         | ❌ `value` est `public`     | ❌ Absente         | ✅ `value < 0` interdit | ⚠️ Partiel  |
| `StockLabel`       | ✅ `private readonly value` | ❌ Absente         | ✅ min/max longueur     | ⚠️ Partiel  |
| `StockDescription` | ✅ `private readonly value` | ❌ Absente         | ✅ non vide, max 200    | ⚠️ Partiel  |
| `StockRole`        | ✅ `private readonly value` | ✅ Présente        | ✅ enum validé          | ✅ Conforme |
| `FamilyRole`       | ✅ `private readonly value` | ✅ Présente        | ✅ enum validé          | ✅ Conforme |

**Problème `Quantity`** :

```typescript
// Actuel — value est public, donc mutable
export class Quantity {
  constructor(public value: number) { ... }
}
// Peut être modifié directement : quantity.value = -5 (bypass de l'invariant)
```

**Problème `StockItem`** :

```typescript
public quantity: number  // Mutable directement sans validation
private innerQuantity: Quantity  // Jamais mis à jour si quantity change
```

Le champ `quantity` (public) peut être modifié directement, contournant `innerQuantity` et ses invariants. Si `Stock.updateItemQuantity()` modifie `item.quantity` directement, `innerQuantity` devient désynchronisé.

---

### 4. Analyse des Entités — Invariants protégés

| Entité      | Factory `create()`                             | Invariants en lecture | Invariants en écriture                                               | Verdict        |
| ----------- | ---------------------------------------------- | --------------------- | -------------------------------------------------------------------- | -------------- |
| `Stock`     | ✅ `Stock.create()` avec validation            | N/A                   | ⚠️ `label`, `description`, `items` sont `public` (mutable librement) | ⚠️ Partiel     |
| `StockItem` | ❌ Pas de factory — constructeur public direct | N/A                   | ❌ `quantity` public sans validation                                 | ⚠️ Insuffisant |
| `Family`    | ✅ `Family.create()` avec 5 invariants         | ✅ LastAdminError     | ✅ UserAlreadyMemberError                                            | ✅ Conforme    |

---

### 5. Coexistence V1 legacy / V2 DDD

L'architecture présente **deux stacks parallèles** :

| Aspect       | Stack V1 (legacy)                    | Stack V2 (DDD/CQRS)                   |
| ------------ | ------------------------------------ | ------------------------------------- |
| Routes       | `src/routes/stockRoutes.ts`          | `src/api/routes/StockRoutesV2.ts`     |
| Controllers  | `src/controllers/stockController.ts` | `src/api/controllers/Stock*.ts`       |
| Services     | `src/services/stockService.ts`       | Domain use cases                      |
| Repositories | `src/repositories/*.ts` (MySQL2 raw) | `src/infrastructure/**/*.ts` (Prisma) |
| Logging      | `console.info/error` (violation !)   | `rootMain`, `rootException`           |

---

### Score global — Audit 1

| Critère                  | Score      | Détail                                                       |
| ------------------------ | ---------- | ------------------------------------------------------------ |
| Structure DDD présente   | ⚠️ Partiel | V2 bien structurée, mais V1 legacy coexiste                  |
| Règle de dépendance DDD  | ⚠️ Partiel | 1 violation critique (domain → Prisma), 2 partielles         |
| Value Objects immutables | ⚠️ Partiel | `Quantity` non immutable, `StockLabel`/`StockDescription` OK |
| Entités avec invariants  | ⚠️ Partiel | `Family` excellente, `Stock`/`StockItem` insuffisants        |
| Convention de nommage    | ⚠️ Partiel | Dossiers avec parenthèses atypiques                          |

**Score global : ⚠️ Partiel**

---

### Actions recommandées

#### 🔴 Bloquant (impact jury RNCP)

1. **Supprimer l'import `@prisma/client` dans `Stock.ts`** — créer un enum `StockCategory` dans le domaine et mapper dans l'infrastructure. C'est la violation DDD la plus visible pour un jury.

2. **Corriger `Quantity` : rendre `value` `private readonly`** — implémenter `equals()` et (optionnel) `add()`. Ajouter un commentaire d'invariant explicite.

3. **Documenter la coexistence V1/V2** — dans README ou ADR, expliquer que V1 est en cours de migration vers V2 (sinon le jury verra du code incohérent).

#### 🟡 Important (bonne pratique RNCP 7)

4. **Corriger `StockItem` : encapsuler la mutation de `quantity`** — exposer une méthode `updateQuantity(value: number): void` qui valide via `Quantity` et met à jour les deux champs.

5. **Déplacer les Commands/Handlers de `domain/` vers `application/`** — créer un dossier `src/application/` conforme à l'architecture DDD en 4 couches.

6. **Supprimer les `console.info/error` dans `controllers/stockController.ts`** — remplacer par `rootMain.info` / `rootException`.

7. **Déplacer `authorization/repositories/AuthorizationRepository.ts`** vers `infrastructure/authorization/` pour respecter la structure.

#### 🟢 Bonus (nice to have)

8. **Ajouter `equals()` aux Value Objects `StockLabel` et `StockDescription`** — pattern Value Object complet.

9. **Nettoyer les doublons** : `src/models.ts` vs `src/config/models.ts`, `src/stockMapper.ts` vs `src/api/dto/mappers/StockMapper.ts`, `src/authConfig.ts` vs `src/config/authenticationConfig.ts`.

10. **Renommer les dossiers** `command-handlers(UseCase)` et `commands(Request)` — les parenthèses sont non conventionnelles et peuvent poser des problèmes selon les OS/outils.

---

---

## AUDIT 2 — Sécurité et conformité OWASP/RGPD

> Critères RNCP : Ce2.4 #4 #6

---

### 1. Authentification

#### Couverture des routes

**`initializeApp.ts` (lignes 125-159)** — `authenticationMiddleware` appliqué sur **tous** les préfixes :

```
/api/v2  → authenticationMiddleware ✅
/api/v1  → authenticationMiddleware ✅
```

Les routes de documentation sont **non protégées** (intentionnellement) :

```
/api-docs       ← Swagger UI (public)
/api-docs.json  ← spec OpenAPI JSON (public)
/api-docs.yaml  ← spec OpenAPI YAML (public)
```

**Verdict** : ⚠️ Le choix de rendre les docs publiques n'est pas documenté (pas d'ADR, pas de commentaire). Pour un jury RNCP, il faudrait une justification explicite (ex: "routes publiques documentées conformément à l'ADR-003").

#### Validation des tokens JWT

La stratégie `passport-azure-ad` BearerStrategy valide :

- ✅ Signature (vérification via clés JWKS Azure B2C)
- ✅ Expiration (`exp` claim)
- ✅ Audience (`clientID` / `AZURE_ROPC_CLIENT_ID`)
- ⚠️ **`validateIssuer: false`** dans `src/authConfig.ts:19` — l'issuer du token n'est **pas validé**. Si un token valide d'un autre tenant Azure B2C était présenté avec la même audience, il serait accepté.

```typescript
// src/authConfig.ts:19
validateIssuer: false,  // ⚠️ Risque : issuer non vérifié
```

#### `loggingNoPII: false`

```typescript
// src/authConfig.ts:22
loggingNoPII: false,  // ⚠️ passport-azure-ad peut logger des PII (emails, OIDs)
```

---

### 2. Scan OWASP Top 10

#### A01 — Broken Access Control

**Routes V2 :**

| Route                                          | Auth middleware | Authz middleware                | Verdict |
| ---------------------------------------------- | --------------- | ------------------------------- | ------- |
| `GET /api/v2/stocks`                           | ✅              | — (filtre userId en base)       | ✅      |
| `GET /api/v2/stocks/:stockId`                  | ✅              | `authorizeStockRead` ✅         | ✅      |
| `GET /api/v2/stocks/:stockId/items`            | ✅              | `authorizeStockRead` ✅         | ✅      |
| `POST /api/v2/stocks`                          | ✅              | — (création, userId dans token) | ✅      |
| `POST /api/v2/stocks/:stockId/items`           | ✅              | `authorizeStockWrite` ✅        | ✅      |
| `PATCH /api/v2/stocks/:stockId/items/:itemId`  | ✅              | `authorizeStockWrite` ✅        | ✅      |
| **`PATCH /api/v2/stocks/:stockId`**            | ✅              | **❌ ABSENT**                   | **🔴**  |
| **`DELETE /api/v2/stocks/:stockId`**           | ✅              | **❌ ABSENT**                   | **🔴**  |
| `DELETE /api/v2/stocks/:stockId/items/:itemId` | ✅              | `authorizeStockWrite` ✅        | ✅      |

**`StockRoutesV2.ts` lignes 112-129 :**

```typescript
router.patch('/stocks/:stockId', async (req, res) => {
  await manipulationController.updateStock(req as UpdateStockRequest, res);
  // ← Pas d'authorizeStockWrite ici !
});

router.delete('/stocks/:stockId', async (req, res) => {
  await manipulationController.deleteStock(req as DeleteStockRequest, res);
  // ← Pas d'authorizeStockWrite ici !
});
```

**Impact** : Tout utilisateur authentifié peut modifier ou supprimer le stock de n'importe quel autre utilisateur.

**Routes V1 :** Aucun contrôle d'autorisation par ressource (pas de vérification que l'utilisateur est propriétaire du stock qu'il modifie ou supprime).

**Score A01** : ❌ Non conforme (2 routes V2 non protégées)

---

#### A02 — Cryptographic Failures

Grep `src/` pour clés/mots de passe hardcodés :

```
# Résultats : AUCUN secret hardcodé trouvé ✅
```

- `DB_PASSWORD` lu depuis `process.env` ✅
- `CLIENT_ID`, `AZURE_ROPC_CLIENT_ID` lus depuis `process.env` ✅
- `tenantName: 'stockhubb2c.onmicrosoft.com'` dans `authConfig.ts:3` — nom de tenant public, non sensible ✅

**Score A02** : ✅ Conforme

---

#### A03 — Injection (SQL / NoSQL)

Grep `src/` pour `$queryRaw`, `$executeRaw` (Prisma raw) : **aucun résultat** ✅

Les repositories V2 Prisma utilisent exclusivement les méthodes ORM paramétrées (`findMany`, `findUnique`, `create`, `update`, `delete`).

Les repositories V1 MySQL2 utilisent des requêtes paramétrées avec `?` :

```typescript
connection.query('SELECT * FROM stocks WHERE userId = ?', [userID])  ✅
connection.query('SELECT * FROM stocks WHERE id = ? AND userId = ?', [ID, userID])  ✅
```

**Score A03** : ✅ Conforme

---

#### A05 — Security Misconfiguration

**CORS :**

```typescript
// initializeApp.ts — configuration CORS
const originFn = (origin, callback) => {
  if (!origin) {
    callback(null, true);
    return;
  } // ⚠️ Requêtes sans origin toujours autorisées
  if (allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }
  if (vercelPreviewCors && origin.endsWith('.vercel.app')) {
    callback(null, true);
    return;
  }
  callback(new Error(`CORS: Origin ${origin} not allowed`));
};
```

- ✅ Liste d'origines explicites depuis `ALLOWED_ORIGINS` (env var)
- ⚠️ `if (!origin)` autorise **toutes** les requêtes sans header Origin (Postman, curl, server-to-server) — comportement acceptable mais à documenter pour le jury
- ⚠️ `VERCEL_PREVIEW_CORS=true` autorise **tous** les sous-domaines `*.vercel.app` — surface d'attaque élargie si un projet Vercel tiers connaît l'URL

**Helmet (headers de sécurité) :**

Grep Helmet dans tout `src/` : **aucun résultat** ❌

`helmet` est absent de l'application. Les headers de sécurité suivants ne sont pas définis :

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`

**Score A05** : ⚠️ Partiel (CORS OK, Helmet absent)

---

#### A09 — Logging et exposition de données sensibles

| Localisation                   | Log                                        | Problème                                                                                           |
| ------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `authBearerStrategy.ts:25`     | `rootMain.debug('Token received:', token)` | ⚠️ Payload JWT entier loggé en debug (peut contenir email, claims)                                 |
| `authenticateMiddleware.ts:43` | `oid: info.emails[0]`                      | ⚠️ Email (PII) loggé en clair à chaque requête authentifiée                                        |
| `initializeApp.ts:119`         | `` `Body: ${JSON.stringify(req.body)}` ``  | 🔴 Corps de requête entier loggé (peut contenir des données métier, mots de passe si route d'auth) |
| `authConfig.ts:22`             | `loggingNoPII: false`                      | ⚠️ passport-azure-ad autorisé à logger des PII dans ses traces internes                            |

**Score A09** : ⚠️ Partiel (logs PII présents)

---

### 3. RGPD

| Point                              | État          | Détail                                                                                                                                                               |
| ---------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation données personnelles | ⚠️ Partiel    | Mentionné dans le wiki front uniquement — pas de fichier dédié côté back (`docs/`)                                                                                   |
| Politique de rétention des données | ❌ Absent     | Non documentée                                                                                                                                                       |
| Route suppression de compte        | ❌ Absent     | Aucune route `DELETE /api/v*/users/me` ou équivalent                                                                                                                 |
| Données collectées                 | ⚠️ Partiel    | Email Azure B2C stocké en base à la 1ère connexion (`authBearerStrategy.ts:62-63`) — non documenté côté back                                                         |
| Consentement telemetry             | ⚠️ Front only | Le wiki mentionne un `CookieBanner.tsx` (front) pour Application Insights — rien côté back                                                                           |
| Azure B2C exempt consentement      | ✅ (front)    | Wiki qualité : "Azure B2C authentification exemptée en tant que service strictement nécessaire" — justification présente mais uniquement dans la documentation front |

**`authBearerStrategy.ts:62-63` — auto-création d'utilisateur :**

```typescript
if (userID.empty) {
  userID = await userService.addUser(email); // email Azure B2C enregistré en base sans consentement explicite
}
```

> **Note wiki** : La documentation RGPD du projet existe mais est **exclusivement côté front** (wiki `Qualite-et-Metriques`). Le back-end n'a pas de document équivalent ni de procédure de suppression de compte.

**Score RGPD** : ❌ Non conforme côté back (documentation et droit à l'effacement absents)

---

### 4. Secrets

**Grep patterns dangereux dans `src/` :**

| Pattern                                          | Résultat                                | Verdict                                                 |
| ------------------------------------------------ | --------------------------------------- | ------------------------------------------------------- |
| `password\|secret\|apiKey` (valeur hardcodée)    | Aucun résultat ✅                       | ✅                                                      |
| Tokens/credentials en dur                        | Aucun ✅                                | ✅                                                      |
| `localhost:3000` dans `authBearerStrategy.ts:33` | `redirect_uri=http://localhost:3000` ⚠️ | Code de reset password non fonctionnel + URL dev en dur |

**Fichier `.env.example` :**

- ❌ **`.env.example` absent** à la racine du projet
- ✅ `.env.staging.example` présent — couvre les variables staging/Render
- Le `.gitignore` exclut bien `.env`, `.env.test`, `.env.aiven`, `.env.docker` ✅

---

### Score global — Audit 2

| Critère OWASP/RGPD            | Score           | Détail                                                     |
| ----------------------------- | --------------- | ---------------------------------------------------------- |
| Authentification JWT          | ⚠️ Partiel      | `validateIssuer: false`, `loggingNoPII: false`             |
| A01 Broken Access Control     | ❌ Non conforme | 2 routes sans `authorizeStockWrite` (PATCH + DELETE stock) |
| A02 Cryptographic Failures    | ✅ Conforme     | Aucun secret hardcodé                                      |
| A03 Injection                 | ✅ Conforme     | Prisma ORM + SQL paramétré                                 |
| A05 Security Misconfiguration | ⚠️ Partiel      | CORS OK, Helmet absent                                     |
| A09 Logging PII               | ⚠️ Partiel      | Email, body, token loggés                                  |
| RGPD                          | ❌ Non conforme | Pas de doc, pas de droit à l'effacement                    |
| Secrets                       | ⚠️ Partiel      | Pas de `.env.example` racine, `localhost` en dur           |

**Score global : ⚠️ Partiel / ❌ sur A01 et RGPD**

---

### Actions recommandées

#### 🔴 Bloquant (impact jury RNCP)

1. **Ajouter `authorizeStockWrite` sur `PATCH /stocks/:stockId` et `DELETE /stocks/:stockId`** (`StockRoutesV2.ts:112-129`) — faille A01 exploitable, visible par le jury.

2. **Créer `.env.example`** à la racine avec toutes les variables requises — demandé explicitement par plusieurs critères RNCP.

3. **Créer `docs/rgpd.md`** (ou section dans README) — données collectées, durée de rétention, procédure droit à l'effacement — critère Ce2.4 #6 explicite.

#### 🟡 Important (bonne pratique RNCP 7)

4. **Ajouter `helmet`** : `npm install helmet` + `app.use(helmet())` dans `initializeApp.ts` — 5 minutes de travail, impact sécurité visible.

5. **Supprimer le log `JSON.stringify(req.body)`** (`initializeApp.ts:119`) — risque de fuite de données, à remplacer par un log structuré sans corps.

6. **Passer `loggingNoPII: true`** dans `authConfig.ts:22` — conformité RGPD minimale.

7. **Documenter les routes publiques** (`/api-docs*`) — ajouter un commentaire ou une mention dans l'ADR-003.

8. **Corriger `validateIssuer`** — mettre à `true` ou documenter pourquoi c'est `false` (spécificité Azure B2C multi-policy).

#### 🟢 Bonus (nice to have)

9. **Implémenter `DELETE /api/v2/users/me`** — route de suppression de compte (droit à l'effacement RGPD).

10. **Corriger `localhost:3000`** dans `authBearerStrategy.ts:33` — URL de redirect en dur, lire depuis `process.env.FRONTEND_URL`.

11. **Ajouter rate limiting** (documenté dans `SECURITY-VULNERABILITIES.md` comme recommandation) : `express-rate-limit` sur `/api/`.

---

---

## AUDIT 3 — Base de données et intégrité des données

> Critères RNCP : Ce2.4 #4 #5 #7

---

### 1. Schéma Prisma — Entités, types, contraintes

#### Modèles et champs

**`Item`** (`items`)

| Champ          | Type         | Nullable            | Contrainte                 | Remarque                                     |
| -------------- | ------------ | ------------------- | -------------------------- | -------------------------------------------- |
| `id`           | Int          | Non                 | PK autoincrement           | ✅                                           |
| `label`        | VarChar(255) | **Oui** (`String?`) | —                          | ⚠️ Un item sans libellé est possible en base |
| `description`  | VarChar(255) | Oui                 | —                          | ✅ Optionnel acceptable                      |
| `quantity`     | Int          | **Oui** (`Int?`)    | —                          | ⚠️ Une quantité nulle est possible en base   |
| `minimumStock` | Int          | Non                 | `@default(1)`              | ✅                                           |
| `stockId`      | Int          | **Oui**             | FK → `stocks.id` `Cascade` | ⚠️ Item sans stock parent possible           |

**`Stock`** (`stocks`)

| Champ         | Type            | Nullable | Contrainte                 | Remarque                                                                             |
| ------------- | --------------- | -------- | -------------------------- | ------------------------------------------------------------------------------------ |
| `id`          | Int             | Non      | PK autoincrement           | ✅                                                                                   |
| `label`       | VarChar(255)    | Non      | —                          | ✅                                                                                   |
| `description` | VarChar(255)    | Oui      | —                          | ✅                                                                                   |
| `category`    | `StockCategory` | Non      | `@default(alimentation)`   | ✅ Enum protégé                                                                      |
| `userId`      | Int             | **Oui**  | FK → `users.id` `NoAction` | ⚠️ Stock sans propriétaire possible ; `NoAction` = stocks orphelins si user supprimé |

**`User`** (`users`)

| Champ   | Type         | Nullable | Contrainte       | Remarque            |
| ------- | ------------ | -------- | ---------------- | ------------------- |
| `id`    | Int          | Non      | PK autoincrement | ✅                  |
| `email` | VarChar(255) | Non      | `@unique`        | ✅ Unicité garantie |

**`Family`**

| Champ       | Type         | Nullable | Contrainte        | Remarque                                  |
| ----------- | ------------ | -------- | ----------------- | ----------------------------------------- |
| `id`        | Int          | Non      | PK autoincrement  | ✅                                        |
| `name`      | VarChar(255) | Non      | —                 | ⚠️ Pas de contrainte d'unicité sur le nom |
| `createdAt` | DateTime     | Non      | `@default(now())` | ✅                                        |

**`FamilyMember`**

| Champ      | Type         | Nullable | Contrainte                     | Remarque                                   |
| ---------- | ------------ | -------- | ------------------------------ | ------------------------------------------ |
| `id`       | Int          | Non      | PK autoincrement               | ✅                                         |
| `familyId` | Int          | Non      | FK → Family `Cascade`          | ✅                                         |
| `userId`   | Int          | Non      | FK → User `Cascade`            | ✅                                         |
| `role`     | `FamilyRole` | Non      | `@default(MEMBER)`             | ✅                                         |
| `joinedAt` | DateTime     | Non      | `@default(now())`              | ✅                                         |
| —          | —            | —        | `@@unique([familyId, userId])` | ✅ Un user ne peut être membre qu'une fois |

**`StockCollaborator`**

| Champ       | Type        | Nullable | Contrainte                    | Remarque                             |
| ----------- | ----------- | -------- | ----------------------------- | ------------------------------------ |
| `id`        | Int         | Non      | PK autoincrement              | ✅                                   |
| `stockId`   | Int         | Non      | FK → Stock `Cascade`          | ✅                                   |
| `userId`    | Int         | Non      | FK → User `Cascade`           | ✅                                   |
| `role`      | `StockRole` | Non      | `@default(VIEWER)`            | ✅                                   |
| `grantedAt` | DateTime    | Non      | `@default(now())`             | ✅                                   |
| `grantedBy` | Int         | Oui      | FK → User `SetNull`           | ✅ Traçabilité qui a accordé l'accès |
| —           | —           | —        | `@@unique([stockId, userId])` | ✅ Un collaborateur unique par stock |

---

#### Clés étrangères — comportement `onDelete`

| Relation                               | `onDelete` | Verdict | Impact                                                                         |
| -------------------------------------- | ---------- | ------- | ------------------------------------------------------------------------------ |
| `items → stocks`                       | `Cascade`  | ✅      | Items supprimés automatiquement si stock supprimé                              |
| `stocks → users`                       | `NoAction` | ⚠️      | Si user supprimé → stocks **orphelins** (userId = valeur d'un user inexistant) |
| `FamilyMember → Family`                | `Cascade`  | ✅      | Membres supprimés si famille supprimée                                         |
| `FamilyMember → User`                  | `Cascade`  | ✅      | Appartenances supprimées si user supprimé                                      |
| `StockCollaborator → Stock`            | `Cascade`  | ✅      | Collaborateurs supprimés si stock supprimé                                     |
| `StockCollaborator → User`             | `Cascade`  | ✅      | Collaborations supprimées si user supprimé                                     |
| `StockCollaborator → User (grantedBy)` | `SetNull`  | ✅      | Traçabilité préservée même si l'auteur est supprimé                            |

**Problème `stocks → users : NoAction`** : En l'absence de route de suppression de compte (cf. Audit 2), ce cas ne se produit pas aujourd'hui. Mais si une telle route est ajoutée, les stocks ne seront pas supprimés avec le compte utilisateur — incohérence RGPD (droit à l'effacement).

---

#### Contraintes d'unicité (`@@unique`)

| Modèle                               | Contrainte | Verdict                                                                    |
| ------------------------------------ | ---------- | -------------------------------------------------------------------------- |
| `User.email`                         | `@unique`  | ✅                                                                         |
| `FamilyMember[familyId, userId]`     | `@@unique` | ✅                                                                         |
| `StockCollaborator[stockId, userId]` | `@@unique` | ✅                                                                         |
| `Stock`                              | Aucune     | ⚠️ Deux stocks avec le même label pour le même user sont possibles         |
| `Item`                               | Aucune     | ⚠️ Deux items avec le même label dans le même stock sont possibles en base |

> **Note** : La validation "doublon d'item" existe dans `Stock.addItem()` (domaine) mais pas en contrainte DB — si un insert direct en base est fait (seed, migration), le doublon passe.

---

#### Index

| Modèle              | Index                                                             | Usage                                          | Verdict |
| ------------------- | ----------------------------------------------------------------- | ---------------------------------------------- | ------- |
| `Item`              | `@@index([stockId])`                                              | `WHERE stockId = ?` dans `findMany`            | ✅      |
| `Stock`             | `@@index([userId])`                                               | `WHERE userId = ?` dans `findMany`             | ✅      |
| `FamilyMember`      | `@@index([familyId])`, `@@index([userId])`                        | Jointures famille/user                         | ✅      |
| `StockCollaborator` | `@@index([stockId])`, `@@index([userId])`, `@@index([grantedBy])` | Queries autorisation                           | ✅      |
| `User`              | Index implicite sur `email` (via `@unique`)                       | `WHERE email = ?` dans AuthorizationRepository | ✅      |

**Tous les champs de filtre/join fréquents ont un index.** ✅

---

### 2. Migrations

**Nombre de migrations** : **1** (`20250227000000_init`)

| Migration             | Nom  | Date        | Type              | Verdict          |
| --------------------- | ---- | ----------- | ----------------- | ---------------- |
| `20250227000000_init` | init | 27 fév 2025 | Création initiale | ✅ Nommage clair |

**Observations :**

- ✅ Nommage lisible (`_init` explicite)
- ✅ Pas de migration destructive (c'est l'init)
- ⚠️ **1 seule migration** pour l'ensemble du schéma (6 tables, 3 enums, 7 FK) — cela peut signifier que le schéma n'a pas évolué depuis le début, **ou** que des migrations intermédiaires ont été squashées/regénérées. L'historique d'évolution de la BDD n'est pas traçable.
- ⚠️ Le `timestamp` `20250227000000` ressemble à un timestamp forcé (minuit exact) plutôt qu'auto-généré — peut indiquer une migration créée manuellement.

---

### 3. Requêtes N+1

#### V2 — Repositories Prisma

**`getAllStocks`** (`PrismaStockVisualizationRepository`) :

```typescript
// 1 seule requête — OK
this.prisma.stock.findMany({ where: { userId } });
// Pas d'include car retourne StockWithoutItems ✅
```

**`getStockItems`** (`PrismaStockVisualizationRepository`) :

```typescript
// 2 requêtes séquentielles pour 1 opération logique
const stock = await this.prisma.stock.findFirst({ where: { id: stockId, userId } });
const items = await this.prisma.item.findMany({ where: { stockId } });
```

⚠️ Pourrait être 1 requête avec `include: { items: true }`, mais pas un N+1 au sens strict (volume fixe indépendant du nombre d'items).

**`findById`** (`PrismaStockCommandRepository`) :

```typescript
this.prisma.stock.findUnique({ where: { id: stockId }, include: { items: true } });
// 1 requête avec JOIN ✅
```

**Pattern "double findById"** dans les opérations d'écriture :

```typescript
// addItemToStock, updateItemQuantity, updateStock : 3 allers-retours base
const stock = await this.findById(stockId); // 1. Lecture avant
// ... opération ...
const updatedStock = await this.findById(stockId); // 2. Relecture après
```

⚠️ Chaque opération d'écriture génère **3 requêtes** (findById avant + write + findById après). Pas critique pour ce volume, mais coûteux.

**`authorizeStockAccess`** (middleware, par requête) :

```typescript
await repository.findUserByEmail(req.userID);           // requête 1
await repository.findStockById(stockId);                // requête 2
await repository.findCollaboratorByUserAndStock(...);   // requête 3 (si non-owner)
```

⚠️ **3 requêtes supplémentaires** exécutées à chaque appel de route protégée, **avant** la logique métier. Sans cache, cela représente 6 requêtes minimum pour un `PATCH /stocks/:stockId/items/:itemId`.

#### V1 — Repositories SQL raw

```typescript
// deleteStock dans StockService V1 : 2 DELETE séparés
await this.writeStockRepository.deleteStockItemsByStockID(stockID); // DELETE items
await this.writeStockRepository.deleteStock(stockID, userID); // DELETE stock
// ⚠️ En V2, 1 seule requête suffit grâce à onDelete: Cascade
```

**Verdict N+1** : ✅ Pas de N+1 classique, mais pattern "double findById" et absence de cache notable.

---

### 4. Éco-conception

| Aspect                        | État        | Détail                                                                                                      |
| ----------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| **Cache**                     | ❌ Absent   | Pas de Redis, pas de cache in-memory (node-cache, etc.)                                                     |
| **Pagination**                | ❌ Absente  | `GET /api/v2/stocks` et `GET /api/v2/stocks/:id/items` retournent **tous** les résultats sans `skip`/`take` |
| **Index SQL**                 | ✅ Présents | Tous les champs filtres indexés (voir §1)                                                                   |
| **Prisma `include` maîtrisé** | ✅          | `getAllStocks` n'inclut pas les items inutilement                                                           |
| **Application Insights**      | ✅          | `rootDependency` trace les durées de requêtes — monitoring en place                                         |

**Impact pagination** : Un utilisateur avec 100+ stocks ou 500+ items recevrait tout en une réponse. À ce stade du projet (usage familial), acceptable, mais à documenter comme limitation connue.

---

### Score global — Audit 3

| Critère                    | Score       | Détail                                                                  |
| -------------------------- | ----------- | ----------------------------------------------------------------------- |
| Entités et types           | ⚠️ Partiel  | `label`/`quantity` items nullable, `userId` stock nullable              |
| Clés étrangères `onDelete` | ⚠️ Partiel  | `stocks → users : NoAction` — orphelins possibles si suppression compte |
| Contraintes d'unicité      | ⚠️ Partiel  | Pas de contrainte unicité label stock/item en base                      |
| Index                      | ✅ Conforme | Tous les champs de filtre indexés                                       |
| Migrations                 | ⚠️ Partiel  | 1 seule migration — historique non traçable                             |
| Requêtes N+1               | ✅ Conforme | Pas de N+1 — `include` utilisé correctement                             |
| Éco-conception             | ⚠️ Partiel  | Pas de pagination, pas de cache                                         |

**Score global : ⚠️ Partiel**

---

### Actions recommandées

#### 🔴 Bloquant (impact jury RNCP)

1. **Documenter la migration unique** — ajouter un commentaire dans le README ou un ADR expliquant pourquoi 1 seule migration (schéma initial complet vs évolution progressive). Un jury s'attend à voir plusieurs migrations pour un projet en cours de développement.

2. **Corriger `stocks → users : NoAction`** → passer à `onDelete: Restrict` ou `Cascade` selon la politique RGPD choisie. Si l'objectif est le droit à l'effacement, utiliser `Cascade`.

#### 🟡 Important (bonne pratique RNCP 7)

3. **Rendre `Item.label` et `Item.quantity` non-nullables** : `label String @db.VarChar(255)` et `quantity Int @default(0)` — alignement avec les invariants du domaine (un item a toujours un label et une quantité).

4. **Rendre `Stock.userId` non-nullable** : `userId Int` — un stock sans propriétaire n'a pas de sens métier.

5. **Supprimer le pattern double `findById`** dans les handlers écriture — retourner directement le résultat du `create`/`update` Prisma (qui supporte `include`).

#### 🟢 Bonus (nice to have)

6. **Ajouter la pagination** sur `GET /stocks` et `GET /stocks/:id/items` — paramètres `?page=1&limit=20` pour la scalabilité.

7. **Ajouter `@@unique([userId, label])` sur `Stock`** — contrainte DB en miroir de la validation domaine.

8. **Créer un index composite `[userId, category]`** sur `stocks` si un filtre par catégorie est ajouté à l'avenir.

---

## AUDIT 4 — Pipeline CI et qualité du code

> Critères RNCP : Ce3.1 #7 #8 #9 #10 #11

---

### 1. Fichiers workflows

| Fichier                  | Nom                            | Déclencheurs                                                            |
| ------------------------ | ------------------------------ | ----------------------------------------------------------------------- |
| `main_stockhub-back.yml` | CI/CD Pipeline - stockhub-back | push toutes branches, PR toutes branches, workflow_dispatch             |
| `security-audit.yml`     | Security Audit                 | push main/develop, PR main/develop, cron lundi 00h00, workflow_dispatch |
| `release-please.yml`     | Release Please                 | push main uniquement                                                    |

---

### 2. Pipeline principal (`main_stockhub-back.yml`)

#### Job `continuous-integration` — toutes branches

| Étape                     | Présente | Détail                                                     |
| ------------------------- | -------- | ---------------------------------------------------------- |
| `actions/setup-node@v4`   | ✅       | Node 22.x, `cache: 'npm'`                                  |
| `npm ci`                  | ✅       | Installation propre                                        |
| TypeScript check          | ✅       | `npx tsc --noEmit`                                         |
| ESLint                    | ✅       | `npm run lint --if-present`                                |
| Tests unitaires           | ✅       | `npm run test:unit`                                        |
| `npm audit`               | ❌       | **Commenté** (lignes 28-30) — désactivé intentionnellement |
| Build Webpack             | ❌       | Absent de ce job                                           |
| Coverage upload (Codecov) | ❌       | Absent                                                     |

> ⚠️ `npm run test:unit` utilise `jest.config.js`, **pas** `jest.ci.config.js`. Le script `test:ci` (qui utilise la config CI dédiée) n'est **pas** appelé en CI.

#### Job `e2e-tests` — PR → main + workflow_dispatch

| Étape                 | Présente | Détail                                                        |
| --------------------- | -------- | ------------------------------------------------------------- |
| MySQL 8.0 sidecar     | ✅       | Healthcheck configuré                                         |
| Prisma migrate deploy | ✅       | Schéma appliqué avant les tests                               |
| Seed database         | ✅       | `SEED_OWNER_EMAIL` depuis secret                              |
| Build Webpack         | ✅       | `npm run build`                                               |
| Démarrage serveur     | ✅       | `node dist/index.js` en background                            |
| Wait-on API ready     | ✅       | `wait-on http://localhost:3006/api-docs.json --timeout 60000` |
| Tests Playwright      | ✅       | `npm run test:e2e` (Chromium uniquement)                      |
| Upload rapport        | ✅       | `playwright-report/` artifact 7 jours                         |
| Logs serveur si échec | ✅       | `if: always()` avec grep erreurs                              |

#### Job `deploy-to-staging` — workflow_dispatch uniquement

```yaml
run: curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_STAGING }}"
# Environment GitHub "Staging" défini avec URL vars.RENDER_STAGING_URL
```

✅ Déclenchement manuel propre — conforme à la stratégie `autoDeploy: false` de Render.

#### Job `build-and-deploy` — push main uniquement

| Étape                | Présente | Détail                                           |
| -------------------- | -------- | ------------------------------------------------ |
| Build Webpack        | ✅       | `npm run build`                                  |
| Zip artifact         | ✅       | `dist/ + node_modules/ + package.json + prisma/` |
| Deploy Azure Web App | ✅       | `azure/webapps-deploy@v2`                        |
| Environment GitHub   | ✅       | `name: 'Production'` avec URL webapp             |

---

### 3. Sécurité dans le pipeline

| Point                           | État       | Détail                                                                                                                                                                                                                              |
| ------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TruffleHog                      | ❌ Absent  | Aucun scan de secrets dans le code versionné                                                                                                                                                                                        |
| `npm audit` en CI principale    | ⚠️ Déplacé | Commenté intentionnellement — délégué au workflow `security-audit.yml` dédié                                                                                                                                                        |
| `npm audit` dans workflow dédié | ⚠️ Partiel | `security-audit.yml` : `--audit-level=critical` — downgrade intentionnel (commit `a91dcb6`, 20 fév 2026) sans justification documentée ; drift avec `docs/ci-cd/SECURITY-AUDIT-WORKFLOW.md` qui indique encore `--audit-level=high` |
| Scan hebdomadaire               | ✅         | Cron `0 0 * * 1` chaque lundi                                                                                                                                                                                                       |
| Secrets via `${{ secrets.* }}`  | ✅         | Tous les secrets référencés correctement — aucun hardcodé                                                                                                                                                                           |
| Cohérence Node version          | ⚠️         | CI principale : Node 22.x / `security-audit.yml` : Node 20 — inconsistance                                                                                                                                                          |

```yaml
# security-audit.yml — niveau trop permissif
run: npm audit --audit-level=critical # HIGH ignoré
#   run: npm audit --audit-level=high  # Commenté
```

---

### 4. Conventional Commits

#### Analyse des 20 derniers commits

```
✅ chore(ci): upgrade to Node 22 in Dockerfile, CI workflow and add .nvmrc
✅ docs: add staging/Render troubleshooting guide (#97)
✅ fix(auth): accept both PKCE and ROPC audiences when ROPC policy is enabled (#95)
✅ chore(main): release 2.5.0 (#87)
✅ feat(api): implement DELETE /api/v2/stocks/:stockId/items/:itemId (#92)
✅ fix(domain): migrate StockItem and StockSummary properties to camelCase (#91)
✅ docs(readme): restore business/technical sections + keep new env links
✅ docs(readme): rewrite with multi-environment links, Docker quickstart, Postman envs
✅ feat(ci): add staging environment with Docker, seed, Render and E2E pipeline (#89)
✅ chore: update Postman collection with all endpoints and OAuth2 auth (#88)
✅ feat(db): lowercase schema + cascade items #86 #78
✅ feat: add SSL configuration to database connection options
✅ chore(main): release 2.4.0 (#82)
✅ refactor: improve code formatting and structure
✅ feat: implement PATCH and DELETE endpoints for stocks (Issue #74) (#80)
✅ docs: update backend URL to new Azure App Service domain
✅ fix(cors): allow Vercel preview URLs via VERCEL_PREVIEW_CORS env var
❌ 148aeac Add link to complete project documentation  ← pas de type conventionnel
✅ docs: add guides for code review best practices and logging system
✅ docs: update CLAUDE.md with improved structure and clarity
```

**Score : 19/20 commits conformes** — 1 seule violation (`148aeac`) sans type conventionnel.

#### `commitlint.config.js`

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'ci',
        'build',
        'revert',
      ],
    ],
    'subject-case': [0], // Pas de contrainte de casse
  },
};
```

✅ Configuré, enforced via `commit-msg` hook Husky.

#### Hooks Husky

| Hook         | Commandes                                      | Verdict                                    |
| ------------ | ---------------------------------------------- | ------------------------------------------ |
| `commit-msg` | `commitlint --edit "$1"`                       | ✅ Bloque les commits non conformes        |
| `pre-commit` | `git add -u` + `lint-staged` + `tsc --noEmit`  | ✅ Format + lint + type check avant commit |
| `pre-push`   | `format:check` + `lint` + `knip` + `test:unit` | ✅ Qualité complète avant push             |

---

### 5. ADR-010 — Optimisation CI/CD

| Métrique            | Avant  | Après   | Gain              |
| ------------------- | ------ | ------- | ----------------- |
| Temps total         | 7m36s  | 5m44s   | **−25%** (−1m52s) |
| `npm ci` avec cache | ~2 min | ~25-30s | −75%              |
| Taux cache hit      | N/A    | ~95%    | ✅                |

**3 optimisations documentées :**

1. ✅ Cache npm natif (`cache: 'npm'`) — 1 ligne de config
2. ✅ Suppression upload/download artifact inutile (même job)
3. ✅ Unification Node.js (20.x → maintenant 22.x sur la branche actuelle)

**Alternatives considérées et documentées** : 6 alternatives (pnpm, Docker layers, matrix, self-hosted, artifacts, webpack opts) — tentative webpack rejetée après régression +12s mesurée empiriquement. ✅ Exemplaire pour le jury RNCP.

#### Note branche actuelle (`feat-issue-24-upgrade-node22`)

La branche actuelle pousse Node.js de 20 vers 22. La CI (`main_stockhub-back.yml`) est déjà à `node-version: '22.x'` ✅. Il reste à mettre à jour `security-audit.yml` qui est encore à `node-version: '20'`.

---

### 6. CHANGELOG et releases

- **CHANGELOG.md** : ✅ Présent à la racine, généré automatiquement par `release-please`
- **Format** : Sections ✨ Features / 🐛 Bug Fixes / 📚 Documentation / 🔧 Chores — lisible
- **Tags** : ✅ 9 releases — `v1.1.0` → `v2.5.0` (semver respecté)
- **Breaking changes** : ⚠️ Pas de section `BREAKING CHANGE` identifiée dans le CHANGELOG (migrations DDD/V1→V2 non signalées formellement)
- **Release actuelle** : v2.5.0 (README affiche encore v2.4.0 — badge à mettre à jour)

---

### Score global — Audit 4

| Critère RNCP                                     | Score       | Détail                                                                                                 |
| ------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------ |
| Ce3.1 #7 — dépôt + branches + historique lisible | ✅ Conforme | Branches feat/fix, 19/20 commits conventionnels, tags semver                                           |
| Ce3.1 #8 — pipeline CI déclenché auto            | ✅ Conforme | Push toutes branches → CI automatique                                                                  |
| Ce3.1 #9 — pipeline fiable et rapide             | ✅ Conforme | 5m44s, ADR-010 documenté, cache npm 95% hit                                                            |
| Ce3.1 #10 — sécurité dans le pipeline            | ⚠️ Partiel  | `npm audit` délégué à workflow dédié (choix valide), mais level=critical (pas high), TruffleHog absent |
| Ce3.1 #11 — commits conventionnels + .gitignore  | ✅ Conforme | commitlint enforced, 1 violation sur 20, .gitignore complet                                            |

**Score global : ✅ Conforme / ⚠️ sur la sécurité pipeline**

---

### Actions recommandées

#### 🔴 Bloquant (impact jury RNCP)

1. **Passer `security-audit.yml` à `--audit-level=high`** (remettre la ligne commentée) — le niveau `critical` seul ne détecte pas les vulnérabilités HIGH comme la CVE `qs` déjà documentée dans `SECURITY-VULNERABILITIES.md`.

2. **Documenter le choix de séparer `npm audit`** dans un workflow dédié — ajouter un commentaire dans `main_stockhub-back.yml` (ex: `# npm audit délégué à security-audit.yml`) pour qu'un jury comprenne immédiatement l'intention.

#### 🟡 Important (bonne pratique RNCP 7)

3. **Utiliser `test:ci` (jest.ci.config.js) en CI** au lieu de `test:unit` — la config CI dédiée existe et est prévue pour ça.

4. **Mettre `security-audit.yml` à Node 22.x** — cohérence avec le reste du pipeline (branche en cours le fait déjà pour `main_stockhub-back.yml`).

5. **Mettre à jour le badge `version` dans README** : affiche `2.4.0` mais la version actuelle est `2.5.0`.

#### 🟢 Bonus (nice to have)

6. **Ajouter TruffleHog** dans le pipeline — scan de secrets dans l'historique git (`--only-verified`).

7. **Uploader le coverage** vers Codecov ou GitHub Pages (lcov) — pour afficher le badge coverage dans le README.

8. **Ajouter un environment protection rule** sur "Production" dans GitHub Settings — nécessite approbation manuelle avant deploy Azure.

---

### Note pour Audit 7 — Écarts README / Wiki détectés

> Ces points seront traités en détail dans l'Audit 7. Mémorisés ici pour ne pas les perdre.

| Écart               | README                       | Wiki                                 | Impact                                                                              |
| ------------------- | ---------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------- |
| Badge Node version  | `Node 20.x`                  | —                                    | ⚠️ Branche actuelle monte vers Node 22 — badge à mettre à jour                      |
| Staging déploiement | "Auto sur branche `staging`" | "Auto on `staging` branch"           | ⚠️ Inexact — `autoDeploy: false` dans `render.yaml`, déploiement manuel via webhook |
| Coverage            | Non affiché (back)           | 74.97% mentionné = chiffre **front** | ⚠️ Le taux backend n'est pas affiché dans README ni wiki                            |
| RGPD documentation  | Absente côté back            | Présente côté front (wiki Qualité)   | ❌ Asymétrie documentaire notable pour le jury                                      |

_Prêt pour l'Audit 3 à votre validation._

---

## AUDIT 5 — Stratégie de tests

> Critères RNCP : Ce3.2 #12 #13 #14 #15 #16

---

### 1. Structure des tests

#### Inventaire des fichiers de tests par type

**Tests domaine (unitaires DDD) — `tests/domain/`**

| Fichier                                                                                          | Type | Rôle                                                                                         |
| ------------------------------------------------------------------------------------------------ | ---- | -------------------------------------------------------------------------------------------- |
| `domain/stock-management/common/entities/Stock.test.ts`                                          | Unit | Entité Stock : create, addItem, updateItemQuantity, getTotalItems/Quantity, getLowStockItems |
| `domain/stock-management/common/entities/StockItem.test.ts`                                      | Unit | Entité StockItem : isOutOfStock, isLowStock                                                  |
| `domain/stock-management/common/value-objects/Quantity.test.ts`                                  | Unit | VO Quantity : valeur négative, zéro, positive, isLessOrEqualToMinimum                        |
| `domain/stock-management/common/value-objects/StockLabel.test.ts`                                | Unit | VO StockLabel : validation longueur min/max                                                  |
| `domain/stock-management/common/value-objects/StockDescription.test.ts`                          | Unit | VO StockDescription : validation                                                             |
| `domain/stock-management/manipulation/command-handlers/AddItemToStockCommandHandler.test.ts`     | Unit | Handler CQRS ajout item                                                                      |
| `domain/stock-management/manipulation/command-handlers/CreateStockCommandHandler.test.ts`        | Unit | Handler CQRS création stock                                                                  |
| `domain/stock-management/manipulation/command-handlers/DeleteItemCommandHandler.test.ts`         | Unit | Handler CQRS suppression item                                                                |
| `domain/stock-management/manipulation/command-handlers/UpdateItemQuantityCommandHandler.test.ts` | Unit | Handler CQRS màj quantité                                                                    |
| `domain/stock-management/visualization/services/StockVisualizationService.test.ts`               | Unit | Service visualization : getAllStocks, getStockDetails, getStockItems                         |
| `domain/authorization/common/entities/Family.create.test.ts`                                     | Unit | Entité Family : création                                                                     |
| `domain/authorization/common/entities/Family.info.test.ts`                                       | Unit | Entité Family : lecture infos                                                                |
| `domain/authorization/common/entities/Family.members.test.ts`                                    | Unit | Entité Family : gestion membres                                                              |
| `domain/authorization/common/entities/Family.roles.test.ts`                                      | Unit | Entité Family : gestion rôles                                                                |
| `domain/authorization/common/value-objects/FamilyRole.test.ts`                                   | Unit | VO FamilyRole                                                                                |
| `domain/authorization/common/value-objects/StockRole.test.ts`                                    | Unit | VO StockRole                                                                                 |

**Tests unitaires legacy V1 — `tests/unit/`**

| Fichier                                    | Type | Rôle                 |
| ------------------------------------------ | ---- | -------------------- |
| `unit/stockController.test.ts`             | Unit | Controller V1 stocks |
| `unit/stockService.test.ts`                | Unit | Service V1 stocks    |
| `unit/userService.test.ts`                 | Unit | Service V1 users     |
| `unit/itemFactory.test.ts`                 | Unit | Factory items V1     |
| `unit/api/dto/mappers/StockMapper.test.ts` | Unit | Mapper DTO V2        |

**Tests controllers V2 — `tests/api/`**

| Fichier                                                | Type | Rôle                        |
| ------------------------------------------------------ | ---- | --------------------------- |
| `api/controllers/StockControllerVisualization.test.ts` | Unit | Controller visualization V2 |
| `api/controllers/StockControllerManipulation.test.ts`  | Unit | Controller manipulation V2  |
| `api/routes/StockRoutesV2.test.ts`                     | Unit | Routes V2                   |

**Tests d'intégration — `tests/integration/`**

| Fichier                                                                                            | Type        | Rôle                                          |
| -------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------- |
| `integration/stock-management/repositories/PrismaStockCommandRepository.integration.test.ts`       | Integration | TestContainers MySQL — repository écriture    |
| `integration/stock-management/repositories/PrismaStockVisualizationRepository.integration.test.ts` | Integration | TestContainers MySQL — repository lecture     |
| `integration/stock-management/api/StockApiV2.integration.test.ts`                                  | Integration | TestContainers MySQL — API V2 complète        |
| `integration/authorization/authorizeMiddleware.integration.test.ts`                                | Integration | Middleware autorisation (skipped - Issue #71) |

**Tests E2E Playwright — `tests/e2e/`**

| Fichier                                               | Type | Rôle                                                         |
| ----------------------------------------------------- | ---- | ------------------------------------------------------------ |
| `e2e/stock-management/stock-api-workflow.e2e.test.ts` | E2E  | Workflow complet stock : 6 scénarios CRUD                    |
| `e2e/authorization/stock-authorization.e2e.test.ts`   | E2E  | Autorisation : 4 scénarios (owner, auth required, write ops) |
| `e2e/cleanup-test-data.e2e.test.ts`                   | E2E  | Nettoyage données de test                                    |

**Divers**

| Fichier                     | Rôle                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `tests/errors.test.ts`      | Tests erreurs applicatives                                                                   |
| `tests/stockMapper.test.ts` | Doublure de `tests/unit/api/dto/mappers/StockMapper.test.ts` — fichier en double à la racine |
| `tests/_integration_old/`   | Ancienne suite d'intégration (non utilisée, non référencée dans aucune config Jest)          |
| `tests/__mocks__/`          | Mocks partagés                                                                               |

#### Séparation unit/integration/e2e

✅ **Séparation claire** : `tests/domain/` + `tests/unit/` + `tests/api/` (unit) | `tests/integration/` | `tests/e2e/`

#### Configs Jest

| Config        | Fichier                      | `testMatch`                                    | Usage                                       |
| ------------- | ---------------------------- | ---------------------------------------------- | ------------------------------------------- |
| Unit (domain) | `jest.config.js`             | `tests/domain/**/*.test.ts`                    | `npm run test:unit` (CI pipeline)           |
| CI all        | `jest.ci.config.js`          | `tests/**/*.test.(ts\|tsx)` (hors integration) | `npm run test:ci` / `npm run test:coverage` |
| Integration   | `jest.integration.config.js` | `tests/integration/**/*.integration.test.ts`   | `npm run test:integration`                  |

⚠️ **Problème** : `jest.config.js` (utilisé par `npm run test:unit` en CI) ne couvre que `tests/domain/`. Les tests `tests/unit/`, `tests/api/`, `tests/errors.test.ts` **ne sont pas exécutés en CI** — uniquement via `test:ci` non utilisé dans le pipeline `continuous-integration`.

---

### 2. Coverage

#### Configuration

- `jest.ci.config.js` : `collectCoverage: process.env.COVERAGE === 'true'` — optionnel, pas automatique
- `collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts']` — couvre tout `src/`
- **❌ Aucun `coverageThreshold` configuré** dans aucune des 3 configs Jest
- **❌ Coverage non uploadé** vers Codecov, lcov ou équivalent (aucune étape dans CI pipeline)

#### Taux estimé (d'après ADR-004 + périmètre)

L'ADR-004 déclare "100% des méthodes utilisées en production" pour la couche domaine. Le taux global (`src/` complet) n'est pas mesuré publiquement — ni dans le README back ni dans le wiki. Seule mention chiffrée dans le wiki front : "74.97%" qui concerne le **front**, pas ce back-end.

#### Points manquants RNCP

- Ce3.2 #15 : _Coverage mesuré et documenté avec seuil_ — ❌ pas de seuil (`coverageThreshold`), pas de documentation chiffrée du taux back-end
- Pas d'upload de rapport (Codecov badge absent du README back)

---

### 3. Qualité des tests unitaires DDD

#### `Quantity.test.ts`

| Cas                                       | Couvert ?                                                 |
| ----------------------------------------- | --------------------------------------------------------- |
| Valeur négative → throw                   | ✅ (`new Quantity(-1)` → `'Quantity cannot be negative'`) |
| Valeur zéro → `isZero()`                  | ✅                                                        |
| Valeur positive → `isZero() = false`      | ✅                                                        |
| `isLessOrEqualToMinimum()` — multiple cas | ✅ (4 variantes)                                          |
| `equals()`                                | ❌ Non implémenté dans le VO (identifié en Audit 1)       |
| `add()`                                   | ❌ Non implémenté dans le VO                              |

Note : les tests sont cohérents avec l'implémentation actuelle du VO. Les absences `equals()`/`add()` sont des lacunes du VO lui-même, pas uniquement des tests.

#### `StockItem.test.ts`

| Cas                                           | Couvert ?                               |
| --------------------------------------------- | --------------------------------------- |
| `isOutOfStock()` (qty = 0)                    | ✅                                      |
| `isLowStock()` (qty ≤ minimumStock)           | ✅                                      |
| `isLowStock()` (qty > minimumStock → false)   | ✅                                      |
| Edge case qty = minimumStock (exact boundary) | ✅ (`StockItem(1,'item1',2,'...',2,2)`) |
| `isOutOfStock()` (qty > 0 → false)            | ❌ Absent                               |

#### `Stock.test.ts`

| Cas                                                | Couvert ?  |
| -------------------------------------------------- | ---------- |
| `getTotalItems()` stock vide                       | ✅         |
| `getTotalItems()` avec items                       | ✅         |
| `getTotalQuantity()` stock vide                    | ✅         |
| `getTotalQuantity()` avec items                    | ✅         |
| `getTotalQuantity()` items avec qty 0              | ✅         |
| `addItem()` cas nominal                            | ✅         |
| `addItem()` label vide → throw                     | ✅         |
| `addItem()` quantity négative → throw              | ✅         |
| `addItem()` doublon même label                     | ✅         |
| `addItem()` doublon case-insensitive               | ✅         |
| `updateItemQuantity()` cas nominal                 | ✅         |
| `updateItemQuantity()` qty négative → throw        | ✅         |
| `updateItemQuantity()` item inexistant → throw     | ✅         |
| `getLowStockItems()` / `hasLowStockItems()`        | ✅ (4 cas) |
| `create()` avec Value Objects                      | ✅         |
| `create()` label invalide → throw (via StockLabel) | ✅         |

#### `StockVisualizationService.test.ts`

| Cas                                                            | Couvert ? |
| -------------------------------------------------------------- | --------- |
| `getAllStocks()` liste vide                                    | ✅        |
| `getAllStocks()` 1 stock                                       | ✅        |
| `getAllStocks()` n stocks                                      | ✅        |
| `getStockDetails()` stock sans items                           | ✅        |
| `getStockDetails()` stock inexistant → throw 'Stock not found' | ✅        |
| `getStockItems()` liste vide                                   | ✅        |
| `getStockItems()` avec items                                   | ✅        |

✅ Couverture fonctionnelle complète du service de visualization — tous les cas nominaux ET le cas 404.

---

### 4. Tests E2E Playwright

#### `playwright.config.ts`

- **URL de base** : `process.env.API_BASE_URL || 'http://localhost:3006'`
- **Browser** : `projects: [{ name: 'API Tests' }]` sans spécification de browser → Chromium par défaut (Playwright default)
- **Parallélisme** : `fullyParallel: false`, `workers: 1` — séquentiel (obligatoire car tests stateful avec IDs)
- **Retries** : 2 en CI, 0 en local
- **Reporter** : HTML
- **Source de config** : charge `.env.test` via `dotenv.config()`

#### Scénarios E2E implémentés

Le fichier `docs/E2E_TESTS_GUIDE.md` est **absent** du repo (non trouvé). Les scénarios documentés sont dans les fichiers de test eux-mêmes.

**`stock-api-workflow.e2e.test.ts`** — 6 steps :

1. Create a new stock (POST /api/v1/stocks) → 201
2. Add first item (normal stock, qty 50 / min 10) → 201
3. Add second item (low stock, qty 5 / min 20) → 201
4. Visualize stock and verify items (GET /api/v2/stocks/:id/items) → 200
5. Update item quantity (PUT /api/v1/stocks/:id/items/:itemId) → 200
6. Check low stock items (GET /api/v1/low-stock-items) → ≥1 résultat

**`stock-authorization.e2e.test.ts`** — 4 steps :

1. Owner can create and access their own stock
2. Protected routes require authentication (401 sans token)
3. Owner can add items to their stock (write operation)
4. Owner can update items in their stock (write operation)

**`cleanup-test-data.e2e.test.ts`** — 1 test : suppression des stocks de test résiduels

⚠️ **Scénario manquant** : pas de test E2E pour `PATCH /api/v2/stocks/:id` (update stock) et `DELETE /api/v2/stocks/:id/items/:itemId` (endpoints V2 récents). Les tests E2E utilisent majoritairement l'API V1 pour les mutations.

#### Authentification Azure B2C

✅ Les tests E2E utilisent **l'authentification Azure B2C réelle** via `createAzureAuthHelper()` avec ROPC flow (MSAL `acquireTokenByUsernamePassword`). Token JWT valide acquis en `beforeAll`.

#### Nettoyage des données de test

✅ Nettoyage dans `afterAll` (suppression des stocks créés) dans chaque fichier E2E
✅ Fichier dédié `cleanup-test-data.e2e.test.ts` pour nettoyage ad hoc
⚠️ `console.log/error` présents dans les fichiers E2E (violation ESLint — tolérée dans les tests ?)

---

### 5. TDD

#### ADR-004 : approche documentée

L'ADR-004 (`docs/adr/ADR-004-tests-value-objects-entities.md`) documente explicitement :

- Décision : tester Value Objects et Entities de manière isolée
- Cycle TDD : Red → Green → Refactor en < 200ms
- **Cas réels documentés** : bug case-sensitive détecté par les tests, 2 régressions évitées lors de refactorings
- **Justification pédagogique** complète face à la question de l'encadrant RNCP

#### Preuves dans le git log

```
8fcd2f9 test(authorization): add unit tests for domain layer (142 tests)
1176080 feat(authorization): apply middleware to stock V2 routes (Issue #62)
ce40e2e feat(authorization): Phase 1 - domain layer and middleware (Issue #62)
```

Pour le module d'autorisation : les commits `test(authorization)` sont **postérieurs** aux commits `feat(authorization)` → tests écrits après le code, pas en TDD strict. Cependant, la couverture est exhaustive (142 tests pour ce module).

Pour le module `stock-management` initial : pas de commits `test:` distincts dans l'historique — les tests ont probablement été co-développés avec les features (sans séparation de commit).

**Conclusion TDD** : L'approche est documentée et défendue (ADR-004), avec des preuves de valeur (bugs détectés). Mais le git log ne montre pas systématiquement des commits `test:` avant des commits `feat:` → TDD **partiel** : pratiqué sur certains modules (domaine stock-management), moins strict sur l'autorisation.

---

### Score global — Audit 5

| Critère RNCP                                         | Score           | Détail                                                                                                              |
| ---------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------- |
| Ce3.2 #12 — Plan de tests unit+intégration documenté | ✅ Conforme     | ADR-004 + 3 configs Jest + séparation claire des types                                                              |
| Ce3.2 #13 — TDD parallèle au dev + intégré CI        | ⚠️ Partiel      | ADR-004 documente l'approche, mais git log montre TDD non systématique ; CI utilise `test:unit` (domain uniquement) |
| Ce3.2 #14 — Tests tracent et localisent les bugs     | ✅ Conforme     | Structure DDD (domain/unit/integration/e2e) permet un diagnostic précis par couche                                  |
| Ce3.2 #15 — Coverage mesuré et documenté avec seuil  | ❌ Non conforme | Aucun `coverageThreshold`, taux non affiché dans README/wiki back, pas d'upload vers Codecov                        |
| Ce3.2 #16 — Cas nominaux ET edge cases couverts      | ✅ Conforme     | Stock.test.ts très complet, cas limites couverts (qty=minimumStock, doublon case-insensitive, item inexistant)      |

**Score global** : ⚠️ **Partiel** — Excellente couverture fonctionnelle du domaine, E2E réels avec Azure B2C, mais absence critique de seuil de coverage configuré et de publication du taux.

---

### Actions recommandées

1. 🔴 **Configurer `coverageThreshold`** dans `jest.ci.config.js` — seuil minimum (ex: `branches: 70, functions: 80, lines: 80`) obligatoire pour Ce3.2 #15 (jury vérifiera)

2. 🔴 **Afficher le taux de coverage back-end dans le README** — ajouter un badge Codecov ou la mention du taux mesuré (Ce3.2 #15)

3. 🟡 **Ajouter `npm run test:ci` (ou `test:coverage`) dans le job `continuous-integration`** du pipeline — actuellement `test:unit` ne couvre que `tests/domain/` (142 tests), les tests `unit/`, `api/` ne tournent pas en CI

4. 🟡 **Créer `docs/E2E_TESTS_GUIDE.md`** — référencé dans le prompt RNCP mais absent du repo ; documenter les 10 scénarios E2E, les prérequis, la configuration Azure B2C

5. 🟡 **Ajouter test E2E pour les endpoints V2 récents** — `PATCH /api/v2/stocks/:id` et `DELETE /api/v2/stocks/:id/items/:itemId` (issue #92) ne sont pas couverts par les E2E

6. 🟡 **Ajouter `isOutOfStock() → false` quand qty > 0** dans `StockItem.test.ts` — cas nominal absent

7. 🟢 **Supprimer ou intégrer `tests/stockMapper.test.ts`** (doublure à la racine) et `tests/_integration_old/` (suite obsolète)

8. 🟢 **Documenter une stratégie TDD plus visible** — ajouter un `docs/testing/TEST-PLAN.md` récapitulant pyramide de tests, seuils, types de tests par couche

---

_Prêt pour l'Audit 6 à votre validation._

---

## AUDIT 6 — Infrastructure et environnements DevOps

> Critères RNCP : Ce3.5 #17 #18 #19 #20 #21 #22

---

### 1. Docker

#### `Dockerfile`

```
ARG NODE_VERSION=22
FROM node:22-alpine AS builder   → étape 1 : build (npm install + npm run build)
FROM node:22-alpine AS production → étape 2 : image finale (copie dist + node_modules)
CMD ["node", "dist/index.js"]
```

| Point                            | Statut | Détail                                                                                                                                                                   |
| -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Multi-stage build                | ✅     | 2 stages : `builder` + `production`                                                                                                                                      |
| Image de base                    | ✅     | `node:22-alpine` (légère, Node 22 aligné avec CI)                                                                                                                        |
| `openssl` installé               | ✅     | `apk add --no-cache openssl` — nécessaire pour Prisma                                                                                                                    |
| Certificat auto-signé généré     | ⚠️     | `openssl req` dans le Dockerfile pour HTTPS local — non utilisé en prod Azure (HTTPS géré par Azure) ; ajoute du bruit à l'image                                         |
| `npm install` (pas `npm ci`)     | ⚠️     | Stage `builder` utilise `npm install` au lieu de `npm ci` — moins reproductible (peut installer versions différentes si pas de lockfile)                                 |
| `docs/` copiés dans l'image prod | ⚠️     | `COPY --from=builder .../docs ./docs` — les docs Swagger sont nécessaires pour Swagger UI ; taille non critique mais à noter                                             |
| `prisma/` absent de l'image prod | ⚠️     | Pas de `COPY prisma` dans l'étape `production` — `npx prisma migrate deploy` ne peut pas tourner depuis le container de prod (migrations doivent être faites séparément) |

#### `compose.yaml`

| Point                                     | Statut | Détail                                                                                                                               |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Services définis                          | ✅     | `db` (MySQL 8.0) + `api` (Node)                                                                                                      |
| Healthcheck MySQL                         | ✅     | `mysqladmin ping` — `api` attend `db: condition: service_healthy`                                                                    |
| Port MySQL                                | ✅     | `3308:3306` — évite conflit avec MySQL local (3306/3307)                                                                             |
| Variables d'environnement externalisées   | ✅     | `env_file: .env.docker required: false` pour secrets Azure B2C                                                                       |
| Hot reload dev                            | ✅     | `nodemon` + volume `./src:/usr/src/app/src`                                                                                          |
| `target: builder` pour dev                | ✅     | Le container de dev utilise le stage `builder` (ts-node, pas le bundle)                                                              |
| `DATABASE_URL` en clair                   | ⚠️     | `mysql://stockhub:stockhub@db:3306/stockhub` hardcodé (credentials dev, pas de secrets prod — acceptable en local)                   |
| Pas de container Prisma migrations séparé | ⚠️     | Les migrations tournent dans la commande de démarrage de l'API (`npx prisma migrate deploy && nodemon...`) — fonctionnel mais couplé |

#### `.dockerignore`

✅ Complet : exclut `node_modules`, `dist`, `.env`, `.git`, `.vscode`, `build`
✅ Exclut aussi `docker-compose*` et `compose*` (bonne pratique)

---

### 2. Environnements distincts

**4 environnements documentés** dans `docs/technical/environments-setup.md` :

| Environnement   | Backend                        | Base de données              | Statut                                        |
| --------------- | ------------------------------ | ---------------------------- | --------------------------------------------- |
| **Local (dev)** | Docker + nodemon (Node 22)     | Docker MySQL 8.0 (port 3308) | ✅ Fonctionnel                                |
| **CI/Test**     | GitHub Actions (ubuntu-latest) | MySQL service container 8.0  | ✅ Fonctionnel                                |
| **Staging**     | Render.com (free tier)         | Aiven MySQL (free tier)      | ✅ Fonctionnel (avec contrainte veille Aiven) |
| **Production**  | Azure App Service F1           | Azure MySQL                  | ✅ Actif                                      |

#### Dev local

✅ `compose.yaml` opérationnel avec hot reload
✅ Scripts npm : `npm run azure:start` / `npm run azure:stop` (gestion quota F1 Azure 60 min/jour)
✅ Guide : `docs/technical/environments-setup.md`
✅ Troubleshooting : `docs/troubleshooting/docker-postman-azure-issues.md`
✅ `.nvmrc` présent → `22` (aligné avec CI)

#### CI/Test

✅ Jobs GitHub Actions dans des runners `ubuntu-latest` (éphémères)
✅ MySQL sidecar dans le job `e2e-tests` (container éphémère, détruit après le job)
✅ Isolation complète par run

#### Staging (Render.com)

✅ `render.yaml` à la racine — configuration as code
✅ `autoDeploy: false` — déploiement manuel via webhook (contrôle explicite)
✅ `healthCheckPath: /api-docs.json`
✅ Secrets définis dans le dashboard Render (`sync: false`) — jamais dans le fichier YAML
✅ Troubleshooting : `docs/troubleshooting/staging-render-issues.md`
⚠️ **`nodeVersion: 20` dans `render.yaml`** — drift avec la branche actuelle `feat-issue-24-upgrade-node22` (devra être mis à jour à `22` au merge)
⚠️ Aiven MySQL free tier se met en veille → procédure de réveil documentée dans troubleshooting

#### Production (Azure App Service)

✅ Azure App Service actif : `stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net`
✅ Déploiement CD automatique sur push `main` via `main_stockhub-back.yml`
✅ Variables d'environnement configurées dans Azure App Service (pas dans le code)
⚠️ Plan F1 gratuit : quota 60 min CPU/jour → risque d'interruption en production
⚠️ Pas de slot de déploiement (blue/green) — downtime possible lors du deploy

---

### 3. Monitoring et alertes

#### Application Insights

✅ `applicationinsights` v3.3.0 dans `package.json` (dépendance de prod)
✅ `src/Utils/cloudLogger.ts` — Application Insights configuré et démarré automatiquement si `APPLICATIONINSIGHTS_CONNECTION_STRING` est défini :

- Auto-collect : requests, performance, exceptions, dependencies, console, live metrics
- Guard test : désactivé si `NODE_ENV === 'test'` ou `JEST_WORKER_ID !== undefined`
  ✅ `rootCloudEvent`, `rootDependency`, `rootException` disponibles pour tracking custom

⚠️ **Alertes Azure configurées** : non vérifiable depuis le code — la configuration des alertes (CPU, mémoire, taux d'erreur) se fait dans le portail Azure et n'est pas codifiée dans le repo

#### Warnings de dépréciation

D'après le README et git log, les warnings liés à `passport-azure-ad` (module déprécié) sont connus mais non résolus (migration vers `@azure/msal-node` non encore effectuée).

---

### 4. Documentation opérationnelle

| Document                                              | Présent ? | Contenu                                                                                                            |
| ----------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `docs/technical/environments-setup.md`                | ✅        | Guide complet des 4 environnements (prérequis, installation, démarrage, scripts)                                   |
| `docs/troubleshooting/docker-postman-azure-issues.md` | ✅        | Résolution problèmes Docker + Postman + Azure B2C                                                                  |
| `docs/troubleshooting/staging-render-issues.md`       | ✅        | Troubleshooting staging Render + Aiven MySQL                                                                       |
| `docs/troubleshooting/e2e-azure-ropc-issues.md`       | ✅        | Troubleshooting tests E2E ROPC                                                                                     |
| `.env.staging.example`                                | ✅        | Variables d'environnement staging documentées                                                                      |
| `.env.example` (root)                                 | ❌        | **Absent** — variables d'environnement local non documentées                                                       |
| Runbook de déploiement                                | ⚠️        | Implicitement dans `environments-setup.md` — pas de document "runbook" dédié avec procédure pas-à-pas numérotée    |
| Procédure de rollback                                 | ❌        | Non documentée — aucun fichier décrivant comment revenir à une version précédente (revert commit + redeploy Azure) |

---

### 5. CD automatique

#### Workflow `main_stockhub-back.yml` — jobs CD

| Job                 | Déclencheur                    | Environnement GitHub                       |
| ------------------- | ------------------------------ | ------------------------------------------ |
| `deploy-to-staging` | `workflow_dispatch` uniquement | `Staging` (URL: `vars.RENDER_STAGING_URL`) |
| `build-and-deploy`  | Push sur `main` uniquement     | `Production` (URL: webapp deploy output)   |

✅ Environnement GitHub `Production` défini (avec URL)
✅ Environnement GitHub `Staging` défini
✅ Deploy Azure utilise `azure/webapps-deploy@v2` avec `publish-profile` depuis secrets
✅ Deploy staging via curl webhook Render (simple et efficace)
⚠️ **Pas de environment protection rules sur `Production`** — le deploy sur Azure se déclenche automatiquement sur push `main` sans approbation manuelle requise (pas de gate humain)
⚠️ **`build-and-deploy` ne nécessite pas que `e2e-tests` passe** — `needs: [continuous-integration]` seulement ; les tests E2E (qui ne tournent que sur PR vers main) ne bloquent pas le deploy direct sur main

#### CODEOWNERS

✅ `.github/CODEOWNERS` présent — protection de code par propriétaire

---

### 6. Collaboration (Ce3.5 #20)

| Pratique                   | Statut | Détail                                                               |
| -------------------------- | ------ | -------------------------------------------------------------------- |
| PRs avec template          | ✅     | `.github/PULL_REQUEST_TEMPLATE.md`                                   |
| CODEOWNERS                 | ✅     | `.github/CODEOWNERS`                                                 |
| Conventional Commits       | ✅     | commitlint + Husky                                                   |
| Branch protection (main)   | ⚠️     | Non vérifiable depuis le code — à vérifier dans GitHub Settings      |
| Review requise avant merge | ⚠️     | Non configurable dans les fichiers — à vérifier dans GitHub Settings |
| Issue templates            | ✅     | `.github/ISSUE_TEMPLATE/` présent (vu en Audit 4)                    |

---

### Score global — Audit 6

| Critère RNCP                                                   | Score       | Détail                                                                                                                        |
| -------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Ce3.5 #17 — Docker/docker-compose environnement unifié         | ✅ Conforme | Multi-stage Dockerfile + compose.yaml fonctionnel + .dockerignore complet                                                     |
| Ce3.5 #18 — Alertes anomalies/échecs pipeline                  | ⚠️ Partiel  | Application Insights configuré côté code ; alertes Azure portail non codifiées ; pas de notification Slack/email sur échec CI |
| Ce3.5 #19 — Chaîne d'outils automatisée qualité                | ✅ Conforme | lint + tsc + test:unit + security-audit + release-please + knip en pipeline                                                   |
| Ce3.5 #20 — Collaboration facilitée (PRs, reviews, protection) | ⚠️ Partiel  | PR template + CODEOWNERS + Conventional Commits ✅ ; branch protection rules à confirmer dans GitHub Settings                 |
| Ce3.5 #21 — Stabilité staging/prod + cycles courts             | ⚠️ Partiel  | Staging Render ✅ ; prod Azure F1 avec quota CPU limité ⚠️ ; pas de rollback documenté                                        |
| Ce3.5 #22 — 3 environnements distincts (dev/test/prod)         | ✅ Conforme | 4 environnements documentés : local Docker, CI GitHub Actions, staging Render, prod Azure                                     |

**Score global** : ⚠️ **Partiel** — Infrastructure solide avec 4 environnements distincts et monitoring Application Insights. Lacunes : rollback non documenté, `.env.example` absent, `nodeVersion: 20` dans `render.yaml` à synchroniser.

---

### Actions recommandées

1. 🔴 **Créer `.env.example`** à la racine — variables d'environnement locales documentées (Ce3.5 #21 — stabilité onboarding) ; `.env.staging.example` existe mais pas le fichier root pour développeurs

2. 🔴 **Mettre à jour `render.yaml` → `nodeVersion: 22`** au merge de `feat-issue-24-upgrade-node22` — drift critique avec Dockerfile et CI (Node 22 vs Node 20 en staging)

3. 🟡 **Documenter une procédure de rollback** — `docs/ci-cd/ROLLBACK-PROCEDURE.md` : `git revert` + push main → redeploy Azure automatique ; cas Render : manual deploy via webhook d'une version précédente

4. 🟡 **Ajouter environment protection rule sur `Production`** dans GitHub Settings — nécessite 1 approbateur avant deploy Azure (Ce3.5 #20)

5. 🟡 **Lier `build-and-deploy` aux `e2e-tests`** — ajouter `e2e-tests` dans `needs:` du job `build-and-deploy` pour éviter deploy si E2E échouent (aujourd'hui les E2E ne bloquent pas le deploy main)

6. 🟡 **Ajouter notification CI** — configurer une alerte email/Slack sur échec du pipeline (Ce3.5 #18) — GitHub Actions supporte nativement les notifications par email

7. 🟢 **Remplacer `npm install` par `npm ci` dans le `Dockerfile`** (stage builder) — reproductibilité garantie

8. 🟢 **Supprimer la génération du certificat auto-signé** du Dockerfile de production — inutile si HTTPS est géré par Azure App Service

---

_Prêt pour l'Audit 7 à votre validation._

---

## AUDIT 7 — Documentation technique et ADRs

> Critères RNCP : Ce2.4 #1, Ce3.1 #7, RNCP Bloc 2 global

---

### 1. ADRs (`docs/adr/`)

#### Liste complète des ADRs

| #       | Titre                                                        | Date          | Statut     |
| ------- | ------------------------------------------------------------ | ------------- | ---------- |
| ADR-001 | Migration vers une architecture DDD/CQRS                     | Novembre 2024 | ✅ Accepté |
| ADR-002 | Choix de Prisma ORM                                          | 2025-12-17    | ✅ Accepté |
| ADR-003 | Azure AD B2C pour l'authentification                         | 2025-12-17    | ✅ Accepté |
| ADR-004 | Tests sur Value Objects et Entities                          | 2025-12-17    | ✅ Accepté |
| ADR-005 | Versioning API (V2 sans V1)                                  | 2025-12-17    | ✅ Accepté |
| ADR-006 | MySQL Azure vs autres clouds                                 | 2025-12-17    | ✅ Accepté |
| ADR-007 | Application stricte des standards de qualité de code         | 2024-12-19    | ✅ Accepté |
| ADR-008 | Utilisation de Type Aliases pour les requêtes Express typées | 2025-12-26    | ✅ Accepté |
| ADR-009 | Système d'autorisation hybride basé sur les ressources       | 2025-12-27    | ✅ Accepté |
| ADR-010 | Optimisation de la pipeline CI/CD GitHub Actions             | 2025-12-27    | ✅ Accepté |

**10 ADRs + INDEX.md + TEMPLATE.md** dans `docs/adr/`

#### Vérification des sections obligatoires

Tous les ADRs (1 à 10) contiennent :

| Section                  | Présent ?                            |
| ------------------------ | ------------------------------------ |
| Contexte                 | ✅ Tous                              |
| Décision                 | ✅ Tous                              |
| Alternatives considérées | ✅ Tous (2 à 3 alternatives par ADR) |
| Conséquences             | ✅ Tous (positives + négatives)      |

✅ **Structure ADR exemplaire** — chaque ADR justifie la décision prise, liste les alternatives rejetées avec leurs avantages/inconvénients, et documente les risques et mesures de mitigation.

#### Décisions importantes non documentées

| Décision                                                             | ADR existant ? | Remarque                                                                              |
| -------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- |
| Choix Render.com vs Railway/Heroku pour staging                      | ❌ Absent      | ADR-006 couvre MySQL Azure mais pas le choix Render                                   |
| Choix Aiven vs PlanetScale vs ClearDB pour MySQL staging             | ❌ Absent      | Non documenté                                                                         |
| Migration Node 20 → Node 22 (branche actuelle)                       | ❌ Absent      | Impacte Dockerfile, CI, render.yaml — mérite un ADR ou au moins une note de migration |
| Choix `passport-azure-ad` (déprécié) vs migration `@azure/msal-node` | ❌ Absent      | Décision de maintien d'une dépendance dépréciée non documentée                        |
| Downgrade `--audit-level=critical` (commit `a91dcb6`)                | ❌ Absent      | Identifié en Audit 4 — décision de sécurité non documentée                            |

---

### 2. OpenAPI (`docs/openapi.yaml`)

#### Endpoints documentés vs endpoints réels

**Endpoints V2 réels** (d'après `README.md` et `StockRoutesV2.ts`) :

| Endpoint                                         | OpenAPI ?     | Méthode                                    |
| ------------------------------------------------ | ------------- | ------------------------------------------ |
| `GET /api/v2/stocks`                             | ✅            | Documenté avec schémas et exemples         |
| `POST /api/v2/stocks`                            | ✅            | Documenté avec body, 201, 400, 401         |
| `GET /api/v2/stocks/{stockId}`                   | ✅            | Documenté                                  |
| `PATCH /api/v2/stocks/{stockId}`                 | ❌ **Absent** | Endpoint implémenté (PR #80) non documenté |
| `DELETE /api/v2/stocks/{stockId}`                | ❌ **Absent** | Endpoint implémenté non documenté          |
| `GET /api/v2/stocks/{stockId}/items`             | ✅            | Documenté avec exemples                    |
| `POST /api/v2/stocks/{stockId}/items`            | ✅            | Documenté                                  |
| `PATCH /api/v2/stocks/{stockId}/items/{itemId}`  | ✅            | Documenté                                  |
| `DELETE /api/v2/stocks/{stockId}/items/{itemId}` | ❌ **Absent** | Issue #92 (v2.5.0) non documenté           |

**Endpoints V1** : aucun documenté dans `openapi.yaml` — justifiable car V1 est legacy, mais les E2E l'utilisent encore pour les mutations.

**Bilan drift** : 3 endpoints sur 8 manquants dans OpenAPI → **37% des endpoints V2 non documentés**

#### Qualité de ce qui est documenté

✅ Schémas de requête/réponse complets avec `$ref` vers composants réutilisables
✅ Exemples concrets fournis pour requêtes et réponses (2+ exemples par endpoint)
✅ Codes d'erreur documentés (400, 401, 404, 500) avec composants partagés `$ref: '#/components/responses/...'`
✅ Authentification Bearer documentée dans `securitySchemes` avec description du flow Azure B2C
✅ Tags CQRS (Stock Visualization READ / Stock Manipulation WRITE) reflètent l'architecture
⚠️ `version: 2.0.0` dans l'info — CHANGELOG est en v2.5.0 (drift de version dans le spec)
⚠️ URL serveur prod : `https://stockhub-back.azurewebsites.net` — URL obsolète (l'URL actuelle est `stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net`)

---

### 3. README

#### Vérification des éléments attendus

| Élément                   | Présent ? | Remarque                                                                                                  |
| ------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| Badge CI/CD               | ✅        | `main_stockhub-back.yml` badge                                                                            |
| Badge Security Audit      | ✅        | `security-audit.yml` badge                                                                                |
| Badge version             | ⚠️        | Affiche `2.4.0` — dernière release est `v2.5.0` (CHANGELOG)                                               |
| Badge Node                | ⚠️        | Affiche `20.x` — branche actuelle monte vers Node 22                                                      |
| Getting Started complet   | ✅        | Clone + npm install + `.env.docker` + `docker compose up` + seed                                          |
| Variables d'environnement | ⚠️        | Référence `docs/technical/environments-setup.md` — pas directement dans le README ; `.env.example` absent |
| Coverage badge/taux       | ❌        | **Absent** — aucun taux de coverage back-end affiché                                                      |
| ADRs listés avec liens    | ✅        | Tableau des 10 ADRs avec dates et liens                                                                   |
| Description API           | ✅        | Endpoints V2 listés, exemples JSON                                                                        |
| Tests documentés          | ✅        | Scripts test:unit, test:integration, test:e2e, test:coverage listés                                       |
| Postman                   | ✅        | Collections et environnements documentés                                                                  |
| Scripts npm               | ✅        | Tableau complet des scripts disponibles                                                                   |

#### Dérives notables dans le README

- **Section "Évolutions prévues"** (ligne 197-199) : "_Système de scopes pour les utilisateurs (partage de stocks entre membres d'une famille)_" → déjà implémenté en v2.2.0 (Issue #62, ADR-009) — section non mise à jour après implémentation
- **Staging URL** (ligne 19) : `https://stockhub-back.onrender.com` (URL générique) vs URL réelle visible dans workflows
- **Exemple de réponse** (ligne 228) : `"quantity": { "value": 5 }` expose l'objet `Quantity` interne — le vrai endpoint V2 retourne `"quantity": 5` (integer) — drift documentation/code

---

### 4. CHANGELOG

✅ **Auto-généré par release-please** — format Keep a Changelog respecté
✅ **9 releases taguées** : v1.1.0 → v1.2.0 → v1.3.0 → v2.0.0 → v2.1.0 → v2.1.1 → v2.2.0 → v2.3.0 → v2.4.0 → **v2.5.0**
✅ **Semver respecté** : breaking changes → major, features → minor, fixes → patch
✅ Chaque release liste les sections `Features`, `Bug Fixes`, `Documentation`, `Chores` générées automatiquement depuis les Conventional Commits
⚠️ Pas de section `BREAKING CHANGES` explicite visible (breaking changes identifiés par changements de version majeure — v1.x → v2.0.0)

---

### Score global — Audit 7

| Critère RNCP                                               | Score       | Détail                                                                                                                                    |
| ---------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Ce2.4 #1 — Back-end répond au CDC, architecture documentée | ✅ Conforme | 10 ADRs complets, README avec architecture DDD/CQRS, use cases, choix techniques                                                          |
| Ce3.1 #7 — Dépôt partagé + historique lisible              | ✅ Conforme | Conventional Commits, CHANGELOG auto, releases taguées, ADRs comme trace des décisions                                                    |
| OpenAPI complétude                                         | ⚠️ Partiel  | 5/8 endpoints V2 documentés — 3 endpoints récents manquants (PATCH stock, DELETE stock, DELETE item)                                      |
| Documentation opérationnelle                               | ⚠️ Partiel  | Guides techniques solides ; README avec dérives (version, Node, sections obsolètes)                                                       |
| Décisions architecturales tracées                          | ⚠️ Partiel  | 10 ADRs exemplaires ; 5 décisions importantes non documentées (Render, Aiven, Node 22, passport-azure-ad déprécié, audit level downgrade) |

**Score global** : ⚠️ **Partiel** — Fondation documentaire solide (10 ADRs structurés, CHANGELOG auto, README complet). Dérives identifiables pour le jury : 3 endpoints manquants dans OpenAPI, badges de version obsolètes, coverage absent.

---

### Actions recommandées

1. 🔴 **Mettre à jour `docs/openapi.yaml`** — ajouter les 3 endpoints manquants : `PATCH /api/v2/stocks/{stockId}`, `DELETE /api/v2/stocks/{stockId}`, `DELETE /api/v2/stocks/{stockId}/items/{itemId}` (Ce2.4 #1 — le jury vérifiera la cohérence code/doc)

2. 🔴 **Corriger le badge version** dans `README.md` : `2.4.0` → `2.5.0` et badge Node `20.x` → `22.x` au merge de la branche actuelle

3. 🟡 **Supprimer/mettre à jour la section "Évolutions prévues"** dans le README — le partage familial avec rôles est déjà implémenté depuis v2.2.0 (Issue #62)

4. 🟡 **Corriger l'URL prod dans `openapi.yaml`** : `stockhub-back.azurewebsites.net` → URL actuelle

5. 🟡 **Corriger la version dans `openapi.yaml`** : `2.0.0` → `2.5.0`

6. 🟡 **Créer ADR-011 : Choix Render.com + Aiven pour staging** — documenter le choix de la plateforme de staging vs alternatives (Railway, Fly.io...) — décision importante pour la grille RNCP Ce3.5

7. 🟡 **Créer ADR-012 : Migration Node 20 → 22** (ou note de migration) — documenter les raisons, la procédure, les impacts

8. 🟢 **Corriger l'exemple de réponse dans le README** — `"quantity": { "value": 5 }` → `"quantity": 5` (format réel de l'API V2)

9. 🟢 **Documenter la décision `--audit-level=critical`** dans l'ADR ou un commentaire de code — supprimer la dette documentaire identifiée en Audit 4

---

_Audit 7 terminé — tous les audits sont complétés._
