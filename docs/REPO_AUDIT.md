# Audit Organisation — dépôt `stockhub_back` (hors `src/`)

**Date :** 10 avril 2026
**Version auditée :** v2.1.1 — branche `main`
**Périmètre :** Tout le dépôt sauf `src/` (couvert dans `ARCHITECTURE_AUDIT.md`)

---

## 1. Cartographie complète (hors `src/`)

```
stockhub_back/
│
├── ── Fichiers de configuration racine ──
├── package.json                      # Dépendances, scripts npm, config lint-staged et prisma seed
├── tsconfig.json                     # TypeScript strict, path aliases, inclut src/ + tests/ + prisma/
├── jest.config.js                    # Config Jest tests unitaires (domain + api/controllers)
├── jest.integration.config.js        # Config Jest tests intégration (TestContainers)
├── jest.ci.config.js                 # Config Jest CI (couverture)
├── knip.json                         # Détection code mort (src/ + .husky/, ignore tests/)
├── eslint.config.mjs                 # ESLint 9 flat config (0 warnings)
├── .prettierrc / .prettierignore     # Formatage automatique
├── commitlint.config.js              # Conventional Commits (validé par Husky)
├── playwright.config.ts              # Config Playwright (E2E, workers=1, retries CI)
├── nodemon.json                      # Watch src/ pour hot reload dev
├── webpack.config.js                 # Build prod (bundle + Prisma engine copy)
├── .nvmrc                            # Version Node.js fixée (22.x)
├── .release-please-manifest.json     # Versioning semver automatique
├── release-please-config.json        # Config Release Please (CHANGELOG, tag)
│
├── ── Déploiement & Infrastructure ──
├── Dockerfile                        # Image Node 22, build + start prod
├── compose.yaml                      # MySQL 8 local (port 3308), volume persistant
├── render.yaml                       # Config Render.com (staging)
├── build-docker-image.ps1            # Script PowerShell build image Docker local
├── start_mysql.ps1                   # Script PowerShell démarrage MySQL local
├── stop_mysql.ps1                    # Script PowerShell arrêt MySQL local
│
├── ── Sécurité & Gouvernance ──
├── SECURITY.md                       # Politique de sécurité (signalement vulnérabilités)
├── LICENSE                           # Licence ISC
├── .env.example                      # Variables d'env documentées (à copier en .env)
├── .env.staging.example              # Variables d'env staging (Render + Aiven)
├── .env.docker                       # Variables d'env pour Docker local
├── .env.aiven                        # Variables d'env Aiven (staging DB)
├── .env.test                         # Variables d'env pour tests E2E
├── .dockerignore                     # Exclut node_modules, dist, .env du build Docker
│
├── ── Documentation racine ──
├── README.md                         # Présentation projet, démarrage rapide
├── CHANGELOG.md                      # Journal des changements (auto-généré Release Please)
├── ROADMAP.md                        # Feuille de route & features planifiées
├── CLAUDE.md                         # Instructions pour sessions IA (Claude Code)
│
├── ── Outils de test API ──
├── Stockhub_V2.postman_collection.json  # Collection Postman principale
├── .http                             # Fichier HTTP (JetBrains/VS Code REST Client)
│
├── ── Dossiers générés (non versionnés) ──
├── dist/                             # Build prod webpack (gitignored)
├── coverage/                         # Rapport couverture Jest (gitignored)
├── playwright-report/                # Rapport HTML Playwright (gitignored)
├── test-results/                     # Résultats bruts Playwright (gitignored)
│
├── prisma/
│   ├── schema.prisma                 # Schéma DB (9 modèles, 4 enums)
│   ├── seed.ts                       # Seed idempotent staging/dev (90j historique IA)
│   ├── migrations/                   # 6 migrations versionnées
│   │   ├── 20250227000000_init/
│   │   ├── 20260325133203_add_item_history_and_predictions/
│   │   ├── 20260327000000_add_ai_suggestions_cache/
│   │   ├── 20260402081108_add_item_suggestions/
│   │   ├── 20260402082739_rename_suggestions_to_contributions/
│   │   └── 20260405153836_add_item_updated_at/
│   └── seeds/                        # Scripts SQL utilitaires (non prod)
│       ├── add_missing_columns.sql
│       └── create_test_data.sql
│
├── tests/
│   ├── setupTests.ts                 # Setup global Jest (unit)
│   ├── setupIntegrationEnv.ts        # Setup global Jest (integration)
│   ├── __mocks__/connectionUtils.ts  # Mock legacy (vestige V1)
│   ├── helpers/
│   │   └── testContainerSetup.ts    # Helper TestContainers (MySQL 8, prisma db push)
│   ├── domain/                       # Tests unitaires domaine (miroir de src/domain/)
│   ├── api/                          # Tests unitaires controllers + routes
│   ├── unit/                         # Tests unitaires autres (mappers)
│   ├── integration/                  # Tests intégration (TestContainers)
│   └── e2e/                          # Tests E2E Playwright (HTTP réels)
│       └── helpers/azureAuth.ts     # Helper acquisition token Azure ROPC
│
├── docs/
│   ├── 0-INDEX.md                    # Index principal de la documentation
│   ├── 7-SESSIONS.md                 # Index des sessions de développement
│   ├── openapi.yaml                  # Spec OpenAPI 3.0 (source de vérité API)
│   ├── database-schema.md            # ERD + décisions modélisation
│   ├── rgpd.md                       # Politique RGPD
│   ├── authorization-phase1-summary.md # Résumé implémentation autorisation
│   ├── ARCHITECTURE_AUDIT.md         # ← Audit architecture DDD/CQRS (ce projet)
│   ├── adr/                          # 18 ADRs + INDEX + TEMPLATE
│   ├── technical/                    # Guides techniques (DI, logging, tests, Azure…)
│   ├── sessions/                     # Journaux de sessions de dev (6 sessions)
│   ├── archive/                      # Ancienne doc (issues, PRs résolues)
│   ├── troubleshooting/              # 4 guides de résolution de problèmes
│   ├── ci-cd/                        # Doc workflow sécurité CI
│   └── security/                     # Rapport vulnérabilités
│
├── .github/
│   ├── CODEOWNERS                    # Propriétaires du code (review automatique)
│   ├── PULL_REQUEST_TEMPLATE.md      # Template PR (couches DDD, test plan, closes #)
│   ├── ISSUE_TEMPLATE/               # 3 templates d'issues + config
│   │   ├── bug_report.yml
│   │   ├── user_story.yml
│   │   ├── tache_technique.yml
│   │   └── config.yml
│   └── workflows/
│       ├── main_stockhub-back.yml    # CI/CD principal (lint + tests + deploy Azure)
│       ├── release-please.yml        # Versioning semver automatique
│       └── security-audit.yml        # Audit sécurité npm planifié
│
├── .husky/
│   ├── commit-msg                    # commitlint (Conventional Commits)
│   ├── pre-commit                    # lint-staged + tsc --noEmit
│   └── pre-push                     # format:check + lint + knip + test:unit
│
├── scripts/
│   └── synthetic-data.json           # Données synthétiques (usage à clarifier)
│
├── sql/
│   └── initialize_database.sql       # Script SQL initialisation DB (legacy ?)
│
├── postman/
│   ├── Stockhub_Local.postman_environment.json
│   ├── Stockhub_Staging.postman_environment.json
│   └── Stockhub_Prod.postman_environment.json
│
└── audit-results/
    └── ia-back-feasibility-audit.md  # Audit faisabilité module IA (mars 2026)
```

