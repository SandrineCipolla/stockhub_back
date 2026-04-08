# ADR-018 : Stratégie de branches — GitHub Flow

**Date :** 2026-04-08
**Statut :** ✅ Accepté
**Décideurs :** Sandrine Cipolla
**Tags :** `git`, `workflow`, `ci-cd`, `branches`

---

## Besoin métier

StockHub est développé en solo avec un pipeline CI/CD automatisé (GitHub Actions, Release Please, déploiement Render + Azure). La stratégie de branches doit être simple à maintenir seule, compatible avec le déploiement continu, et ne pas créer de charge de gestion de branches parallèles inutile.

---

## Décision

**GitHub Flow** est retenu comme stratégie de branches pour StockHub.

---

## Raisons

### 1. GitHub Flow correspond au mode de travail réel

GitHub Flow repose sur trois éléments :

1. `main` est toujours déployable
2. Chaque feature/fix/docs part d'une branche dédiée (`type/numero-description`)
3. La branche est mergée via PR après review

Ce workflow correspond exactement à la façon dont StockHub est développé :

- Chaque ticket GitHub ouvre une branche (`feat/157-item-updated-at`, `fix/86-stockitem-lowercase`)
- La PR ferme le ticket et déclenche le CI
- Le merge sur `main` déclenche Release Please et le déploiement Azure

### 2. Release Please remplace la gestion manuelle des branches de release

GitFlow nécessite des branches `release/x.y.z` pour préparer les releases. Dans StockHub, cette responsabilité est déléguée à **Release Please** : l'outil lit les commits Conventional Commits depuis le dernier tag, calcule le prochain numéro de version sémantique, et ouvre automatiquement une PR de release.

La branche `release/*` de GitFlow n'apporte rien dans ce contexte — elle serait une étape manuelle remplacée par un outil.

### 3. Pas de maintenance de versions parallèles

GitFlow est conçu pour des projets qui maintiennent plusieurs versions en production simultanément (v1.x en maintenance + v2.x en développement actif). StockHub n'a qu'une seule version active (`main` → Azure prod). Maintenir des branches `develop`, `release/*`, `hotfix/*` sans ce besoin serait de la complexité sans valeur.

### 4. La branche `staging` est une extension du modèle, pas une exception

StockHub ajoute une branche `staging` (déployée sur Render + Aiven MySQL) au modèle GitHub Flow de base. Cette branche est stable et ne reçoit que des merges contrôlés — elle ne remet pas en cause la simplicité du workflow.

```
main     ──────────────────────────────── (Azure prod, Release Please)
              ↑ merge PR
feat/xxx  ─────────────
fix/yyy   ─────────────
staging   ──────────────── (Render, tests de pré-prod)
```

---

## Alternatives considérées

### GitFlow

**Principe :** `main` (prod) + `develop` (intégration) + `feature/*` + `release/*` + `hotfix/*`.

**Avantages :**

- ✅ Structuré pour des équipes qui maintiennent plusieurs versions
- ✅ Séparation claire développement / stabilisation / production
- ✅ Standard dans les grandes organisations

**Pourquoi rejeté :**

- ❌ Conçu pour des **équipes** avec des cycles de release planifiés — inadapté au développement solo en flux continu
- ❌ La branche `develop` crée un niveau d'indirection sans valeur : `feature → develop → main` vs `feature → main`
- ❌ Les branches `release/*` et `hotfix/*` sont gérées par Release Please et les hooks pre-push, pas manuellement
- ❌ Charge cognitive inutile sur un projet solo : 5 types de branches pour un seul développeur

### Trunk-Based Development

**Principe :** Tout le monde commit directement sur `main` (ou via des branches très courtes < 1 jour).

**Avantages :**

- ✅ Intégration continue maximale (pas de divergence longue)
- ✅ Utilisé par Google, Facebook à grande échelle

**Pourquoi rejeté :**

- ❌ Requiert des feature flags pour déployer du code non terminé — complexité applicative supplémentaire
- ❌ Difficile à combiner avec des PRs de qualité (review, CI complète) sur des branches courtes
- ❌ Les hooks pre-push (tests, knip) prennent quelques minutes — le modèle trunk suppose des pipelines très rapides

---

## Conséquences

### Positives ✅

- Workflow simple : une branche par ticket, une PR, un merge
- `main` toujours en état de déploiement
- Compatibilité totale avec Release Please, GitHub Actions, les hooks pre-push
- Pas de gestion de branches parallèles ou de backports

### Négatives ⚠️

- Si plusieurs features sont développées en parallèle, le rebase sur `main` peut créer des conflits
  → **Mitigation :** Branches courtes, tickets bien découpés, rebase fréquent

---

## Liens

- [ADR-010](./ADR-010-ci-cd-pipeline-optimization.md) — pipeline CI/CD
- [ADR-011](./ADR-011-staging-render-aiven.md) — environnement staging
- [GitHub Flow — officiel](https://docs.github.com/en/get-started/using-github/github-flow)
- Issue : [#183](https://github.com/SandrineCipolla/stockhub_back/issues/183)
