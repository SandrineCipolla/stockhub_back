# Security Vulnerabilities - Changelog

Ce document trace toutes les vulnérabilités de sécurité découvertes et corrigées dans le projet StockHub Backend.

---

## 🔴 CVE-2025-01 : qs DoS via Memory Exhaustion

**Date de découverte :** 2026-01-06
**Date de résolution :** 2026-01-06
**Sévérité :** HIGH (Haute)
**Advisory GitHub :** [GHSA-6rw7-vpxm-498p](https://github.com/advisories/GHSA-6rw7-vpxm-498p)

### Description

Vulnérabilité dans le package `qs` (Query String parser) permettant un **Denial of Service (DoS)** via épuisement de la mémoire.

**Package affecté :** `qs < 6.14.1`
**Type d'attaque :** DoS (Denial of Service)
**Vecteur d'attaque :** HTTP Query String avec bracket notation

### Détails techniques

#### Problème

Le package `qs` est utilisé par Express et body-parser pour parser les query strings (paramètres d'URL). Il possède une option `arrayLimit` (défaut: 20) pour limiter le nombre d'éléments dans un tableau parsé.

**Bypass découvert :** Un attaquant peut contourner cette limite en utilisant la **bracket notation**, permettant de créer des tableaux de millions d'entrées.

#### Exploitation

```http
GET /api/v2/stocks?filter[0]=a&filter[1]=b&...&filter[999999]=z HTTP/1.1
Host: localhost:3006
```

**Conséquence :**

- 💥 Exhaustion de la mémoire du serveur Node.js
- 🔻 Crash de l'application
- ⏱️ Indisponibilité du service (DoS)

#### Impact sur StockHub

**Endpoints vulnérables :**

Tous les endpoints Express acceptant des query parameters :

```typescript
// Routes affectées
GET /api/v2/stocks?category=...&status=...
GET /api/v2/stocks/:stockId/items?filter=...
POST /api/v2/stocks (body-parser utilise qs)
```

**Dépendances affectées :**

```
express@4.x.x
  └── body-parser@1.x.x
      └── qs@6.13.0  ❌ Vulnérable
```

### Résolution

#### Fix appliqué

```bash
npm audit fix
```

**Changements :**

- `qs` : `6.13.0` → `6.14.1+`
- Mise à jour automatique des dépendances transitives

**Commit :** `199346e` - fix(security): resolve qs vulnerability (DoS via memory exhaustion)
**PR :** #73
**Branch :** `feat-issue-71-middleware-di`

#### Vérification

```bash
# Avant
$ npm audit
1 high severity vulnerability

# Après
$ npm audit
found 0 vulnerabilities ✅
```

#### CI/CD

La pipeline CI/CD bloquait le merge avec l'audit de sécurité :

```yaml
- name: Security Audit
  run: npm audit --audit-level=high
```

Résultat : ✅ Pipeline passe maintenant

### Prévention future

#### 1. Audit automatique (déjà en place ✅)

```yaml
# .github/workflows/ci.yml
- name: Security Audit
  run: npm audit --audit-level=high
```

Ce step bloque automatiquement tout merge si une vulnérabilité HIGH/CRITICAL est détectée.

#### 2. Dependabot (recommandé)

Activer Dependabot sur le repo GitHub pour des PRs automatiques de mise à jour :

```yaml
# .github/dependabot.yml (à créer)
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
```

#### 3. Audits réguliers

```bash
# À exécuter régulièrement en local
npm audit
npm outdated
```

#### 4. Rate Limiting (protection DoS supplémentaire)

```typescript
// src/index.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);
```

### Références

- **GitHub Advisory :** https://github.com/advisories/GHSA-6rw7-vpxm-498p
- **NPM Advisory :** https://www.npmjs.com/advisories/qs
- **Fix commit (qs repo) :** https://github.com/ljharb/qs/commit/...

---

## 🟡 Lot de septembre 2026 : 35 vulnérabilités accumulées (10 PR Dependabot en attente)

**Date de découverte :** 2026-09-16 (accumulation progressive depuis plusieurs mois, sans traitement groupé avant cette date)
**Date de résolution :** 2026-09-16 et 2026-09-17
**Sévérité :** HIGH (3) et MODERATE (32) au moment de la découverte
**Advisory principal :** [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) (deepmerge-ts, via Prisma)

### Description

10 PR Dependabot ouvertes en parallèle (#256, #261 à #270), chacune ciblant une seule vulnérabilité sur les 35 accumulées dans le projet. Aucune n'avait été mergée : les merger une par une aurait déclenché 10 cycles de rebase et de relance CI en cascade côté Dependabot, avec un risque de conflit git à chaque étape.

### Détails techniques

#### Problème

`npm audit` sur `main` remontait 35 vulnérabilités (1 low, 24 moderate, 10 high), réparties sur des dépendances directes (`js-yaml`, `qs`/`express`, `mysql2`, `undici`) et transitives (`fast-uri`, `@humanfs/node`, `joi`, `browserslist`, `baseline-browser-mapping`, `smol-toml` via les outils de build/test, et `deepmerge-ts` via `@prisma/config`).

Les 10 PR Dependabot ciblaient chacune un package précis. `npm audit fix`, exécuté sans `--force`, en résout 25 en dépassant leurs cibles individuelles grâce à la résolution transitive du lockfile. Les 10 vulnérabilités restantes (`uuid` via `@azure/msal-node`/`dockerode`/`testcontainers`/`passport-azure-ad`, et `deepmerge-ts` via `prisma`) n'avaient pas de PR automatique : pas de fix disponible sans breaking change pour `uuid`, pas d'`overrides` en place pour `deepmerge-ts`.

#### Impact sur StockHub

Aucune de ces vulnérabilités n'était activement exploitée ni exploitable côté StockHub : ce sont des dépendances de build, de test ou de logging (OpenTelemetry via Application Insights, dépendances de dev), pas du code exposé directement à une requête HTTP non authentifiée. Le risque réel était surtout le blocage du workflow CI `Security Audit`, qui empêchait de vérifier que de nouvelles vulnérabilités ne s'ajoutaient pas.

### Résolution

#### Fix appliqué, étape 1 (PR #272)

```bash
npm audit fix
```

Sans `--force`, donc sans breaking change. Résout 25 des 35 vulnérabilités : toutes les versions installées dépassent désormais les cibles demandées par les 10 PR Dependabot, qui se ferment automatiquement à la fusion.

**Commit :** `2410225` - fix(deps): résoudre 25 vulnérabilités npm via npm audit fix
**PR :** #272
**Branch :** `chore/security-deps-batch`

#### Fix appliqué, étape 2 (PR #273)

`npm audit fix` seul ne suffisait pas pour `deepmerge-ts` (transitif via `@prisma/config`, pas de version compatible dans les contraintes de semver de Prisma à ce moment). Ajout d'un `overrides` dans `package.json` pour forcer `deepmerge-ts` en `^8.0.2` :

```json
{
  "overrides": {
    "deepmerge-ts": "^8.0.2"
  }
}
```

**Commit :** voir PR #273 - fix(deps): override deepmerge-ts pour débloquer le Security Audit
**PR :** #273

#### Vérification

```bash
# Avant (16 septembre 2026)
$ npm audit
35 vulnerabilities (1 low, 24 moderate, 10 high)

# Après PR #272
$ npm audit
10 vulnerabilities (7 moderate, 3 high)

# Après PR #273
$ npm audit
7 vulnerabilities (7 moderate, 0 high)
$ npm audit --audit-level=high
found 0 vulnerabilities ✅ (exit code 0, débloque le workflow Security Audit)
```

`npm run test:unit` (318/318), `npm run lint` (0 warning), `npx tsc --noEmit` (0 erreur) et `npm run build` (succès) passent après chaque étape.

### Prévention future

#### 1. Ne pas laisser les PR Dependabot s'accumuler

10 PR ouvertes en même temps est le signal que le rythme de merge individuel ne suit pas le rythme de publication de Dependabot. Le batch groupé (`npm audit fix` sur une branche dédiée) est la bonne réponse quand l'accumulation est déjà là, mais la vraie prévention est de merger au fil de l'eau plutôt que de laisser s'accumuler.

#### 2. Les 7 vulnérabilités moderate restantes (uuid) sont un choix assumé

Elles nécessitent `npm audit fix --force`, qui casserait `@azure/msal-node` (authentification) et `testcontainers` (tests d'intégration), un risque jugé disproportionné par rapport à des vulnérabilités moderate sur des dépendances de test/auth non directement exposées. À réévaluer si un fix non-breaking apparaît, ou si la sévérité de l'advisory change.

### Références

- **PR #272 :** https://github.com/SandrineCipolla/stockhub_back/pull/272
- **PR #273 :** https://github.com/SandrineCipolla/stockhub_back/pull/273
- **GitHub Advisory (deepmerge-ts) :** https://github.com/advisories/GHSA-ggr8-5vv4-36mx

---

## Template pour futures vulnérabilités

```markdown
## 🔴 CVE-YYYY-NN : [Titre vulnérabilité]

**Date de découverte :** YYYY-MM-DD
**Date de résolution :** YYYY-MM-DD
**Sévérité :** [CRITICAL/HIGH/MEDIUM/LOW]
**Advisory :** [Lien]

### Description

[Description courte du problème]

### Détails techniques

#### Problème

[Explication technique]

#### Exploitation

[Exemple d'exploitation]

#### Impact sur StockHub

[Impact spécifique au projet]

### Résolution

#### Fix appliqué

[Commandes et changements]

#### Vérification

[Tests de vérification]

### Prévention future

[Mesures pour éviter ce type de problème]

### Références

[Liens vers advisories, CVE, commits]
```

---

**Dernière mise à jour :** 2026-09-17
**Auteur :** Sandrine Cipolla
**Statut sécurité :** ✅ 0 vulnérabilité HIGH/CRITICAL. 7 MODERATE restantes (uuid, transitif via `@azure/msal-node`/`testcontainers`), voir "Lot de septembre 2026" ci-dessus pour le détail. Vérifier `npm audit` pour l'état réel avant de citer un chiffre : ce fichier n'est mis à jour qu'à l'occasion d'un incident traité, pas en continu.
