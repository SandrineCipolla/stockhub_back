# Prompt Claude Code — Corrections StockHub V2 Back-end

> **Mode d'emploi** : Dépose ce fichier à la racine du repo `stockhub_back`.
> Dans Claude Code, dis : **"Lis le fichier CORRECTIONS_CLAUDE_CODE_BACK_v2.md et commence par l'Étape 0"**
> Traite une étape à la fois et attends ma validation avant de passer à la suivante.

---

## CONTEXTE

Je suis en certification RNCP Niveau 7. Ces corrections sont issues de 7 audits automatisés.
Le workflow suit les pratiques professionnelles du projet : issues GitHub → branche dédiée → PR.

**Stack** : Node.js 22 + TypeScript + Express + Prisma + Azure B2C
**Repo** : https://github.com/SandrineCipolla/stockhub_back

---

## ÉTAPE 0 — Créer les issues GitHub (avant tout code)

> **Ne touche pas au code pour l'instant.**
> Utilise la CLI GitHub (`gh`) pour créer les issues.
> Vérifie d'abord que tu es bien authentifié : `gh auth status`

### 0.1 — Lire les templates existants

Avant de créer quoi que ce soit, lis les templates du repo pour t'y conformer :

```bash
# Templates d'issues
ls .github/ISSUE_TEMPLATE/
cat .github/ISSUE_TEMPLATE/*.yml 2>/dev/null || cat .github/ISSUE_TEMPLATE/*.md 2>/dev/null

# Template de PR
cat .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null || cat .github/pull_request_template.md 2>/dev/null

# Labels existants
gh label list
```

**Adapte les commandes ci-dessous** en fonction de ce que tu trouves :

- Si des templates d'issues existent avec des types définis (bug, feature, docs...), utilise `--template` pour sélectionner le bon
- Utilise uniquement les labels qui existent déjà dans le repo (`gh label list`)
- Respecte la structure exacte des templates pour le `--body`

### 0.2 — Créer les issues

Lance les commandes suivantes en les adaptant aux templates trouvés :

