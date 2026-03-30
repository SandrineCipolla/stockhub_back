# StockHub V2 - Backend

API Node.js/Express avec architecture DDD/CQRS pour la gestion de stocks intelligente avec prédictions ML.

## Repositories du projet

### Backend (ce repo)

- **Chemin local**: `C:\Users\sandr\Dev\Perso\Projets\stockhub\stockhub_back`
- **URL GitHub**: https://github.com/SandrineCipolla/stockhub_back
- **Prod (Azure App Service)**: https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net/
- **Staging (Render.com)**: déployé automatiquement depuis la branche `staging`, DB Aiven MySQL
- **Description**: API REST StockHub avec architecture DDD/CQRS et authentification Azure AD B2C
- **Tech**: Node.js, Express 4.20.0, TypeScript 5.8.3, Prisma 6.16.0, MySQL, Azure AD B2C
- **Version**: v2.1.1

### Frontend

- **Chemin local**: `C:\Users\sandr\Dev\RNCP7\StockHubV2\Front_End\stockHub_V2_front`
- **URL GitHub**: https://github.com/SandrineCipolla/stockHub_V2_front
- **Démo live**: https://stock-hub-v2-front.vercel.app/
- **Tech**: React 19.1.0, TypeScript 5.8.3, Vite 6.3.5, TailwindCSS 3.4.1

### Design System

- **Chemin local**: `C:\Users\sandr\Dev\RNCP7\stockhub_design_system`
- **URL GitHub**: https://github.com/SandrineCipolla/stockhub_design_system
- **Package**: `@stockhub/design-system` v1.3.1

### Wiki Global du Projet

- **URL**: https://github.com/SandrineCipolla/stockHub_V2_front/wiki
- **Hébergé sur** : repo frontend (couvre les 3 repos)
- **Pages clés** : Architecture Globale, Backend Guide, CICD et Déploiement, ADR, Qualité & Métriques
- **À mettre à jour** quand : nouveaux environnements, changements d'infra, pipeline CI/CD modifié

### GitHub Project

- **URL**: https://github.com/users/SandrineCipolla/projects/3
- **Utilisation**: Suivre et mettre à jour les tâches après chaque modification importante

## Scripts disponibles

```bash
# Développement
npm run start:dev        # Serveur dev avec hot reload
npm run start:prod       # Serveur de production

# Tests
npm run test:unit        # Tests unitaires (142 tests)
npm run test:integration # Tests d'intégration (TestContainers)
npm run test:e2e         # Tests E2E (Playwright)
npm run test:coverage    # Rapport de couverture

# Build & Database
npm run build            # Build TypeScript + Webpack
npm run migrate:test     # Migrations Prisma pour base de test

# Qualité
npm run lint             # ESLint 0 warnings
npm run format           # Prettier
npm run knip             # Détection code mort
```

## Architecture DDD/CQRS

```
src/
  domain/               # Logique métier (entités, value objects, use cases)
    stock-management/
      manipulation/     # Command side (CQRS) — use cases écriture
      visualization/    # Query side (CQRS) — services lecture
    authorization/      # Entités famille, rôles
  infrastructure/       # Implémentations Prisma (repositories)
  api/                  # Controllers, routes, DTOs
  authentication/       # Azure AD B2C (Passport Bearer)
  authorization/        # Middleware autorisation stocks
  config/
  Utils/                # logger.ts, cloudLogger.ts
tests/
  domain/               # Tests unitaires domain layer
  integration/          # Tests avec TestContainers MySQL
  e2e/                  # Tests Playwright
```

