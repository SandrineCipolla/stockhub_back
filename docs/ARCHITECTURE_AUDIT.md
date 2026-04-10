# Audit Architecture DDD/CQRS — stockhub_back

**Date :** 10 avril 2026
**Version auditée :** v2.1.1 — branche `main`
**Auditeur :** Claude Code (à partir du code réel, sans supposition)

---

## 1. Cartographie complète de `src/`

```
src/
├── index.ts                                  # Point d'entrée Node.js
├── initializeApp.ts                          # Bootstrap Express (CORS, Passport, routes, Swagger)
├── authConfig.ts                             # Config Azure AD B2C (clientID, authority, audience)
│
├── authentication/
│   ├── authBearerStrategy.ts                 # Stratégie Passport Bearer (Azure B2C)
│   └── authenticateMiddleware.ts             # Middleware d'authentification (extrait email du token)
│
├── authorization/
│   ├── authorizeMiddleware.ts                # Middleware d'autorisation resource-based (OWNER/EDITOR/VIEWER)
│   ├── constants/permissions.ts              # Constantes PERMISSIONS, HTTP_STATUS, messages d'erreur
│   └── repositories/AuthorizationRepository.ts # Accès Prisma pour vérifier ownership/rôle collaborateur
│
├── config/
│   ├── authenticationConfig.ts               # Lecture des variables d'env Azure B2C
│   ├── httpPortConfiguration.ts              # Résolution du port HTTP
│   ├── models.ts                             # Types partagés de configuration
│   ├── openapi.config.ts                     # Chargement du fichier openapi.yaml + spec Swagger
│   └── runtimeMode.ts                        # Détection mode dev/prod
│
├── serverSetup/
│   └── setupHttpServer.ts                    # Démarrage du serveur HTTP (listen)
│
├── Utils/
│   ├── cloudLogger.ts                        # Logger Azure Application Insights (rootException)
│   ├── express.d.ts                          # Augmentation du type Express.Request (userID, authInfo)
│   ├── httpCodes.ts                          # Constantes HTTP_CODE_OK, HTTP_CODE_CREATED
│   └── logger.ts                             # Logger structuré (rootMain, rootController, rootDatabase, rootSecurity...)
│
├── services/                                 # ⚠️ Couche orpheline — voir §2.4
│   ├── readUserRepository.ts                 # Lecture utilisateur via Prisma (OID → ID)
│   ├── userService.ts                        # Conversion OID Azure → ID interne + création automatique
│   └── writeUserRepository.ts               # Création utilisateur via Prisma (upsert)
│
├── api/
│   ├── errors.ts                             # Types CustomError + fonction sendError
│   ├── controllers/
│   │   ├── StockCollaboratorController.ts    # CRUD collaborateurs (add/update/remove/list)
│   │   ├── StockContributionController.ts    # Workflow contributions VIEWER_CONTRIBUTOR
│   │   ├── StockControllerManipulation.ts    # Commandes stocks et items (create/update/delete)
│   │   ├── StockControllerVisualization.ts   # Lectures stocks (getAllStocks, getStockDetails, getStockItems)
│   │   ├── StockPredictionController.ts      # Endpoints historique + prédictions
│   │   └── StockSuggestionsController.ts     # Endpoint suggestions IA (LLM + déterministe)
│   ├── dto/
│   │   ├── StockDTO.ts                       # Types DTO (StockSummaryDto, StockDetailDto, StockItemDto…)
│   │   └── mappers/StockMapper.ts            # Mappers entités → DTO pour la sérialisation API
│   ├── routes/
│   │   ├── StockRoutesV2.ts                  # Factory DI : instancie toute la chaîne et déclare les routes
│   │   └── constants/routePaths.ts           # Constantes des chemins de routes (STOCK_ROUTES)
│   └── types/
│       ├── AuthenticatedRequest.ts           # Type Express.Request enrichi avec userID
│       └── StockRequestTypes.ts              # Types des body/params pour chaque route
│
├── domain/
│   ├── ai/
│   │   ├── IAIService.ts                     # Interface domaine (generateSuggestions)
│   │   └── prompts/stockSuggestions.ts       # Templates de prompts LLM
│   │
│   ├── authorization/
│   │   ├── collaboration/
│   │   │   ├── command-handlers/
│   │   │   │   ├── AddCollaboratorCommandHandler.ts
│   │   │   │   ├── CollaboratorPermissions.ts
│   │   │   │   ├── RemoveCollaboratorCommandHandler.ts
│   │   │   │   └── UpdateCollaboratorRoleCommandHandler.ts
│   │   │   ├── commands/
│   │   │   │   ├── AddCollaboratorCommand.ts
│   │   │   │   ├── RemoveCollaboratorCommand.ts
│   │   │   │   └── UpdateCollaboratorRoleCommand.ts
│   │   │   └── repositories/ICollaboratorRepository.ts
│   │   └── common/
│   │       ├── entities/Family.ts            # Aggregate Family avec règles métier (lastAdmin, unicité)
│   │       ├── errors/FamilyErrors.ts        # Erreurs domaine spécifiques (FamilyNameEmptyError…)
│   │       └── value-objects/
│   │           ├── FamilyRole.ts
│   │           ├── FamilyRoleEnum.ts
│   │           ├── StockRole.ts
│   │           └── StockRoleEnum.ts
│   │
│   ├── prediction/
│   │   ├── repositories/
│   │   │   ├── IItemHistoryRepository.ts     # Interface historique des variations de quantité
│   │   │   └── IPredictionRepository.ts      # Interface persistance des prédictions calculées
│   │   └── services/StockPredictionService.ts # Service domaine : calcul déterministe (avg, trend, daysUntilEmpty)
│   │
│   └── stock-management/
│       ├── common/
│       │   ├── entities/
│       │   │   ├── ItemContribution.ts       # Entité contribution (VIEWER_CONTRIBUTOR workflow)
│       │   │   ├── Stock.ts                  # Agrégat principal (addItem, removeItem, updateItemQuantity…)
│       │   │   └── StockItem.ts              # Entité item (getStatus, isLowStock, isOutOfStock)
│       │   ├── enums/StockCategory.ts
│       │   └── value-objects/
│       │       ├── ContributionStatus.ts
│       │       ├── Quantity.ts               # VO quantité (isZero, isLessOrEqualToMinimum)
│       │       ├── StockDescription.ts
│       │       └── StockLabel.ts             # VO label (validation min 3 / max 50 chars)
│       ├── manipulation/
│       │   ├── commands/                     # 9 Command objects (DTOs intention)
│       │   ├── repositories/
│       │   │   ├── IContributionRepository.ts
│       │   │   └── IStockCommandRepository.ts
│       │   └── use-cases/                    # 9 CommandHandlers (logique applicative écriture)
│       └── visualization/
│           ├── models/StockSummary.ts        # DTOs lecture (StockSummaryDto, StockDetailDto)
│           ├── queries/IStockVisualizationRepository.ts
│           └── services/StockVisualizationService.ts
│
└── infrastructure/
    ├── ai/
    │   └── OpenRouterAIService.ts            # Implémentation HTTP de IAIService (OpenRouter)
    ├── authorization/
    │   └── repositories/PrismaCollaboratorRepository.ts
    ├── prediction/
    │   └── repositories/
    │       ├── PrismaItemHistoryRepository.ts
    │       └── PrismaStockPredictionRepository.ts
    └── stock-management/
        ├── manipulation/
        │   ├── repositories/
        │   │   ├── PrismaContributionRepository.ts
        │   │   └── PrismaStockCommandRepository.ts
        │   └── types/prisma.ts               # Types intermédiaires Prisma → domaine
        └── visualization/
            └── repositories/PrismaStockVisualizationRepository.ts
```