```bash
# Issue 1 — Sécurité critique
gh issue create \
  --title "fix(security): add authorizeStockWrite on PATCH and DELETE /stocks/:stockId (OWASP A01)" \
  --body "## Problème
Les routes \`PATCH /api/v2/stocks/:stockId\` et \`DELETE /api/v2/stocks/:stockId\` n'ont pas le middleware \`authorizeStockWrite\`.
Tout utilisateur authentifié peut modifier ou supprimer le stock d'un autre utilisateur.

## Critère RNCP
Ce2.4 #4 #6 — OWASP A01 Broken Access Control

## Fichier concerné
\`src/api/routes/StockRoutesV2.ts\` lignes ~112-129

## Acceptance criteria
- [ ] \`authorizeStockWrite\` ajouté sur \`PATCH /stocks/:stockId\`
- [ ] \`authorizeStockWrite\` ajouté sur \`DELETE /stocks/:stockId\`
- [ ] \`npm run test:unit\` passe sans régression" \
  --label "bug,security,rncp"

# Issue 2 — Coverage
gh issue create \
  --title "docs(tests): add coverageThreshold and publish backend coverage rate (Ce3.2 #15)" \
  --body "## Problème
Aucun \`coverageThreshold\` configuré dans les configs Jest. Le taux de coverage backend n'est pas affiché dans le README.

## Critère RNCP
Ce3.2 #15 — Coverage mesuré, documenté, avec seuil cible

## Fichiers concernés
- \`jest.ci.config.js\` — ajouter \`coverageThreshold\`
- \`README.md\` — ajouter section coverage backend

## Acceptance criteria
- [ ] \`coverageThreshold\` configuré dans \`jest.ci.config.js\`
- [ ] Taux de coverage mesuré et affiché dans le README
- [ ] \`npm run test:coverage\` passe avec le seuil configuré" \
  --label "documentation,tests,rncp"

# Issue 3 — .env.example
gh issue create \
  --title "docs(env): add .env.example for local development onboarding (Ce3.5 #21)" \
  --body "## Problème
\`.env.staging.example\` existe mais pas \`.env.example\` racine pour le développement local.
Un développeur qui clone le repo ne sait pas quelles variables configurer.

## Critère RNCP
Ce3.5 #21 — Stabilité onboarding développeur

## Fichier à créer
\`.env.example\` à la racine

## Acceptance criteria
- [ ] \`.env.example\` créé avec toutes les variables (sans valeurs sensibles)
- [ ] Fichier présent dans le git (absent du .gitignore)
- [ ] README référence le fichier" \
  --label "documentation,rncp"

# Issue 4 — OpenAPI
gh issue create \
  --title "docs(api): add missing PATCH/DELETE endpoints to OpenAPI spec (Ce2.4 #1)" \
  --body "## Problème
3 endpoints V2 implémentés sont absents de \`docs/openapi.yaml\` (37% des endpoints non documentés) :
- \`PATCH /api/v2/stocks/{stockId}\`
- \`DELETE /api/v2/stocks/{stockId}\`
- \`DELETE /api/v2/stocks/{stockId}/items/{itemId}\`

Dérives supplémentaires :
- \`info.version: 2.0.0\` vs CHANGELOG v2.5.0
- URL serveur prod obsolète

## Critère RNCP
Ce2.4 #1 #2 — Documentation API cohérente avec le code

## Acceptance criteria
- [ ] 3 endpoints ajoutés dans \`openapi.yaml\`
- [ ] Version mise à jour : 2.0.0 → 2.5.0
- [ ] URL serveur prod corrigée" \
  --label "documentation,rncp"

# Issue 5 — RGPD back
gh issue create \
  --title "docs(rgpd): add back-end RGPD compliance documentation (Ce2.4 #6)" \
  --body "## Problème
La documentation RGPD existe côté front (wiki, page /privacy, CookieBanner PR #83) mais il manque le pendant back-end :
- Politique de rétention non documentée côté back
- Route \`DELETE /users/me\` absente (droit à l'effacement partiel)

## Critère RNCP
Ce2.4 #6 — Conformité RGPD documentée

## Fichier à créer
\`docs/rgpd.md\`

## Acceptance criteria
- [ ] \`docs/rgpd.md\` créé avec tableau des traitements, politique de rétention, droits RGPD
- [ ] README référence le document
- [ ] Note sur roadmap DELETE /users/me (v2.6.0)" \
  --label "documentation,rgpd,rncp"

# Issue 6 — DDD
gh issue create \
  --title "refactor(domain): remove @prisma/client import from Stock.ts (DDD dependency rule)" \
  --body "## Problème
\`src/domain/stock-management/common/entities/Stock.ts\` importe \`StockCategory\` depuis \`@prisma/client\`.
Violation de la règle de dépendance DDD : le domaine ne doit pas connaître l'infrastructure ORM.

## Critère RNCP
Ce2.4 #1 — Architecture DDD

## Ce qu'il faut faire
- Créer \`src/domain/stock-management/common/value-objects/StockCategory.ts\` (enum domaine)
- Remplacer l'import Prisma dans \`Stock.ts\`
- Ajouter mapping domaine → Prisma dans la couche infrastructure si nécessaire

## Acceptance criteria
- [ ] \`Stock.ts\` sans import \`@prisma/client\`
- [ ] Enum \`StockCategory\` défini dans le domaine
- [ ] \`npx tsc --noEmit\` passe
- [ ] \`npm run test:unit\` passe sans régression" \
  --label "refactoring,architecture,rncp"

# Issue 7 — ADRs
gh issue create \
  --title "docs(adr): add ADR-011 (Render+Aiven staging) and ADR-012 (Node 22 migration)" \
  --body "## Problème
Deux décisions architecturales importantes ne sont pas documentées :
- Choix Render.com + Aiven pour le staging (vs Railway, Fly.io, Heroku...)
- Migration Node 20 → Node 22 (impacts : Dockerfile, CI, render.yaml)

## Critère RNCP
Ce3.5 #21 — Décisions architecturales tracées

## Fichiers à créer
- \`docs/adr/ADR-011-staging-render-aiven.md\`
- \`docs/adr/ADR-012-migration-node22.md\`
- Mise à jour \`docs/adr/INDEX.md\`

## Acceptance criteria
- [ ] ADR-011 créé avec contexte, décision, alternatives, conséquences
- [ ] ADR-012 créé avec contexte, décision, alternatives, conséquences
- [ ] INDEX.md mis à jour" \
  --label "documentation,adr,rncp"
```