**Règle absolue** : domain → infrastructure → api (jamais l'inverse)

## Standards critiques

- **TypeScript strict** — 0 erreur, éviter `as` (préférer type narrowing)
- **ESLint** — 0 warning (`--max-warnings 0`)
- **Logging** — jamais de `console.*`, utiliser `rootController`, `rootDatabase`, `rootSecurity`
- **Tests** — écrire tests pour chaque nouvelle feature
- **DI Pattern** — `prismaClient ?? new PrismaClient()` pour la testabilité

📖 **Guides détaillés** :

- Best practices code review → `docs/technical/CODE-REVIEW-BEST-PRACTICES.md`
- Système de logging → `docs/technical/LOGGER-GUIDE.md`
- Dependency Injection → `docs/technical/DEPENDENCY-INJECTION-BEST-PRACTICES.md`
- Tests E2E → `docs/technical/e2e-testing.md`
- Azure AD B2C → `docs/technical/azure-b2c-setup.md`

## Authentification & Autorisation

- **Auth** : Azure AD B2C, Passport Bearer Token, `authenticateMiddleware.ts`
- **Authz** : Rôles OWNER, EDITOR, VIEWER, VIEWER_CONTRIBUTOR — Permissions read/write/suggest
- **ADR** : `docs/adr/ADR-009-resource-based-authorization.md`

## Path Aliases TypeScript

```json
"@domain/*" | "@infrastructure/*" | "@api/*" | "@services/*"
"@authentication/*" | "@authorization/*" | "@utils/*" | "@config/*"
```

## ADR — Architecture Decision Records

`docs/adr/` — 10 ADRs (DDD/CQRS, Prisma, Azure B2C, API V2, Authorization...)

Créer un ADR pour toute décision architecturale importante.

## Conventions Git

### Branches — format strict

```
type/issue-number-short-description
```

| Type        | Usage                                       |
| ----------- | ------------------------------------------- |
| `feat/`     | Nouvelle fonctionnalité                     |
| `fix/`      | Correction de bug                           |
| `chore/`    | Tâche technique sans valeur métier          |
| `docs/`     | Documentation uniquement                    |
| `test/`     | Tests uniquement                            |
| `refactor/` | Refactoring sans changement de comportement |

**Exemples corrects** : `feat/118-update-item-command`, `fix/86-stockitem-lowercase`, `docs/101-openapi-endpoints`
**Jamais** : `feature/...`, `feat-issue-62-...`, `feat/issue-44-...` — le format `type/number-description` est la seule convention.

### Commits — Conventional Commits

```
type(scope): message concis — closes #numero
```

- Vérifiés automatiquement par **commitlint** au pre-commit
- Message en minuscules, verbe à l'infinitif, sans majuscule en fin
- Inclure `closes #numero` si le commit clôt une issue
- Pas de mention d'outils ou d'IA dans le message

**Exemples** : `feat(items): add UpdateItem command and handler — closes #118`, `fix(items): return 404 when itemId not found`

### PRs

- Utiliser `.github/PULL_REQUEST_TEMPLATE.md`
- Indiquer les couches DDD impactées, le test plan, et `Closes #numero`

### Releases

Automatiques via **Release Please** (semver) sur push `main`.

## Workflow par ticket

Suivre cet ordre pour chaque issue, sans exception :

### 1. Avant de commencer

```bash
git checkout main
git pull origin main
git checkout -b type/numero-description   # ex: feat/118-update-item-command
```

### 2. Développement

- Travailler sur la branche dédiée
- Commits fréquents, ciblés, au format Conventional Commits
- Respecter la checklist avant commit (ci-dessous)

### 3. Ouvrir la PR

- Titre : `type(scope): description — closes #numero`
- Body : couches impactées, test plan, `Closes #numero`
- Vérifier que le CI passe avant de merger

### 4. Après le merge

Mettre à jour dans cet ordre :

| Action                                              | Quand                           |
| --------------------------------------------------- | ------------------------------- |
| **Wiki** — `Backend-Guide` : endpoints, nb de tests | Nouvel endpoint ou modification |
| **Wiki** — `Architecture-Globale` ou `ADR`          | Décision architecturale         |
| **Wiki** — `CICD-et-Deploiement`                    | Changement d'infra ou pipeline  |
| **`docs/openapi.yaml`**                             | Modification d'un endpoint      |
| **GitHub Project** — issue → Done                   | Systématiquement après merge    |

**Comment mettre à jour le wiki** :

```bash
git clone https://github.com/SandrineCipolla/stockHub_V2_front.wiki.git /tmp/wiki
# modifier les fichiers .md
cd /tmp/wiki && git add . && git commit -m "docs: ..." && git push
```

**Releases** : Automatiques via Release Please (semver) sur push `main`.

## Intégration Frontend

**Base URL** : `https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net/api/v2`  
**Auth** : `Authorization: Bearer <access_token>`  
**OpenAPI** : `docs/openapi.yaml`

Endpoints : `GET/POST /stocks`, `GET /stocks/:id/items`, `POST/PATCH /stocks/:id/items/:itemId`

## Gestion des Issues GitHub

### Labels obligatoires

Toute issue doit avoir **au minimum** ces deux labels :

| Label | Valeur                                                         |
| ----- | -------------------------------------------------------------- |
| Scope | `back` (toujours sur ce repo)                                  |
| Type  | `bug`, `enhancement`, `documentation`, `tech`, `clean code`... |

Sans ces labels, les issues n'apparaissent pas correctement dans le GitHub Project board.

```bash
gh issue create --label "back,bug" ...
gh issue edit <numero> --repo SandrineCipolla/stockhub_back --add-label "back,bug"
```

### ⚠️ AVANT de créer une issue GitHub

**Format User Story** :

```
**En tant que** [persona]
**Je souhaite** [action souhaitée]
**Afin de** [bénéfice attendu]

---

**Critères d'acceptation**

Étant donné que [contexte]
Lorsque [action]
Alors :
- [ ] Critère 1
- [ ] Critère 2
```

**INTERDIT dans le body d'une issue** : détails d'implémentation, couches DDD, commandes, TODO techniques → tout ça va
dans la **PR**.

**Où mettre les notes techniques ?**

| Information                                | Où                      |
| ------------------------------------------ | ----------------------- |
| Valeur utilisateur, critères d'acceptation | Issue GitHub            |
| Idées en cours de dev                      | Commentaire sur l'issue |
| Couches DDD impactées, choix techniques    | Description de la PR    |
| Décisions d'architecture importantes       | `docs/adr/`             |

## 🚨 Checklist avant commit

1. ✅ `npm run format` — formatage (automatique lint-staged)
2. ✅ `npm run lint` — 0 erreur ESLint (automatique lint-staged)
3. ✅ `tsc --noEmit` — 0 erreur TypeScript (automatique pre-commit)
4. ✅ Tests écrits pour les nouvelles features
5. ✅ Pas de `console.*` — logging structuré utilisé
6. ✅ Pas de secrets dans le code

## 🚨 Checklist avant push

1. ✅ `npm run test:unit` — tous les tests passent (automatique pre-push)
2. ✅ `npm run knip` — pas de code mort (automatique pre-push)
3. ✅ ADR créé si décision architecturale importante
4. ✅ GitHub Project mis à jour

---

**🎯 Rappel CRITIQUE** :

- **Issues** = valeur utilisateur uniquement (US + critères d'acceptation)
- **PRs** = détails techniques, couches DDD impactées, ADR lié
- Respecter l'architecture DDD/CQRS (domain → infrastructure → api)
- Utiliser Prisma pour tous les accès base de données
- ⚠️ Éviter `as` — préférer type narrowing ou type guards
- Les hooks pre-commit et pre-push automatisent les vérifications