---

## 2. Analyse par zone

### 2.1 `prisma/` — ✅ conforme

#### Schéma (`schema.prisma`)

9 modèles, 4 enums, entièrement cohérents avec l'architecture domaine :

| Modèle Prisma       | Entité domaine correspondante                | Statut    |
| ------------------- | -------------------------------------------- | --------- |
| `Stock`             | `Stock` (aggregate)                          | ✅ aligné |
| `Item`              | `StockItem`                                  | ✅ aligné |
| `ItemHistory`       | Interface `IItemHistoryRepository`           | ✅ aligné |
| `StockPrediction`   | Interface `IPredictionRepository`            | ✅ aligné |
| `User`              | `readUserRepository` / `writeUserRepository` | ✅ aligné |
| `Family`            | `Family` (aggregate domaine)                 | ✅ aligné |
| `FamilyMember`      | `FamilyMemberData`                           | ✅ aligné |
| `StockCollaborator` | `ICollaboratorRepository`                    | ✅ aligné |
| `ItemContribution`  | `ItemContribution` (entité domaine)          | ✅ aligné |

Enums Prisma (`StockCategory`, `FamilyRole`, `ContributionStatus`, `StockRole`) reflètent exactement les enums du domaine. Les index sont cohérents avec les patterns de requête (stockId, userId, itemId+changedAt).