**Attends ma validation avant de passer à la Correction 1.**
Note les numéros d'issues créées (tu en auras besoin pour nommer les branches).

---

## CORRECTION 1 — 🔴 Sécurité A01 : autorisation manquante

**Issue GitHub** : #[numéro créé à l'étape 0]
**Branche** : `fix/issue-[N]-security-authorize-stock-write`
**Critère RNCP** : Ce2.4 #4 #6 — OWASP A01

### Mise en place

```bash
git checkout main
git pull
git checkout -b fix/issue-[N]-security-authorize-stock-write
```

### Problème

```typescript
// src/api/routes/StockRoutesV2.ts ~112-129
router.patch('/stocks/:stockId', async (req, res) => {
  await manipulationController.updateStock(req as UpdateStockRequest, res);
  // ← authorizeStockWrite ABSENT
});

router.delete('/stocks/:stockId', async (req, res) => {
  await manipulationController.deleteStock(req as DeleteStockRequest, res);
  // ← authorizeStockWrite ABSENT
});
```

### Ce qu'il faut faire

1. Lis `src/api/routes/StockRoutesV2.ts` en entier
2. Identifie le pattern exact d'utilisation de `authorizeStockWrite` sur les autres routes
3. Ajoute `authorizeStockWrite` sur `PATCH /stocks/:stockId` et `DELETE /stocks/:stockId`
   en suivant exactement le même pattern
4. Vérifie : `npx tsc --noEmit` puis `npm run test:unit`

### Commit et PR

> ⚠️ Pour la PR, utilise `gh pr create` **sans `--body`** si un `PULL_REQUEST_TEMPLATE.md` existe — GitHub l'appliquera automatiquement et tu n'auras qu'à remplir les sections. Si tu dois passer un body, respecte la structure du template existant (lis-le à l'Étape 0.1).

```bash
git add src/api/routes/StockRoutesV2.ts
git commit -m "fix(security): add authorizeStockWrite on PATCH and DELETE stock routes (OWASP A01)

Closes #[N]

- PATCH /api/v2/stocks/:stockId now requires authorizeStockWrite
- DELETE /api/v2/stocks/:stockId now requires authorizeStockWrite
- Fixes OWASP A01 Broken Access Control vulnerability
- RNCP Ce2.4 #4 #6"
git push -u origin fix/issue-[N]-security-authorize-stock-write
gh pr create \
  --title "fix(security): add authorizeStockWrite on PATCH and DELETE stock routes" \
  --base main
# GitHub ouvrira le template PR dans ton éditeur — remplis les sections et sauvegarde
```

**Attends ma validation (merge de la PR) avant de passer à la Correction 2.**

---

## CORRECTION 2 — 🔴 Coverage : seuil minimum + publication

**Issue GitHub** : #[numéro créé à l'étape 0]
**Branche** : `fix/issue-[N]-coverage-threshold`
**Critère RNCP** : Ce3.2 #15

### Mise en place

```bash
git checkout main && git pull
git checkout -b fix/issue-[N]-coverage-threshold
```

### Ce qu'il faut faire

1. Mesure le taux actuel : `npm run test:coverage`
   Note les valeurs lines / functions / branches / statements
2. Dans `jest.ci.config.js`, ajoute `coverageThreshold` avec des seuils légèrement sous le réel (-5%) :

```javascript
coverageThreshold: {
  global: {
    lines: XX,      // taux mesuré - 5
    functions: XX,
    branches: XX,
    statements: XX,
  },
},
```

3. Dans `README.md`, ajoute une section coverage avec le taux mesuré
4. Vérifie que `npm run test:coverage` passe avec le seuil

### Commit et PR

```bash
git commit -m "docs(tests): add coverageThreshold and publish backend coverage rate

Closes #[N]

- Add coverageThreshold in jest.ci.config.js (lines: XX%, functions: XX%)
- Add coverage section in README.md
- RNCP Ce3.2 #15"
git push -u origin fix/issue-[N]-coverage-threshold
gh pr create --title "docs(tests): add coverageThreshold and publish backend coverage rate" \
  --base main
# Remplis le template PR : Closes #[N], critère RNCP Ce3.2 #15
```

---

## CORRECTION 3 — 🔴 Créer `.env.example`

