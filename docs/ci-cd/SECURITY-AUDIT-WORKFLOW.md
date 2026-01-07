# Security Audit Workflow - Documentation Technique

**Date de création :** 2026-01-06
**Issue :** #45 - Ajouter npm audit à la CI/CD
**Auteur :** Sandrine Cipolla

---

## 🎯 Objectif

Créer un workflow GitHub Actions **dédié** à l'audit de sécurité avec un badge dynamique indépendant, permettant de visualiser instantanément l'état de sécurité du projet.

---

## 🤔 Pourquoi un workflow séparé ?

### Problème initial

Le projet avait déjà `npm audit` intégré dans le workflow principal `main_stockhub-back.yml` :

```yaml
# .github/workflows/main_stockhub-back.yml
jobs:
  continuous-integration:
    steps:
      - name: Security Audit
        run: npm audit --audit-level=high
```

**Inconvénients :**

1. **Badge non spécifique** : Le badge CI/CD montre l'état global (tests + lint + build + audit)
2. **Manque de clarté** : Si le badge est rouge, impossible de savoir si c'est un test qui échoue ou une vulnérabilité
3. **Visibilité réduite** : Les problèmes de sécurité sont noyés dans les autres checks

### Solution : Workflow dédié

Créer un workflow séparé **uniquement pour l'audit de sécurité** permet d'avoir un **badge dédié** qui affiche exclusivement l'état de la sécurité.

---

## 🏗️ Architecture

### Avant (1 workflow)

```
┌─────────────────────────────────────┐
│ main_stockhub-back.yml              │
│                                     │
│  ✅ Lint                            │
│  ✅ Tests                           │
│  ✅ Build                           │
│  ❌ npm audit (vulnérabilité !)    │
└─────────────────────────────────────┘
           ↓
    Badge CI/CD: 🔴 FAILED
    (Cause inconnue sans cliquer)
```

### Après (2 workflows)

```
┌─────────────────────────────┐   ┌──────────────────────────┐
│ main_stockhub-back.yml      │   │ security-audit.yml       │
│                             │   │                          │
│  ✅ Lint                    │   │  ❌ npm audit            │
│  ✅ Tests                   │   │     (vulnérabilité !)    │
│  ✅ Build                   │   │                          │
└─────────────────────────────┘   └──────────────────────────┘
         ↓                                  ↓
  Badge CI/CD: 🟢 PASSING          Badge Security: 🔴 FAILED
```

**Résultat README :**

```markdown
![CI/CD Pipeline](...) # 🟢 OK
![Security Audit](...) # 🔴 Problème de sécurité !
```

**Diagnostic immédiat** en un coup d'œil.

---

## 📋 Implémentation

### 1. Création du workflow `security-audit.yml`

**Fichier :** `.github/workflows/security-audit.yml`

```yaml
name: Security Audit

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 1' # Tous les lundis à 00:00 UTC
  workflow_dispatch: # Permet déclenchement manuel

jobs:
  security-audit:
    name: npm audit
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=high
        continue-on-error: false

      - name: Security audit summary
        if: success()
        run: |
          echo "✅ No HIGH or CRITICAL vulnerabilities detected"
          npm audit --audit-level=moderate || echo "⚠️ Some MODERATE/LOW vulnerabilities found (non-blocking)"
```

### 2. Déclencheurs (triggers)

| Déclencheur         | Quand ?                      | Pourquoi ?                                 |
| ------------------- | ---------------------------- | ------------------------------------------ |
| `push`              | Push sur `main` ou `develop` | Vérifier après chaque merge                |
| `pull_request`      | PR vers `main` ou `develop`  | Bloquer le merge si vulnérabilité          |
| `schedule` (cron)   | Tous les lundis à 00:00 UTC  | Détecter nouvelles vulnérabilités publiées |
| `workflow_dispatch` | Déclenchement manuel         | Audit à la demande                         |

**Pourquoi un cron hebdomadaire ?**

De nouvelles vulnérabilités sont publiées régulièrement dans les CVE databases. Le cron permet de détecter des vulnérabilités dans des dépendances **déjà installées** même si on ne push pas de code.

### 3. Badge dynamique dans README

**Ajout dans `README.md` :**

```markdown
![Security Audit](https://github.com/SandrineCipolla/stockhub_back/actions/workflows/security-audit.yml/badge.svg)
```

**Comportement du badge :**

- 🟢 **PASSING** : Aucune vulnérabilité HIGH/CRITICAL
- 🔴 **FAILING** : Vulnérabilité détectée
- ⚪ **PENDING** : Audit en cours

**Badge cliquable** → Mène directement aux runs du workflow pour voir les détails.

---

## 🔍 Fonctionnement détaillé

### Niveau d'audit

```bash
npm audit --audit-level=high
```

**Bloque si :**