**Observation :** Le champ `Item.label` est `String?` (nullable) alors que le domaine interdit un label vide (`Stock.addItem` lève une erreur si label vide). Incohérence de contrainte entre DB et domaine — pas bloquant car la validation domaine intervient avant la persistance, mais un `@db.VarChar(255)` avec `NOT NULL` serait plus strict.

#### Migrations

6 migrations nommées lisiblement et ordonnées chronologiquement. Le nommage est explicite (`add_item_history_and_predictions`, `rename_suggestions_to_contributions`).

**Observation :** Le gap temporel entre `20250227000000_init` (fév. 2025) et `20260325133203_add_item_history_and_predictions` (mars 2026) est notable — soit il y avait des migrations intermédiaires supprimées (migration squash), soit la DB initiale était gérée différemment pendant cette période.

#### Seed (`prisma/seed.ts`)

- Idempotent (upsert systématique, `findFirst` avant création)
- Protégé en production (`NODE_ENV === 'production'` → throw)
- Génère 90 jours d'historique avec profils gaussiens réalistes par item
- Données de démo parlantes (sous-stock intentionnel sur 1 item par stock)
- Configurable via `SEED_OWNER_EMAIL` (email réel Azure B2C en staging)
- Déclaré dans `package.json` (`"prisma": { "seed": "ts-node ..." }`)

**Observation :** Le seed utilise `console.log` (3 occurrences) — à remplacer par le logger structuré pour cohérence avec le reste du projet (règle "0 console.\*").

#### `prisma/seeds/` (SQL utilitaires)

`add_missing_columns.sql` et `create_test_data.sql` semblent être des scripts de maintenance manuelle ou de migration ad hoc. Leur présence ici sans documentation ni contexte est un **signal d'alerte** : si ces scripts ont déjà été appliqués en production, ils devraient être remplacés par des migrations Prisma formelles. Si ce sont des helpers locaux, ils devraient être documentés ou déplacés dans `sql/`.

---

### 2.2 `tests/` — ✅ conforme (avec un vestige)

#### Structure globale

La structure `tests/` est un **miroir de `src/`** pour les tests unitaires, ce qui est une bonne pratique :

```
tests/domain/              ← miroir de src/domain/
tests/api/controllers/     ← miroir de src/api/controllers/
tests/integration/         ← organisé par couche (authorization, stock-management)
tests/e2e/                 ← organisé par feature (authorization, stock-management)
```

#### Helpers de tests

| Fichier                                                        | Rôle                                             | Verdict                |
| -------------------------------------------------------------- | ------------------------------------------------ | ---------------------- |
| `tests/setupTests.ts`                                          | Setup global unitaire (jest.clearAllMocks, etc.) | ✅ standard            |
| `tests/setupIntegrationEnv.ts`                                 | Setup global intégration (env vars test)         | ✅                     |
| `tests/helpers/testContainerSetup.ts`                          | Setup/teardown MySQL TestContainers              | ✅ bien isolé          |
| `tests/e2e/helpers/azureAuth.ts`                               | Acquisition token Azure ROPC pour E2E            | ✅ correctement isolé  |
| `tests/domain/authorization/common/entities/Family.helpers.ts` | Helpers création `Family` pour tests             | ✅ pattern test helper |