**Issue GitHub** : #[numéro créé à l'étape 0]
**Branche** : `docs/issue-[N]-env-example`
**Critère RNCP** : Ce3.5 #21

### Mise en place

```bash
git checkout main && git pull
git checkout -b docs/issue-[N]-env-example
```

### Ce qu'il faut faire

1. Lis ces fichiers pour identifier toutes les variables utilisées :
   - `src/config/authenticationConfig.ts`
   - `src/config/httpPortConfiguration.ts`
   - `src/Utils/cloudLogger.ts`
   - `compose.yaml`
   - `.env.staging.example` (pour t'inspirer du format)
2. Crée `.env.example` à la racine avec toutes les variables, sans valeurs sensibles
3. Vérifie que `.env.example` n'est PAS dans `.gitignore`
4. Ajoute une référence dans le README

### Commit et PR

```bash
git commit -m "docs(env): add .env.example for local development onboarding

Closes #[N]

- RNCP Ce3.5 #21"
git push -u origin docs/issue-[N]-env-example
gh pr create --title "docs(env): add .env.example for local development onboarding" \
  --base main
# Remplis le template PR : Closes #[N], critère RNCP Ce3.5 #21
```

---

## CORRECTION 4 — 🔴 OpenAPI : 3 endpoints manquants

**Issue GitHub** : #[numéro créé à l'étape 0]
**Branche** : `docs/issue-[N]-openapi-missing-endpoints`
**Critère RNCP** : Ce2.4 #1 #2

### Mise en place

```bash
git checkout main && git pull
git checkout -b docs/issue-[N]-openapi-missing-endpoints
```

### Ce qu'il faut faire

1. Lis `docs/openapi.yaml` en entier pour comprendre le format existant
2. Lis `src/api/controllers/StockControllerManipulation.ts` (paramètres, codes retour)
3. Lis `src/api/dto/StockDTO.ts` (schémas de données)
4. Ajoute les 3 endpoints manquants en suivant le format existant :
   - `PATCH /api/v2/stocks/{stockId}`
   - `DELETE /api/v2/stocks/{stockId}`
   - `DELETE /api/v2/stocks/{stockId}/items/{itemId}`
5. Corrige `info.version: 2.0.0` → `2.5.0` et l'URL serveur prod

### Commit et PR

```bash
git commit -m "docs(api): add missing PATCH/DELETE endpoints to OpenAPI spec

Closes #[N]

- Add PATCH /api/v2/stocks/{stockId}
- Add DELETE /api/v2/stocks/{stockId}
- Add DELETE /api/v2/stocks/{stockId}/items/{itemId}
- Fix info.version 2.0.0 → 2.5.0
- RNCP Ce2.4 #1 #2"
git push -u origin docs/issue-[N]-openapi-missing-endpoints
gh pr create --title "docs(api): add missing PATCH/DELETE endpoints to OpenAPI spec" \
  --base main
# Remplis le template PR : Closes #[N], critère RNCP Ce2.4 #1 #2
```

---

## CORRECTION 5 — 🟡 RGPD : `docs/rgpd.md`

**Issue GitHub** : #[numéro créé à l'étape 0]
**Branche** : `docs/issue-[N]-rgpd-backend`
**Critère RNCP** : Ce2.4 #6

### Mise en place

```bash
git checkout main && git pull
git checkout -b docs/issue-[N]-rgpd-backend
```

### Ce qu'il faut faire

1. Lis `src/authentication/authBearerStrategy.ts` (auto-création user, email stocké)
2. Lis `prisma/schema.prisma` (modèle User, onDelete comportements)
3. Lis le wiki front RGPD pour être cohérent avec ce qui est déjà documenté
4. Crée `docs/rgpd.md` avec :
   - Tableau des données personnelles traitées (email, durée de rétention)
   - Flux de données (Azure B2C → token → base)
   - Tableau des droits RGPD et leur statut d'implémentation
   - Politique de rétention
   - Note sur DELETE /users/me (roadmap v2.6.0)
5. Ajoute le lien dans le README

### Commit et PR

```bash
git commit -m "docs(rgpd): add back-end RGPD compliance documentation

Closes #[N]

- Add docs/rgpd.md with data processing table, retention policy, GDPR rights
- Link from README
- RNCP Ce2.4 #6"
git push -u origin docs/issue-[N]-rgpd-backend
gh pr create --title "docs(rgpd): add back-end RGPD compliance documentation" \
  --base main
# Remplis le template PR : Closes #[N], critère RNCP Ce2.4 #6
```

---

## CORRECTION 6 — 🟡 DDD : supprimer import `@prisma/client` dans `Stock.ts`

**Issue GitHub** : #[numéro créé à l'étape 0]
**Branche** : `refactor/issue-[N]-domain-stock-category`
**Critère RNCP** : Ce2.4 #1

### Mise en place

```bash
git checkout main && git pull
git checkout -b refactor/issue-[N]-domain-stock-category
```

### Ce qu'il faut faire

1. Lis `src/domain/stock-management/common/entities/Stock.ts`
2. Lis `prisma/schema.prisma` (valeurs exactes de l'enum `StockCategory`)
3. Crée `src/domain/stock-management/common/value-objects/StockCategory.ts` avec les mêmes valeurs
4. Remplace l'import `@prisma/client` dans `Stock.ts` par l'import domaine
5. Vérifie si un mapping est nécessaire dans les repositories Prisma
6. `npx tsc --noEmit` + `npm run test:unit`

### Commit et PR

```bash
git commit -m "refactor(domain): extract StockCategory enum to domain layer

Closes #[N]

- Create src/domain/.../value-objects/StockCategory.ts
- Remove @prisma/client import from Stock.ts
- Fixes DDD dependency rule violation
- RNCP Ce2.4 #1"
git push -u origin refactor/issue-[N]-domain-stock-category
gh pr create --title "refactor(domain): extract StockCategory enum to domain layer" \
  --base main
# Remplis le template PR : Closes #[N], critère RNCP Ce2.4 #1 — DDD dependency rule
```

---

## CORRECTION 7 — 🟡 ADR-011 et ADR-012

**Issue GitHub** : #[numéro créé à l'étape 0]
**Branche** : `docs/issue-[N]-adr-011-012`
**Critère RNCP** : Ce3.5 #21

### Mise en place

```bash
git checkout main && git pull
git checkout -b docs/issue-[N]-adr-011-012
```

### Ce qu'il faut faire

1. Lis `docs/adr/ADR-001-migration-ddd-cqrs.md` pour le format à respecter
2. Lis `docs/adr/INDEX.md` pour comprendre la structure
3. Lis `render.yaml` et `.env.staging.example` pour documenter le staging fidèlement
4. Crée `docs/adr/ADR-011-staging-render-aiven.md`
5. Crée `docs/adr/ADR-012-migration-node22.md`
6. Mets à jour `docs/adr/INDEX.md`

### Commit et PR

```bash
git commit -m "docs(adr): add ADR-011 (Render+Aiven staging) and ADR-012 (Node 22 migration)

Closes #[N]

- ADR-011: staging platform choice (Render.com + Aiven vs Railway, Fly.io...)
- ADR-012: Node 20 → 22 migration rationale and impact
- Update INDEX.md
- RNCP Ce3.5 #21"
git push -u origin docs/issue-[N]-adr-011-012
gh pr create --title "docs(adr): add ADR-011 and ADR-012" \
  --base main
# Remplis le template PR : Closes #[N], critère RNCP Ce3.5 #21
```

---

## RÉCAPITULATIF

| #   | Issue              | Branche                                      | Priorité | Durée  |
| --- | ------------------ | -------------------------------------------- | -------- | ------ |
| 1   | Security A01       | `fix/issue-N-security-authorize-stock-write` | 🔴       | 30 min |
| 2   | Coverage threshold | `fix/issue-N-coverage-threshold`             | 🔴       | 30 min |
| 3   | .env.example       | `docs/issue-N-env-example`                   | 🔴       | 20 min |
| 4   | OpenAPI endpoints  | `docs/issue-N-openapi-missing-endpoints`     | 🔴       | 1h     |
| 5   | RGPD back          | `docs/issue-N-rgpd-backend`                  | 🟡       | 45 min |
| 6   | DDD StockCategory  | `refactor/issue-N-domain-stock-category`     | 🟡       | 1h     |
| 7   | ADR-011 + ADR-012  | `docs/issue-N-adr-011-012`                   | 🟡       | 45 min |

**Règle d'or : une issue → une branche → une PR → un merge → issue suivante.**