**Total : 83 fichiers TypeScript dans `src/`**

---

## 2. Analyse par couche

### 2.1 Domain — ✅ conforme (avec écarts mineurs justifiables)

#### Sous-domaine `stock-management`

| Composant DDD         | Présent        | Fichiers                                                                                                                                        |
| --------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Aggregate root        | ✅             | `Stock` (addItem, removeItem, updateItemQuantity, invariants)                                                                                   |
| Entity                | ✅             | `StockItem`, `ItemContribution`                                                                                                                 |
| Value Objects         | ✅             | `Quantity`, `StockLabel`, `StockDescription`, `ContributionStatus`                                                                              |
| Interfaces repository | ✅             | `IStockCommandRepository`, `IStockVisualizationRepository`, `IContributionRepository`                                                           |
| Commands (intentions) | ✅             | 9 commands (CreateStock, AddItem, UpdateItem, UpdateItemQuantity, UpdateStock, DeleteStock, DeleteItem, CreateContribution, ReviewContribution) |
| Command Handlers      | ✅             | 9 handlers dans `use-cases/`                                                                                                                    |
| Domain Service        | ✅ (implicite) | Logique dans `Stock.create()`, `Stock.addItem()`                                                                                                |
| Domain Events         | ❌ absent      | Pas de publication d'événements (ex: `ItemAdded`, `StockDeleted`)                                                                               |
| Enum propre           | ✅             | `StockCategory`                                                                                                                                 |

