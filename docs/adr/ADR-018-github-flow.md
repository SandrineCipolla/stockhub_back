# ADR-018 : Stratégie de branches — GitHub Flow

**Date :** 2026-04-08
**Statut :** ✅ Accepté
**Décideurs :** Sandrine Cipolla
**Tags :** `git`, `workflow`, `ci-cd`, `branches`

---

## Besoin métier

Quand on travaille avec Git, il faut décider comment organiser les branches : où vit le code stable ? comment intègre-t-on une nouvelle fonctionnalité ? comment gère-t-on les releases ?

StockHub est développé en solo, avec un pipeline CI/CD automatisé (GitHub Actions, Release Please, déploiement Render + Azure). La stratégie de branches doit être simple à maintenir seule et compatible avec ce déploiement continu.

---

## Décision

**GitHub Flow** est retenu comme stratégie de branches pour StockHub.

---

## Raisons

### 1. GitHub Flow correspond exactement au mode de travail réel

GitHub Flow repose sur trois règles simples :

1. La branche `main` est toujours dans un état stable et déployable
2. Chaque nouvelle fonctionnalité ou correction démarre sur une branche dédiée
3. Quand le travail est prêt, on ouvre une Pull Request vers `main`, la CI vérifie tout, et on merge

C'est exactement ce qui se passe sur StockHub :

- On ouvre un ticket GitHub → on crée une branche (`feat/157-item-updated-at`, `fix/86-stockitem-lowercase`)
- On travaille, on commit, la CI tourne à chaque push
- La PR ferme le ticket, le merge déclenche Release Please et le déploiement Azure

Aucune étape manuelle, aucune branche intermédiaire inutile.

### 2. Release Please remplace les branches de release de GitFlow

Dans GitFlow (l'alternative classique), on crée des branches `release/x.y.z` pour préparer chaque release manuellement — calculer le numéro de version, tagger, générer le changelog...

Dans StockHub, tout ça est automatisé par **Release Please** : l'outil lit l'historique des commits (qui suivent la convention Conventional Commits), calcule automatiquement le prochain numéro de version, et ouvre lui-même une PR de release. Pas besoin de branches supplémentaires.

### 3. Pas besoin de gérer plusieurs versions en parallèle

GitFlow a été conçu pour des équipes qui doivent maintenir plusieurs versions en production en même temps — par exemple, corriger un bug sur la v1.x pendant que la v2.x est en développement. Dans ce cas, avoir des branches `develop`, `release/*`, `hotfix/*` a du sens.

StockHub n'a qu'une seule version active en production. Ajouter tous ces types de branches serait de la complexité sans utilité réelle.

### 4. La branche `staging` s'intègre naturellement

StockHub ajoute une branche `staging` (déployée automatiquement sur Render avec une base Aiven MySQL) pour tester avant la production. Cette branche s'intègre bien dans GitHub Flow — c'est simplement une branche stable supplémentaire, pas une remise en cause du modèle.

```
main     ──────────────────── (Azure prod, Release Please automatique)
              ↑ merge PR
feat/xxx  ────────
fix/yyy   ────────
staging   ──────────────────── (Render, tests de pré-prod)
```

---

## Alternatives considérées

### GitFlow

**Principe :** GitFlow est une stratégie plus complexe avec plusieurs types de branches : `main` (production), `develop` (intégration en cours), `feature/*` (nouvelles fonctionnalités), `release/*` (préparation d'une release), `hotfix/*` (correction urgente en prod).

**Exemple de workflow GitFlow :**

```
feature/ma-feature → develop → release/1.2.0 → main (+ tag v1.2.0)
```

**Avantages :**

- ✅ Très structuré pour des équipes qui livrent à intervalles réguliers (ex : une release par mois)
- ✅ Permet de maintenir plusieurs versions en production en même temps
- ✅ Standard dans certaines grandes organisations

**Pourquoi rejeté :**

- ❌ Conçu pour des équipes avec des cycles de release planifiés — inadapté au développement solo en flux continu
- ❌ La branche `develop` crée une étape intermédiaire inutile : au lieu de `feature → main`, on doit faire `feature → develop → main`
- ❌ Les branches `release/*` sont rendues inutiles par Release Please qui automatise tout ça
- ❌ Gérer 5 types de branches à la fois seul est une charge cognitive disproportionnée

### Trunk-Based Development

**Principe :** Tout le monde intègre son code directement sur `main` très fréquemment (plusieurs fois par jour), via des branches de très courte durée (moins d'un jour). L'objectif est d'éviter les divergences longues entre branches.

**Avantages :**

- ✅ Intégration continue maximale — les conflits sont détectés très tôt
- ✅ Utilisé par de grandes entreprises tech (Google, Facebook) sur de très grandes équipes

**Pourquoi rejeté :**

- ❌ Pour déployer du code non terminé sur `main` sans casser la prod, il faut utiliser des "feature flags" (des interrupteurs dans le code qui activent ou désactivent une feature). C'est une complexité applicative supplémentaire
- ❌ Les hooks pre-push de StockHub (tests unitaires, lint, knip) prennent quelques minutes — ce modèle suppose des pipelines quasi-instantanés pour ne pas freiner le rythme d'intégration
- ❌ Difficile de maintenir des Pull Requests de qualité (review, CI complète) si les branches ne durent qu'une heure

---

## Conséquences

### Positives ✅

- Workflow simple et cohérent : une branche par ticket, une PR, un merge
- `main` toujours stable et déployable
- Compatible avec Release Please, GitHub Actions, les hooks pre-push et le déploiement continu
- Pas de gestion de branches parallèles, pas de backports manuels

### Négatives ⚠️

- Si plusieurs fonctionnalités sont développées en parallèle sur des branches longues, des conflits peuvent apparaître au moment du merge
  → **Mitigation :** Tickets bien découpés, branches courtes, rebase régulier sur `main`

---

## Liens

- [ADR-010](./ADR-010-ci-cd-pipeline-optimization.md) — pipeline CI/CD
- [ADR-011](./ADR-011-staging-render-aiven.md) — environnement staging
- [GitHub Flow — documentation officielle](https://docs.github.com/en/get-started/using-github/github-flow)
- Issue : [#183](https://github.com/SandrineCipolla/stockhub_back/issues/183)
