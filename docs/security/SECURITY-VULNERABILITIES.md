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

**Dernière mise à jour :** 2026-01-06
**Auteur :** Sandrine Cipolla
**Statut sécurité :** ✅ Aucune vulnérabilité connue (HIGH/CRITICAL)