#### Vrai vestige à supprimer

`tests/__mocks__/connectionUtils.ts` : mock d'un module `connectionUtils` qui n'existe plus dans le code source (supprimé lors de la migration V1→V2, issue #192). Ce fichier est mort — `knip` devrait le détecter, mais il est ignoré (`"ignore": ["tests/**/*"]` dans `knip.json`).

#### Séparation unit / integration / e2e

- **Unitaires** (`jest.config.js`) : `tests/domain/**/*.test.ts` + `tests/api/controllers/**/*.test.ts` — pas de DB, pas de réseau
- **Intégration** (`jest.integration.config.js`) : `tests/integration/**/*.integration.test.ts` — TestContainers MySQL réel
- **E2E** (`playwright.config.ts`) : `tests/e2e/` — HTTP réel sur serveur démarré

Timeout intégration à 60s (justifié par le démarrage du container Docker).

**Observation :** `tests/unit/api/dto/mappers/StockMapper.test.ts` est dans `tests/unit/` alors que tous les autres tests API sont dans `tests/api/`. À déplacer dans `tests/api/dto/mappers/` pour cohérence. Ce test est couvert par `jest.config.js` car son path ne correspond pas à `testMatch` actuel (`**/tests/domain/**` ou `**/tests/api/controllers/**`) — il n'est donc **pas exécuté** par `npm run test:unit`.

---

### 2.3 `docs/` — ✅ bien organisé (avec lacunes de mise à jour)

#### Structure

```
docs/
├── 0-INDEX.md          # Point d'entrée — index numéroté (0 à 7)
├── adr/                # ADRs — 18 décisions + INDEX + TEMPLATE ✅
├── technical/          # Guides techniques approfondis ✅
├── sessions/           # Journaux de sessions (6 sessions, dernière : mars 2026) ✅
├── archive/            # Ancienne doc archivée ✅
├── troubleshooting/    # 4 guides de résolution ✅
├── ci-cd/              # Doc sécurité CI ✅
└── security/           # Rapport vulnérabilités ✅
```

#### Points forts

- `0-INDEX.md` est un excellent point d'entrée — index numéroté lisible, quick links, tableaux de navigation.
- 18 ADRs avec `INDEX.md` et `TEMPLATE.md` — pratique exemplaire pour un RNCP.
- Les sessions de dev sont documentées chronologiquement (`YYYY-MM-DD-sujet.md`).
- L'`openapi.yaml` est la source de vérité API, exposée via Swagger (`/api-docs`).

#### Lacunes identifiées

| Problème                                                                                                                                              | Impact                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `0-INDEX.md` référence `1-ARCHITECTURE.md` à `6-API-DOCUMENTATION.md` mais ces fichiers **n'existent pas** dans `docs/`                               | Liens brisés dans l'index principal |
| `0-INDEX.md` référence `technical/dependency-injection.md`, `technical/testcontainers.md`, `technical/prisma-mapping.md` qui **n'existent pas**       | Idem                                |
| La dernière session documentée est **mars 2026** — les sessions de février à avril 2026 (migrations IA, contributions, seed) ne sont pas journalisées | Trou dans l'historique              |
| `docs/authorization-phase1-summary.md` existe à la racine de `docs/` — aurait sa place dans `sessions/` ou `archive/`                                 | Cohérence d'organisation            |
| `docs/7-SESSIONS.md` et `docs/0-INDEX.md` sont présents mais les fichiers `1-` à `6-` manquent                                                        | Index incohérent                    |
| `ARCHITECTURE_AUDIT.md` (créé aujourd'hui) n'est pas encore référencé dans `0-INDEX.md`                                                               | Document orphelin                   |

---

### 2.4 `.github/` — ✅ conforme et complet

#### Workflows CI/CD

| Workflow                 | Déclencheur               | Rôle                                                                   |
| ------------------------ | ------------------------- | ---------------------------------------------------------------------- |
| `main_stockhub-back.yml` | Push toutes branches + PR | CI : tsc + lint + test:unit → E2E (PR→main) → Deploy Azure (push main) |
| `release-please.yml`     | Push main                 | Release semver automatique (CHANGELOG + tag + PR release)              |
| `security-audit.yml`     | Planifié (cron)           | `npm audit` périodique                                                 |

Le pipeline principal est bien structuré en 4 jobs avec dépendances claires :

- `continuous-integration` → `e2e-tests` (PR→main uniquement)
- `continuous-integration` → `build-and-deploy` (push main uniquement)
- `deploy-to-staging` (workflow_dispatch uniquement — déploiement manuel)

**Observation :** Le job `npm audit` dans `main_stockhub-back.yml` est **commenté** (lignes 28-31). L'audit de sécurité n'est donc exécuté que via le workflow séparé `security-audit.yml` (cron). Acceptable mais mérite d'être documenté.

#### Templates

- **PR template** : structure claire (couches DDD impactées, test plan, `Closes #numero`). Conforme à la convention CLAUDE.md.
- **Issue templates** : 3 types (bug, user story, tâche technique) avec formulaires YAML structurés — évite les issues sans contexte.
- **CODEOWNERS** : propriétaire défini → review automatique sur les PR.

---

### 2.5 `.husky/` — ✅ conforme et bien calé

| Hook         | Commandes                                      | Moment                                 |
| ------------ | ---------------------------------------------- | -------------------------------------- |
| `commit-msg` | `commitlint --edit`                            | Validation format Conventional Commits |
| `pre-commit` | `git add -u` + `lint-staged` + `tsc --noEmit`  | Auto-format + lint + vérif TypeScript  |
| `pre-push`   | `format:check` + `lint` + `knip` + `test:unit` | Vérification qualité avant push        |

La progression est logique : vérifications rapides au commit (format + types), vérifications complètes au push (tests + code mort).

**Observation :** `pre-push` exécute `npm run format:check` **et** `npm run lint` alors que `pre-commit` exécute déjà `lint-staged` (qui inclut `prettier --write` + `eslint --fix`). La vérification `format:check` au push est une double sécurité défendable (catch les fichiers non stagés), mais le `lint` au push est redondant avec le `lint-staged` du commit. Non bloquant.

---

### 2.6 Fichiers de configuration racine — ✅ bien configurés

#### `tsconfig.json`

TypeScript strict activé (`strict`, `strictNullChecks`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`). Path aliases cohérents avec la structure `src/`.

**Observation :** L'alias `@core/*` pointe vers `src/*` (racine de src). Il est utilisé dans `initializeApp.ts` pour importer `authConfig.ts`. C'est un alias "fourre-tout" qui contourne la logique des autres alias plus précis — à terme, `authConfig.ts` devrait être sous `@config/` plutôt que `@core/`.

#### `jest.config.js` (unitaires)

`testMatch` couvre `**/tests/domain/**/*.test.ts` et `**/tests/api/controllers/**/*.test.ts`. Les tests `tests/unit/api/dto/mappers/StockMapper.test.ts` et `tests/api/routes/StockRoutesV2.test.ts` **ne correspondent pas** à ce pattern et sont exclus de `test:unit`.

- `StockRoutesV2.test.ts` est explicitement dans `testPathIgnorePatterns` → intentionnel.
- `StockMapper.test.ts` semble omis par inadvertance.

#### `jest.integration.config.js`

Contient des aliases obsolètes : `@repositories/*`, `@controllers/*`, `@routes/*` (anciens chemins V1 qui n'existent plus dans `src/`). Ces aliases sont morts mais inoffensifs.

#### `knip.json`

`tests/**/*` est ignoré, ce qui signifie que le code mort dans `tests/` (ex: `__mocks__/connectionUtils.ts`) n'est pas détecté. Acceptable pour éviter les faux positifs sur les helpers de test, mais le mock orphelin passe sous le radar.

#### `.env.example`

Complet et bien commenté. Inclut toutes les variables nécessaires : DB, Azure B2C, CORS, Application Insights, port, seed, OpenRouter IA. Chaque section est annotée avec le contexte d'usage. Référence pour onboarding.

---

### 2.7 Déploiement & Infrastructure — ✅ cohérent

| Fichier                              | Rôle                                                                               | Verdict         |
| ------------------------------------ | ---------------------------------------------------------------------------------- | --------------- |
| `Dockerfile`                         | Image Node 22, `npm ci --only=production` + `npm run build` + `node dist/index.js` | ✅              |
| `compose.yaml`                       | MySQL 8 local sur port 3308, volume persistant                                     | ✅              |
| `render.yaml`                        | Config Render.com staging (branche `staging`, env vars référencées)                | ✅              |
| `.env.example`                       | Variables documentées, gitignored                                                  | ✅              |
| `.env.staging.example`               | Variables staging (Aiven), gitignored                                              | ✅              |
| `start_mysql.ps1` / `stop_mysql.ps1` | Scripts Windows dev local                                                          | ✅ utile en dev |
| `build-docker-image.ps1`             | Build image Docker local                                                           | ✅              |

**Observation :** Les scripts `.ps1` sont Windows-only. Si la CI tourne sur Ubuntu (c'est le cas — `runs-on: ubuntu-latest`), ces scripts ne sont pas utilisables en CI. Ils sont destinés au dev local Windows — acceptable, mais mérite une note dans le README.

---

### 2.8 Outils de test API — ⚠️ à rationaliser

| Outil                  | Fichiers                                       | Verdict         |
| ---------------------- | ---------------------------------------------- | --------------- |
| Postman collection     | `Stockhub_V2.postman_collection.json` (racine) | ✅ utilisable   |
| Postman environnements | `postman/` (3 fichiers : local, staging, prod) | ✅ bien séparés |
| HTTP Client            | `.http` (fichier unique à la racine)           | ✅              |

**Problème :** La collection Postman principale est à la **racine** du repo, les environnements sont dans `postman/`. Incohérence : tout devrait être dans `postman/` ou à la racine. La collection racine `Stockhub_V2.postman_collection.json` est dupliquée ou distincte de ce qui est dans `postman/` — à vérifier et consolider.

---

### 2.9 Dossiers divers — ⚠️ à clarifier

| Dossier/Fichier               | Contenu                               | Verdict                                              |
| ----------------------------- | ------------------------------------- | ---------------------------------------------------- |
| `sql/initialize_database.sql` | Script SQL initialisation DB          | ⚠️ Rôle flou — supplanté par les migrations Prisma ? |
| `scripts/synthetic-data.json` | Données synthétiques JSON             | ⚠️ Rôle non documenté — lié au seed ? aux tests ?    |
| `audit-results/`              | Audit faisabilité IA (mars 2026)      | ✅ mais orphelin — mériterait d'être dans `docs/`    |
| `.claude/`                    | Prompts d'audit, notes de sessions IA | ✅ usage interne, non versionné dans docs/           |

---

## 3. Bilan et recommandations pour la soutenance

### Points forts à mettre en avant au jury

1. **Pipeline CI/CD complet et lisible** : 4 jobs distincts (CI → E2E → Deploy Azure / Deploy Staging), chacun avec une condition explicite. La séparation CI/CD est visible dans un seul fichier bien commenté.

2. **Triple filet qualité** : Husky (local) → CI GitHub Actions (PR) → Release Please (main). Chaque niveau a un rôle distinct.

3. **Tests à 3 niveaux avec des outils adaptés à chaque niveau** : Jest + mocks pour l'unitaire, TestContainers (MySQL réel) pour l'intégration, Playwright pour l'E2E. Ce choix est justifiable : chaque outil est le meilleur de sa catégorie pour son niveau.

4. **Schéma Prisma comme source de vérité DB** : 6 migrations nommées et ordonnées, `migration_lock.toml`, pas de SQL manuel en production (en théorie).

5. **Gestion des secrets exemplaire** : `.env.example` documenté, `.env` gitignored, secrets Azure en GitHub Secrets, pas de credentials dans le code.

6. **Templates GitHub structurés** : 3 templates d'issues (bug / user story / tech), 1 template PR avec checklist DDD — gage de qualité de gouvernance.

7. **Seed de démo réaliste** : données gaussiennes sur 90 jours, sous-stocks intentionnels, collaborateur configuré — la démo jury arrive sur une app vivante et cohérente.

### Écarts assumés à justifier

| Écart                                                                 | Formulation orale suggérée                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql/` et `prisma/seeds/*.sql` coexistent avec les migrations Prisma  | _"Les fichiers SQL dans `sql/` et `prisma/seeds/` sont des helpers de maintenance ad hoc, pas des migrations. Toutes les évolutions de schéma en production passent par `prisma migrate deploy`. Ces scripts SQL sont des outils locaux, pas du code de production."_ |
| `tests/__mocks__/connectionUtils.ts` orphelin                         | _"C'est un vestige de la migration V1→V2 que knip ne détecte pas car `tests/` est exclu de son périmètre. Je l'ai identifié dans cet audit — c'est une ligne de correction immédiate."_                                                                               |
| Scripts `.ps1` Windows-only                                           | _"L'environnement de développement est Windows, la CI est Linux. Les scripts PowerShell sont uniquement des helpers dev local. La CI utilise directement les commandes npm, pas ces scripts."_                                                                        |
| `1-ARCHITECTURE.md` à `6-API-DOCUMENTATION.md` manquants dans `docs/` | _"Ces fichiers sont référencés dans l'index mais ont été archivés ou leur contenu a été distribué dans les sous-dossiers `technical/` et `adr/`. L'index `0-INDEX.md` doit être mis à jour pour pointer vers les emplacements actuels."_                              |

### Corrections prioritaires (si temps disponible avant soutenance)

| Priorité | Action                                                                                                                                                                    | Impact                                 | Effort      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------- |
| 1        | Supprimer `tests/__mocks__/connectionUtils.ts` (mock orphelin)                                                                                                            | Propreté du repo                       | Très faible |
| 2        | Déplacer `tests/unit/api/dto/mappers/StockMapper.test.ts` → `tests/api/dto/mappers/` et ajuster `testMatch` dans `jest.config.js`                                         | Ce test n'est pas exécuté actuellement | Faible      |
| 3        | Mettre à jour `docs/0-INDEX.md` : supprimer les liens vers `1-ARCHITECTURE.md` → `6-API-DOCUMENTATION.md` inexistants, ajouter `ARCHITECTURE_AUDIT.md` et `REPO_AUDIT.md` | Cohérence documentation                | Faible      |
| 4        | Consolider la collection Postman : déplacer `Stockhub_V2.postman_collection.json` dans `postman/`                                                                         | Cohérence organisation                 | Très faible |
| 5        | Supprimer les aliases morts dans `jest.integration.config.js` (`@repositories`, `@controllers`, `@routes`)                                                                | Propreté config                        | Très faible |
| 6        | Remplacer les `console.log` dans `prisma/seed.ts` par le logger ou `process.stdout.write`                                                                                 | Cohérence règle "0 console.\*"         | Très faible |
| 7        | Documenter le rôle de `scripts/synthetic-data.json` et `sql/initialize_database.sql` ou les supprimer                                                                     | Clarté repo                            | Faible      |
| 8        | Journaliser les sessions manquantes (fév → avr 2026) dans `docs/sessions/`                                                                                                | Cohérence historique                   | Moyen       |