**Verdict :** Conforme au DDD pragmatique. Les règles métier sont dans les entités (`Stock.addItem` vérifie les doublons, la quantité négative ; `StockItem.getStatus` calcule le statut). L'absence de Domain Events est un écart assumé — défendable car le projet n'a pas encore de besoins d'audit trail ou d'event sourcing.

**Observation sur `Stock` :** L'agrégat accepte `string | StockLabel` pour `label` et `description`. C'est un pragmatisme pour la reconstruction depuis la DB (évite de reconstruire les VOs à chaque lecture Prisma), mais cela affaiblit la protection de l'invariant à l'intérieur même de l'agrégat.

#### Sous-domaine `authorization`

| Composant DDD        | Présent | Fichiers                                                                       |
| -------------------- | ------- | ------------------------------------------------------------------------------ |
| Aggregate            | ✅      | `Family` (addMember, removeMember, updateMemberRole, protection dernier admin) |
| Value Objects        | ✅      | `FamilyRole`, `StockRole` (encapsulent les enums + permissions)                |
| Errors domaine       | ✅      | `FamilyErrors.ts` (FamilyNameEmptyError, LastAdminError…)                      |
| Commands             | ✅      | AddCollaborator, UpdateCollaboratorRole, RemoveCollaborator                    |
| Command Handlers     | ✅      | Les 3 handlers correspondants                                                  |
| Interface repository | ✅      | `ICollaboratorRepository`                                                      |

**Verdict :** Conforme. `Family` est un vrai aggregate root avec invariants (protection du dernier admin, unicité des membres). Le système de rôles `StockRole.hasRequiredPermission()` encapsule bien la logique de permissions.

#### Sous-domaine `prediction`