- Vulnérabilités **HIGH** (Haute)
- Vulnérabilités **CRITICAL** (Critique)

**Permet (non bloquant) :**

- Vulnérabilités **MODERATE** (Modérée)
- Vulnérabilités **LOW** (Faible)

**Justification :**

- HIGH/CRITICAL = Impact sécurité majeur → Bloquer le merge
- MODERATE/LOW = Risque moindre → Traiter en background, ne pas bloquer le développement

### Exemple de sortie

**Aucune vulnérabilité :**

```
✅ No HIGH or CRITICAL vulnerabilities detected
audited 1092 packages in 2s
found 0 vulnerabilities
```

**Vulnérabilité détectée :**

```
❌ npm audit report

qs  <6.14.1
Severity: high
DoS via memory exhaustion - https://github.com/advisories/GHSA-6rw7-vpxm-498p
fix available via `npm audit fix`

1 high severity vulnerability

To address all issues, run:
  npm audit fix
```

---

## 📊 Avantages vs Inconvénients

### ✅ Avantages

| Aspect                   | Bénéfice                                           |
| ------------------------ | -------------------------------------------------- |
| **Visibilité**           | Badge dédié → État sécurité visible immédiatement  |
| **Clarté**               | Sépare sécurité des autres checks (tests, lint)    |
| **Monitoring continu**   | Cron hebdomadaire détecte nouvelles vulnérabilités |
| **Déclenchement manuel** | `workflow_dispatch` pour audit à la demande        |
| **Documentation RNCP**   | Preuve visuelle de l'intégration npm audit         |

### ⚠️ Inconvénients (minimes)

| Aspect            | Impact                          | Mitigation                              |
| ----------------- | ------------------------------- | --------------------------------------- |
| **Duplication**   | npm audit dans 2 workflows      | Négligeable (~2s d'exécution)           |
| **Maintenance**   | 2 workflows à maintenir         | Fichiers simples et stables             |
| **Quotas GitHub** | Consomme minutes GitHub Actions | Limites gratuites largement suffisantes |

---

## 🧪 Tests et validation

### 1. Tester le workflow localement

```bash
# Simuler le workflow
npm ci
npm audit --audit-level=high
```

**Résultat attendu :**

- ✅ Exit code 0 si pas de vulnérabilités HIGH/CRITICAL
- ❌ Exit code 1 si vulnérabilité détectée

### 2. Tester le déclenchement manuel

Sur GitHub :

1. Aller dans **Actions** → **Security Audit**
2. Cliquer **Run workflow**
3. Sélectionner la branche
4. Lancer

### 3. Vérifier le badge

Après le premier run :

1. Aller sur le README
2. Badge **Security Audit** doit s'afficher
3. Cliquer → Doit mener vers les runs du workflow

---

## 🔧 Maintenance

### Corriger une vulnérabilité

**Workflow typique :**

1. **Détection** : Badge devient rouge 🔴
2. **Investigation** : Cliquer sur le badge → Voir les logs
3. **Correction** :
   ```bash
   npm audit fix        # Auto-fix si disponible
   # OU
   npm update <package> # Mise à jour manuelle
   ```
4. **Commit & Push** : Le workflow re-run automatiquement
5. **Validation** : Badge redevient vert 🟢

**Documenter :** Ajouter l'incident dans `docs/security/SECURITY-VULNERABILITIES.md` (disponible après PR #73)

### Cas particulier : Pas de fix disponible

Si `npm audit fix` ne corrige pas :

1. Vérifier si mise à jour manuelle possible
2. Sinon, évaluer le risque (impact réel sur le projet ?)
3. Documenter dans `SECURITY.md`
4. Suivre l'advisory GitHub pour un patch futur

---

## 📚 Références

### Documentation GitHub Actions

- [GitHub Actions Badges](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Cron Schedule](https://crontab.guru/)

### npm audit

- [npm audit docs](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [Security Best Practices](https://docs.npmjs.com/cli/v10/using-npm/security)

### Projet StockHub

- **Issue #45 :** Ajouter npm audit à la CI/CD
- **SECURITY.md :** Politique de sécurité globale
- **docs/security/SECURITY-VULNERABILITIES.md :** Changelog des vulnérabilités (après PR #73)

---

## 📝 Checklist de mise en place

Pour implémenter ce workflow sur un nouveau projet :

- [ ] Créer `.github/workflows/security-audit.yml`
- [ ] Configurer déclencheurs (`push`, `pull_request`, `schedule`)
- [ ] Définir `audit-level` (recommandé : `high`)
- [ ] Ajouter badge dans README.md
- [ ] Tester avec `workflow_dispatch` (déclenchement manuel)
- [ ] Documenter dans SECURITY.md
- [ ] Former l'équipe sur le processus de correction

---

**Auteur :** Sandrine Cipolla
**Date :** 2026-01-06
**Issue :** #45
**Status :** ✅ Implémenté