| Composant DDD         | Présent   | Fichiers                                                                                    |
| --------------------- | --------- | ------------------------------------------------------------------------------------------- |
| Domain Service        | ✅        | `StockPredictionService` (avgDailyConsumption, detectTrend, daysUntilEmpty, computeAndSave) |
| Interfaces repository | ✅        | `IItemHistoryRepository`, `IPredictionRepository`                                           |
| Entities / VOs        | ❌ absent | Les données de prédiction sont des objets plain (pas d'entité `Prediction`)                 |

**Verdict :** DDD pragmatique. Le service de prédiction est pur (pas de dépendance infrastructure), stateless, entièrement testable via mocks des interfaces.

#### Sous-domaine `ai`

| Composant DDD     | Présent    | Fichiers                                                                    |
| ----------------- | ---------- | --------------------------------------------------------------------------- |
| Interface domaine | ✅         | `IAIService` (generateSuggestions)                                          |
| Domain Service    | ❌ absent  | Pas de service domaine — `IAIService` est une interface pure                |
| Prompts           | ⚠️ présent | `prompts/stockSuggestions.ts` — contenu de prompt (strings) dans le domaine |

**Verdict :** Cohérent. L'interface `IAIService` est correctement placée dans le domaine, l'implémentation HTTP dans `infrastructure/ai/`. Les prompts dans `domain/ai/prompts/` sont défendables comme "connaissance métier sur comment interroger l'IA".

---

### 2.2 API (Présentation) — ✅ conforme

#### Controllers

Tous les controllers respectent le principe de couche présentation :

- **Aucune logique métier** dans les controllers — ils reçoivent la requête, construisent une Command, appellent le handler, renvoient la réponse HTTP.
- `StockControllerManipulation` : `getValidatedOID()` est la seule logique interne, et elle ne concerne que la validation d'authentification (extraction OID du token), pas la logique métier.
- `StockVisualizationService` est appelé directement depuis `StockControllerVisualization` (côté Query, pas de Command).

#### DTOs et Mappers

- `StockDTO.ts` : DTOs de lecture (StockSummaryDto, StockDetailDto, StockItemDto) — bien séparés des entités domaine.
- `StockMapper.ts` : Transformations entités → DTOs, correctement isolés dans l'API.

#### Routes

`StockRoutesV2.ts` joue le rôle de **composition root** (DI factory) : toutes les instanciations y sont centralisées. C'est le seul endroit où `new PrismaClient()` peut apparaître. Ce pattern (factory function `configureStockRoutesV2`) permet l'injection de `PrismaClient` pour les tests.

**Observation :** La route `PATCH /stocks/:stockId/items/:itemId` appelle `manipulationController.updateItem()` mais la constante dans `routePaths.ts` s'appelle `UPDATE_ITEM_QUANTITY`. Cohérence du nommage à aligner.

---

### 2.3 Infrastructure — ✅ conforme

Tous les repositories Prisma implémentent les interfaces définies dans le domaine :

| Interface domaine               | Implémentation infrastructure        |
| ------------------------------- | ------------------------------------ |
| `IStockCommandRepository`       | `PrismaStockCommandRepository`       |
| `IStockVisualizationRepository` | `PrismaStockVisualizationRepository` |
| `IContributionRepository`       | `PrismaContributionRepository`       |
| `ICollaboratorRepository`       | `PrismaCollaboratorRepository`       |
| `IItemHistoryRepository`        | `PrismaItemHistoryRepository`        |
| `IPredictionRepository`         | `PrismaStockPredictionRepository`    |
| `IAIService`                    | `OpenRouterAIService`                |

La règle de dépendance est respectée : l'infrastructure connaît le domaine (pour implémenter les interfaces), mais le domaine ne connaît pas l'infrastructure.

**Pattern DI :** `prismaClient ?? new PrismaClient()` — systématiquement appliqué dans tous les repositories, ce qui permet l'injection d'un client de test sans container IoC.

---

### 2.4 Services (`src/services/`) — ⚠️ couche mal positionnée, mais contenu justifiable

#### Contenu réel

| Fichier                  | Ce qu'il fait vraiment                                                             | Couche DDD correcte    |
| ------------------------ | ---------------------------------------------------------------------------------- | ---------------------- |
| `readUserRepository.ts`  | Accès Prisma — `findUnique` sur `user` par email/OID                               | Infrastructure         |
| `writeUserRepository.ts` | Accès Prisma — `upsert` sur `user`                                                 | Infrastructure         |
| `userService.ts`         | Orchestration : convertit un OID Azure en ID interne, crée l'utilisateur si absent | Application (use case) |

#### Verdict

`src/services/` est une **couche applicative orpheline** — elle n'est ni domaine (contient du code Prisma), ni infrastructure (contient de la logique d'orchestration), ni api (n'expose pas de routes).

**Raison historique :** Ce dossier est un héritage de la V1 (code pré-DDD). Il a survécu à la migration car `UserService` est injecté dans plusieurs controllers et handlers. La migration Prisma de `UserService` a été faite (issue #192) mais le placement n'a pas été corrigé.

**Recommandation DDD :**

- `readUserRepository.ts` → `src/infrastructure/user/repositories/PrismaReadUserRepository.ts`
- `writeUserRepository.ts` → `src/infrastructure/user/repositories/PrismaWriteUserRepository.ts`
- `userService.ts` → `src/domain/user/services/UserService.ts` (ou couche application si isolée)

**Formulation orale pour le jury :** _"Le dossier `services/` est un vestige de la migration V1→V2. Son contenu correspond fonctionnellement à un repository infrastructure et un application service. Le déplacement n'a pas été priorisé car il n'introduit pas de violation de dépendance — le domaine n'en dépend pas — mais c'est un écart de nommage que j'identifie et planifie de corriger."_

---

### 2.5 Authentication / Authorization — ✅ conforme

#### Distinction claire

| Couche               | Fichier                     | Rôle                                                                                   | Question répondue |
| -------------------- | --------------------------- | -------------------------------------------------------------------------------------- | ----------------- |
| **Authentification** | `authenticateMiddleware.ts` | Valide le token Bearer Azure B2C via Passport, extrait l'email (OID) dans `req.userID` | Qui es-tu ?       |
| **Autorisation**     | `authorizeMiddleware.ts`    | Vérifie le rôle de l'utilisateur sur la ressource (stock) demandée                     | As-tu le droit ?  |

#### Flux de sécurité

```
Requête → authenticationMiddleware (Passport Bearer → extrait OID)
        → authorizeStockAccess (vérifie ownership ou rôle collaborateur)
        → Controller
```

Le middleware d'autorisation est **resource-based** (par stock) et non global. Il accepte un `PrismaClient` optionnel pour les tests.

**Cohérence DDD :** `authorizeMiddleware.ts` utilise `StockRole` (Value Object du domaine) pour appeler `hasRequiredPermission()`. La logique de permission est dans le domaine, pas dans le middleware.

**Observation :** `AuthorizationRepository` dans `src/authorization/repositories/` est un accès Prisma direct (findUserByEmail, findStockById, findCollaboratorByUserAndStock) — il s'agit d'infrastructure, mais son placement dans `src/authorization/` est acceptable car il est exclusivement au service du middleware d'autorisation.

---

### 2.6 Config / Setup / Utils — ✅ conforme

| Fichier                           | Rôle concret                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `authConfig.ts`                   | Exporte l'objet de config Azure B2C (clientID, policyName, isB2C) lu depuis les variables d'env                                 |
| `config/authenticationConfig.ts`  | Lecture des variables AZURE\_\* depuis `process.env`                                                                            |
| `config/httpPortConfiguration.ts` | Résolution du port (PORT env var ou 3000 par défaut)                                                                            |
| `config/models.ts`                | Types partagés de configuration (interfaces)                                                                                    |
| `config/openapi.config.ts`        | Charge `docs/openapi.yaml` et produit le spec Swagger                                                                           |
| `config/runtimeMode.ts`           | Booléen `isDevelopment` / `isProduction`                                                                                        |
| `initializeApp.ts`                | Bootstrap complet Express : CORS, Passport, routes, Swagger, health check, error handler                                        |
| `serverSetup/setupHttpServer.ts`  | `app.listen()` — séparé de `initializeApp` pour faciliter les tests (on peut importer `initializeApp` sans démarrer le serveur) |
| `Utils/logger.ts`                 | Loggers nommés (rootMain, rootController, rootDatabase, rootSecurity, rootUserService…) — aucun `console.*`                     |
| `Utils/cloudLogger.ts`            | Logger Azure Application Insights (`rootException` pour les erreurs non gérées)                                                 |
| `Utils/express.d.ts`              | Augmentation de type `Express.Request` pour ajouter `userID?: string` et `authInfo`                                             |
| `Utils/httpCodes.ts`              | Constantes HTTP 200 / 201                                                                                                       |

**Observation :** La séparation `initializeApp` / `setupHttpServer` est un bon pattern — elle permet d'importer l'application dans les tests d'intégration sans qu'elle tente d'écouter sur un port.

---

## 3. Analyse CQRS

### Séparation Read / Write

| Côté                     | Composants                                                    | Localisation                             |
| ------------------------ | ------------------------------------------------------------- | ---------------------------------------- |
| **WRITE (Command side)** | 9 Commands + 9 CommandHandlers                                | `domain/stock-management/manipulation/`  |
| **WRITE (Authz)**        | 3 Commands + 3 CommandHandlers                                | `domain/authorization/collaboration/`    |
| **READ (Query side)**    | `IStockVisualizationRepository` + `StockVisualizationService` | `domain/stock-management/visualization/` |

### Commands implémentés

| Command                         | Handler                                | Déclenche historique            |
| ------------------------------- | -------------------------------------- | ------------------------------- |
| `CreateStockCommand`            | `CreateStockCommandHandler`            | —                               |
| `AddItemToStockCommand`         | `AddItemToStockCommandHandler`         | ✅ via `IItemHistoryRepository` |
| `UpdateItemCommand`             | `UpdateItemCommandHandler`             | ✅                              |
| `UpdateItemQuantityCommand`     | `UpdateItemQuantityCommandHandler`     | ✅                              |
| `UpdateStockCommand`            | `UpdateStockCommandHandler`            | —                               |
| `DeleteStockCommand`            | `DeleteStockCommandHandler`            | —                               |
| `DeleteItemCommand`             | `DeleteItemCommandHandler`             | —                               |
| `CreateContributionCommand`     | `CreateContributionCommandHandler`     | —                               |
| `ReviewContributionCommand`     | `ReviewContributionCommandHandler`     | —                               |
| `AddCollaboratorCommand`        | `AddCollaboratorCommandHandler`        | —                               |
| `UpdateCollaboratorRoleCommand` | `UpdateCollaboratorRoleCommandHandler` | —                               |
| `RemoveCollaboratorCommand`     | `RemoveCollaboratorCommandHandler`     | —                               |

### Queries implémentées

| Query                              | Service                      | Description                                        |
| ---------------------------------- | ---------------------------- | -------------------------------------------------- |
| `getAllStocks(userId)`             | `StockVisualizationService`  | Liste des stocks de l'utilisateur avec rôle viewer |
| `getStockDetails(stockId, userId)` | `StockVisualizationService`  | Détail d'un stock                                  |
| `getStockItems(stockId, userId)`   | `StockVisualizationService`  | Items d'un stock avec statut                       |
| `getItemHistory(itemId)`           | `StockPredictionController`  | Historique des variations                          |
| `getItemPrediction(itemId)`        | `StockPredictionController`  | Prédiction déterministe                            |
| `getStockSuggestions(stockId)`     | `StockSuggestionsController` | Suggestions LLM + déterministes                    |

### Verdict CQRS

La séparation read/write est **clairement établie et cohérente**. Le côté lecture n'utilise pas d'agrégats domaine — il retourne directement des DTOs depuis `IStockVisualizationRepository` (requêtes Prisma optimisées). Le côté écriture passe systématiquement par les CommandHandlers et les entités domaine.

**Pas de CommandBus ni QueryBus** : le dispatch est direct (appel de méthode). C'est du CQRS pragmatique — défendable pour ce niveau de complexité (pas besoin de bus middleware pour 12 commands).

---

## 4. Synthèse des ADRs

| ADR         | Décision                                                                     | Justification                                                                        | Alternatives rejetées                                                                           |
| ----------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| **ADR-001** | Architecture DDD/CQRS                                                        | Démonstration RNCP + invariants métier centralisés + séparation read/write           | Transaction Script (non scalable), Active Record (couplage ORM), Event Sourcing (trop complexe) |
| **ADR-002** | Prisma ORM                                                                   | Type-safety automatique, migrations versionnées, performance Rust, DX                | TypeORM (verbeux), Drizzle (trop récent), Sequelize (pas TypeScript-first)                      |
| **ADR-003** | Azure AD B2C                                                                 | Authentification managée, SSO, OIDC standard                                         | Auth0 (coût), JWT maison (sécurité à gérer soi-même)                                            |
| **ADR-004** | Tests Value Objects / Entities                                               | Logique métier testée sans DB (unitaire), intégration pour repos Prisma              | Tester uniquement via HTTP (tests trop larges)                                                  |
| **ADR-005** | Versioning API (`/api/v2`)                                                   | Coexistence V1 legacy / V2 DDD pendant migration                                     | Pas de versioning (breaking changes immédiats)                                                  |
| **ADR-006** | MySQL sur Azure                                                              | Base de données relationnelle, compatibilité Prisma, hébergement cloud               | PostgreSQL (moins maîtrisé), SQLite (pas prod-ready)                                            |
| **ADR-007** | ESLint + Prettier + commitlint                                               | 0 warning, format automatique, commits conventionnels vérifiés au pre-commit         | Revue manuelle (non fiable en solo)                                                             |
| **ADR-008** | Type aliases requêtes Express                                                | Typage fort des `req.body` / `req.params` par route                                  | `any` (non typé), validation runtime seule (Joi/Zod)                                            |
| **ADR-009** | Autorisation resource-based hybride (OWNER/EDITOR/VIEWER/VIEWER_CONTRIBUTOR) | Contexte familial réaliste, granularité par stock                                    | RBAC global (trop rigide), ABAC (trop complexe), permissions à la carte (UX difficile)          |
| **ADR-010** | Optimisation pipeline CI/CD                                                  | Cache npm, parallélisation unit/integration, artifacts de build                      | CI séquentiel (trop lent)                                                                       |
| **ADR-011** | Staging sur Render.com + Aiven MySQL                                         | Déploiement automatique branche staging, DB managée, coût zéro                       | Azure staging slot (coût), env local uniquement (pas de validation déploiement)                 |
| **ADR-012** | Node.js 22 LTS                                                               | Fetch natif, performance V8, LTS jusqu'en 2027                                       | Node 18 (plus maintenu), Node 20 (pas encore LTS long terme)                                    |
| **ADR-013** | LLM Provider : local vs cloud                                                | OpenRouter comme agrégateur de modèles, coût variable, pas de dépendance vendor-lock | Ollama local (pas de prod), OpenAI direct (coût, vendor lock)                                   |
| **ADR-014** | Prédictions déterministes (Niveau 1)                                         | Pas de LLM requis, calcul sur historique réel, résultats explicables                 | ML externe (complexité opérationnelle), LLM pour prédictions numériques (coût, latence)         |
| **ADR-015** | OpenRouter + fetch natif pour AIService                                      | Zéro dépendance npm supplémentaire, compatible Node 22, maîtrise du payload          | SDK Mistral officiel (vendor lock), SDK OpenAI (inutile si OpenRouter)                          |
| **ADR-016** | REST API                                                                     | Standard industrie, bien connu du jury, compatible OpenAPI                           | GraphQL (surcharge pour ce domaine), gRPC (pas adapté HTTP browser)                             |
| **ADR-017** | Express 4                                                                    | Minimaliste, maîtrisé, écosystème large, compatible Passport                         | Fastify (moins de ressources), NestJS (trop opinionated, overhead DI)                           |
| **ADR-018** | GitHub Flow                                                                  | Branches `main` + feature branches, PRs, Release Please                              | Git Flow (trop complexe pour solo), trunk-based (pas de revue possible)                         |

---

## 5. Couverture des tests

### Répartition par type

| Type                  | Localisation                | Nb fichiers | Ce qui est testé                                |
| --------------------- | --------------------------- | ----------- | ----------------------------------------------- |
| **Unitaires domaine** | `tests/domain/`             | 22 fichiers | Entities, VOs, CommandHandlers, Domain Services |
| **Unitaires API**     | `tests/api/`, `tests/unit/` | 5 fichiers  | Controllers, Mappers, Routes                    |
| **Intégration**       | `tests/integration/`        | 4 fichiers  | Repositories Prisma (TestContainers MySQL)      |
| **E2E**               | `tests/e2e/`                | 4 fichiers  | Workflows HTTP complets (Playwright)            |

### Détail couverture domaine

| Composant                                                              | Tests présents                                                    |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `Stock`                                                                | `Stock.test.ts` — création, addItem, removeItem, invariants       |
| `StockItem`                                                            | `StockItem.test.ts` — getStatus, isLowStock                       |
| `Family`                                                               | 4 fichiers (create, info, members, roles) — couverture exhaustive |
| `ItemContribution`                                                     | `ItemContribution.test.ts`                                        |
| VOs `Quantity`, `StockLabel`, `StockDescription`, `ContributionStatus` | 1 fichier par VO                                                  |
| VOs `FamilyRole`, `StockRole`                                          | 1 fichier par VO                                                  |
| CommandHandlers manipulation                                           | 7 fichiers (tous les handlers)                                    |
| `StockVisualizationService`                                            | `StockVisualizationService.test.ts`                               |
| `StockPredictionService`                                               | `StockPredictionService.test.ts` (10 cas)                         |
| `OpenRouterAIService`                                                  | `OpenRouterAIService.test.ts`                                     |
| Collaboration handlers                                                 | 4 fichiers                                                        |

### Gaps identifiés

| Composant                                                    | Statut                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `StockPredictionController`                                  | ❌ Pas de tests unitaires dédiés                                          |
| `StockContributionController`                                | ❌ Pas de tests unitaires dédiés                                          |
| `StockCollaboratorController`                                | ❌ Pas de tests unitaires dédiés                                          |
| `UserService` / `ReadUserRepository` / `WriteUserRepository` | ❌ Aucun test                                                             |
| `authorizeMiddleware`                                        | ✅ Test d'intégration présent (`authorizeMiddleware.integration.test.ts`) |
| `PrismaStockCommandRepository`                               | ✅ Test d'intégration                                                     |
| `PrismaStockVisualizationRepository`                         | ✅ Test d'intégration                                                     |

---

## 6. Violations de la règle de dépendance

Règle vérifiée : `domain` ne doit pas importer depuis `infrastructure`, `api` ou `@prisma/client`.

```bash
grep -r "from.*infrastructure" src/domain → (aucun résultat)
grep -r "from.*api" src/domain          → (aucun résultat)
grep -r "from.*prisma" src/domain       → (aucun résultat)
```

**Résultat : aucune violation détectée.**

Le domaine est totalement indépendant de l'infrastructure et de la couche API. Toutes les dépendances vont dans le bon sens : `api → domain ← infrastructure`.

---

## 7. Bilan et recommandations pour la soutenance

### Points forts à mettre en avant au jury

1. **Règle de dépendance parfaitement respectée** : le domaine est pur, sans import Prisma ni import API. Vérifiable avec une seule commande `grep`.

2. **CQRS lisible et cohérent** : deux chemins distincts (manipulation/visualization), deux interfaces repository distinctes, deux controllers distincts. La séparation n'est pas théorique — elle est visible dans l'arborescence.

3. **Entités avec invariants réels** : `Stock.addItem()` vérifie les doublons case-insensitive, la quantité négative. `Family.removeMember()` protège le dernier admin. Ces règles ne peuvent pas être contournées car elles sont dans le domaine, pas dans les controllers.

4. **Value Objects** qui se valident à la construction : impossible de créer un `StockLabel` invalide (< 3 chars, > 50 chars) ou une `Quantity` négative.

5. **Injection de dépendances sans container** : le pattern `prismaClient ?? new PrismaClient()` + factory dans `StockRoutesV2.ts` rend tout testable sans framework DI. Simple à expliquer et à défendre.

6. **Module IA intégré dans l'architecture** : `IAIService` dans le domaine, `OpenRouterAIService` dans l'infrastructure. Même pattern que les repositories Prisma — l'IA est traitée comme un adaptateur externe.

7. **Historique automatique** alimenté dans les CommandHandlers (pas de middleware Prisma) — traçabilité explicite et testable.

8. **18 ADRs documentés** : chaque décision architecturale majeure est justifiée, avec alternatives rejetées et conséquences. Idéal pour répondre aux questions du jury ("pourquoi pas NestJS ?", "pourquoi pas TypeORM ?").

### Écarts assumés à justifier

| Écart                                  | Formulation orale suggérée                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/services/` mal positionné         | _"C'est un héritage de la migration V1→V2. Son contenu ne viole pas la règle de dépendance — le domaine n'en dépend pas. C'est un refactoring de nommage que j'ai identifié et priorisé pour la prochaine itération."_                                                                                                                     |
| `Stock` accepte `string \| StockLabel` | _"C'est un compromis pragmatique : reconstituer les Value Objects à chaque lecture Prisma aurait un coût à l'exécution. Le domaine reste protégé à l'écriture (Stock.create() et addItem() utilisent les VOs), la lecture retourne des DTOs — les VOs ne sont jamais exposés côtés Query."_                                                |
| Pas de Domain Events                   | _"Le projet n'a pas encore de besoin d'audit trail asynchrone ou d'event sourcing. L'historique est géré de manière synchrone dans les CommandHandlers, ce qui est plus simple à tester et à déboguer. Les Domain Events seraient la prochaine évolution naturelle si le domaine requiert des réactions croisées entre bounded contexts."_ |
| Pas de CommandBus / QueryBus           | _"Le dispatch direct est suffisant pour 12 commands et une seule API. Un bus apporterait de la flexibilité (interceptors, logging transversal) mais aussi de la complexité opaque. Ce choix est documenté dans ADR-001."_                                                                                                                  |
| `prediction` sans entité `Prediction`  | _"La prédiction est un résultat calculé, pas un objet avec identité propre et cycle de vie. Un Value Object ou un Record TypeScript est suffisant. Si les prédictions devaient avoir leur propre historique ou états (ex : VALIDATED, STALE), elles deviendraient une entité."_                                                            |

### Corrections prioritaires (si temps disponible avant soutenance)

| Priorité | Action                                                                     | Impact                                                         | Effort                                            |
| -------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| 1        | Déplacer `src/services/` vers `infrastructure/user/` et `domain/user/`     | Cohérence architecturale visible                               | Faible (renommage + mise à jour imports)          |
| 2        | Ajouter tests unitaires pour `StockPredictionController`                   | Couverture des controllers IA                                  | Faible (pattern identique aux autres controllers) |
| 3        | Aligner le nom `UPDATE_ITEM_QUANTITY` dans `routePaths.ts` → `UPDATE_ITEM` | Cohérence nommage                                              | Très faible                                       |
| 4        | Ajouter tests unitaires pour `UserService`                                 | Couverture de la logique de création automatique d'utilisateur | Moyen (besoin de mocks Prisma)                    |
| 5        | Ajouter un TTL sur `getItemPrediction` (vérifier `generatedAt`)            | Éviter des prédictions obsolètes                               | Moyen (logique dans `StockPredictionService`)     |
