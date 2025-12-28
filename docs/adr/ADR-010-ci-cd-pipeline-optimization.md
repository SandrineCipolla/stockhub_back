# ADR-010: Optimisation de la pipeline CI/CD GitHub Actions

**Date:** 2025-12-27
**Statut:** Accepté
**Décideurs:** Sandrine Cipolla

---

## Contexte

### Situation actuelle

La pipeline CI/CD GitHub Actions du backend StockHub prend actuellement **~8 minutes** pour s'exécuter complètement (CI + Build + Deploy). Cette durée impacte négativement l'expérience développeur et ralentit les cycles de feedback.

**Analyse du temps d'exécution (avant optimisation) :**

| Étape                     | Job   | Temps      | Problème identifié                                  |
| ------------------------- | ----- | ---------- | --------------------------------------------------- |
| `npm ci`                  | CI    | ~2 min     | Pas de cache, télécharge 1000+ packages             |
| Type check + Lint + Tests | CI    | ~1-2 min   | OK                                                  |
| **`npm ci`**              | Build | **~2 min** | **Duplication** - retélécharge les mêmes packages   |
| Build (webpack)           | Build | ~1 min     | OK                                                  |
| Upload artifact           | Build | ~15s       | **Inutile** (upload puis download dans le même job) |
| Download artifact         | Build | ~15s       | **Inutile**                                         |
| Deploy Azure              | Build | ~2 min     | OK                                                  |
| **TOTAL**                 | -     | **~8 min** |                                                     |

**Problèmes majeurs identifiés :**

1. **Duplication `npm ci`** : Installation complète des dépendances effectuée 2 fois (CI job + Build job)
2. **Absence de cache npm** : Chaque exécution retélécharge ~200MB de node_modules depuis le registry npm
3. **Upload/Download artifact inutile** : Workflow zip → upload → download → unzip **dans le même job** (lignes 54-69)
4. **Versions Node.js incohérentes** : Node 20.x pour CI, Node 18.x pour Build (risque de bugs environnement)

### Contraintes

- **Performance cible** : Réduire à **~4-5 minutes** (gain 40-50%)
- **Compatibilité** : Ne pas casser le déploiement Azure existant
- **Maintenance** : Solution simple à maintenir, pas de complexité excessive
- **Coût** : Rester dans les limites gratuites GitHub Actions (2000 min/mois)

### Contexte RNCP

Cette optimisation démontre :

- **Analyse de performance** : Identifier les goulots d'étranglement
- **Optimisation infrastructure** : Améliorer l'efficacité sans changer l'architecture
- **DevOps best practices** : Cache, réutilisation d'artefacts, cohérence environnement

## Décision

**Nous optimisons la pipeline CI/CD via 3 techniques complémentaires :**

1. **Cache npm natif GitHub Actions** (`cache: 'npm'`)
2. **Suppression upload/download artifact inutile** dans le build job
3. **Unification version Node.js** à 20.x (cohérence CI/Build)

## Raisons

### Critères de décision

1. **Gain de temps maximal** : Viser 40-50% de réduction
2. **Simplicité** : Pas de refonte complète, optimisations incrémentales
3. **Fiabilité** : Solutions éprouvées par la communauté GitHub Actions
4. **Coût zéro** : Fonctionnalités natives GitHub Actions

### Pourquoi cette solution

**1. Cache npm natif (`cache: 'npm'`)** ✅

- **Gain estimé:** ~2-3 min (installation dépendances)
- **Implémentation triviale:** 1 ligne de config
- **Maintenance GitHub:** Cache géré automatiquement (invalidation, nettoyage)
- **Largement adopté:** Best practice officielle GitHub

```yaml
- uses: actions/setup-node@v3
  with:
    node-version: '20.x'
    cache: 'npm' # ✨ Active le cache automatique
```

**Avantage clé :** Le cache npm est si efficace (~30s pour `npm ci` avec cache vs 2 min sans) qu'il n'est pas nécessaire de partager `node_modules` entre jobs via artifacts. Chaque job exécute `npm ci` avec le cache, ce qui est plus simple et évite les problèmes de compatibilité des binaires natifs.

**2. Suppression upload/download artifact GitHub inutile** ✅

- **Gain estimé:** ~30s
- **Bug détecté:** Workflow original faisait zip → **upload artifact vers GitHub** → **download artifact depuis GitHub** → unzip **dans le même job** (lignes 54-69 de l'ancien workflow)
- **Solution:** Garder zip/unzip local (nécessaire pour filtrer fichiers déployés), mais supprimer l'upload/download vers GitHub Artifacts qui ne servait à rien

**3. Unification Node.js 20.x** ✅

- **Cohérence environnement:** Même version partout (CI = Build = Production)
- **Sécurité:** Node 20.x LTS (support jusqu'à avril 2026)
- **Performance:** Node 20.x plus rapide que 18.x (V8 optimisations)

## Alternatives considérées

### Alternative 1: Partage de node_modules entre jobs via artifacts

**Principe:** Upload node_modules du CI job, download dans Build job pour éviter `npm ci`

```yaml
# CI job
- name: Upload node_modules
  uses: actions/upload-artifact@v4
  with:
    name: node_modules
    path: node_modules

# Build job
- name: Download node_modules
  uses: actions/download-artifact@v4
  with:
    name: node_modules
    path: node_modules
```

- **Avantages:**
  - Évite d'exécuter `npm ci` dans le Build job
  - Gain théorique ~1-2 min

- **Inconvénients:**
  - Upload/download ~200MB (~30-60s de latence réseau)
  - Risque d'incompatibilité binaires natifs entre runners
  - Complexité configuration (path, extraction)
  - Gain réel faible car cache npm déjà très efficace (~30s pour `npm ci`)

- **Pourquoi rejetée:** Avec le cache npm activé, `npm ci` prend ~30s. Le gain d'éviter `npm ci` est annulé par le temps d'upload/download + risques d'incompatibilité. **Solution retenue : cache npm seul (plus simple et fiable).**

### Alternative 2: Migration vers pnpm

**Principe:** Remplacer npm par pnpm (package manager plus performant)

```yaml
- uses: pnpm/action-setup@v2
  with:
    version: 8
- run: pnpm install --frozen-lockfile
```

- **Avantages:**
  - Cache encore plus efficace (hard links)
  - Installation ~30-40% plus rapide que npm
  - Moins d'espace disque

- **Inconvénients:**
  - Migration complète requise (package-lock.json → pnpm-lock.yaml)
  - Risque de bugs incompatibilité pnpm/npm
  - Équipe doit installer pnpm localement
  - Temps de migration : ~1-2 jours

- **Pourquoi rejetée:** Rapport coût/bénéfice défavorable. Gain marginal (~1 min) vs effort migration élevé.

### Alternative 3: Docker layer caching

**Principe:** Builder une image Docker avec dépendances pré-installées

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

- **Avantages:**
  - Cache Docker layers (dépendances installées 1×)
  - Image reproductible localement = production
  - Isolation complète environnement

- **Inconvénients:**
  - Complexité accrue (Dockerfile, docker-compose, registry)
  - Temps de build image initial : ~5-10 min
  - Azure Web App nécessite configuration supplémentaire (container deployment)
  - Over-engineering pour une API Node.js simple

- **Pourquoi rejetée:** Trop complexe pour le gain attendu. GitHub Actions cache suffit.

### Alternative 4: Actions concurrentes (matrix strategy)

**Principe:** Paralléliser tests/lint en jobs séparés

```yaml
strategy:
  matrix:
    task: [lint, test:unit, test:integration]
steps:
  - run: npm run ${{ matrix.task }}
```

- **Avantages:**
  - Tests en parallèle (3 runners simultanés)
  - Gain temps si beaucoup de tests

- **Inconvénients:**
  - Chaque job doit installer dépendances → 3× `npm ci`
  - Coût en minutes GitHub Actions (3 jobs × 3 min = 9 min total)
  - Complexité configuration
  - Pas adapté ici (tests unitaires rapides : <30s)

- **Pourquoi rejetée:** Contre-productif. Overhead installation dépendances annule le gain.

### Alternative 5: Self-hosted runner

**Principe:** Héberger un runner GitHub Actions sur serveur perso/cloud

- **Avantages:**
  - Performance max (hardware dédié)
  - Cache persistent entre exécutions
  - Pas de limite minutes GitHub

- **Inconvénients:**
  - Coût infrastructure (~10-50€/mois)
  - Maintenance serveur (updates, sécurité)
  - Overkill pour projet académique RNCP

- **Pourquoi rejetée:** Coût/maintenance disproportionnés pour le besoin.

## Conséquences

### Positives

- ✅ **Gain de temps ~40-50%** : 8 min → 4-5 min (feedback plus rapide)
- ✅ **Developer Experience** : Cycles itératifs plus courts
- ✅ **Économie minutes GitHub** : Optimisation importante si multiplication PRs
- ✅ **Cohérence environnement** : Node 20.x partout (réduit bugs environnement)
- ✅ **Simplicité** : Configuration minimale, pas de dépendances externes
- ✅ **Démonstration RNCP** : Capacité d'analyse et optimisation infrastructure

### Négatives

- ⚠️ **Dépendance cache GitHub** : Si cache invalidé, temps d'exécution légèrement plus long (1ère exécution, ~8 min au lieu de 4-5 min)

### Risques et mitigations

| Risque                                      | Probabilité | Impact | Mitigation                                                        |
| ------------------------------------------- | ----------- | ------ | ----------------------------------------------------------------- |
| Cache npm corrompu causant erreurs build    | Faible      | Moyen  | GitHub invalide cache automatiquement si package-lock.json change |
| Régression temps d'exécution sur cache miss | Faible      | Faible | Cache miss = retour au comportement actuel (~8 min)               |

## Validation

### Critères de succès

**Métriques de performance (mesurables via GitHub Actions logs) :**

- [ ] **Temps total CI/CD** : < 5 min (vs ~8 min actuellement)
- [ ] **Temps `npm ci` avec cache** : < 30s (vs ~2 min sans cache)
- [ ] **Temps Build job** : < 2 min (vs ~4 min actuellement)
- [ ] **Taux de cache hit** : > 90% sur les PRs

**Validation fonctionnelle :**

- [ ] Pipeline CI passe sur branche feat-issue-53-optimize-cicd
- [ ] Déploiement Azure fonctionne (pas de régression)
- [ ] Tests E2E passent en production après déploiement

### Méthode de mesure

1. **Baseline (avant)** : Mesurer temps d'exécution sur PR actuelle
2. **Après optimisation** : Mesurer temps sur PR avec optimisations
3. **Comparaison** : Calculer gain en % et minutes absolues

**Commandes pour mesurer :**

```bash
# Voir durée complète workflow
gh run view <run-id> --log

# Comparer temps entre 2 runs
gh run list --workflow="CI/CD Pipeline" --limit 10
```

### Résultats attendus

**Scénario 1 : Cache hit (90% des cas)**

| Job             | Avant      | Après            | Gain     |
| --------------- | ---------- | ---------------- | -------- |
| CI (npm ci)     | 2 min      | 30s (avec cache) | -75%     |
| CI (tests)      | 1.5 min    | 1.5 min          | -        |
| Build (npm ci)  | 2 min      | 30s (avec cache) | -75%     |
| Build (webpack) | 1 min      | 1 min            | -        |
| Deploy          | 2 min      | 2 min            | -        |
| **TOTAL**       | **~8 min** | **~4.5 min**     | **~44%** |

**Scénario 2 : Cache miss (10% des cas - 1ère exécution ou package.json modifié)**

| Job            | Temps                                         |
| -------------- | --------------------------------------------- |
| CI (npm ci)    | 2 min (cache rebuild)                         |
| Build (npm ci) | 2 min (cache rebuild)                         |
| **TOTAL**      | **~8 min** (pas de gain, mais situation rare) |

## Détails techniques

### Implémentation finale

**Fichier modifié :** `.github/workflows/main_stockhub-back.yml`

**Changements apportés :**

1. **Ligne 22** : Ajout `cache: 'npm'` dans CI job
2. **Ligne 49** : Unification Node 20.x dans Build job (anciennement 18.x)
3. **Ligne 50** : Ajout `cache: 'npm'` dans Build job
4. **Ligne 53** : `npm ci` dans Build job (avec cache, ~30s au lieu de 2 min)
5. **Suppression lignes 54-69** : Upload/download artifact GitHub inutiles
6. **Ligne 71** : Deploy directement après build (package: .)

### Configuration cache npm

Le cache npm fonctionne avec un hash du fichier `package-lock.json` :

```yaml
# Généré automatiquement par GitHub Actions
cache-key: node-cache-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
```

**Invalidation automatique si :**

- `package-lock.json` modifié (nouvelle dépendance)
- Cache expiré (7 jours inactivité)
- Cache corrompu (détection automatique)

## Évolutions futures possibles

Si le besoin de performance augmente encore :

1. **Migration pnpm** (gain additionnel ~1 min) - Si équipe grandit
2. **Cache Turborepo** - Si migration vers monorepo
3. **GitHub Actions cache-next** - Quand fonctionnalité beta stabilisée
4. **Self-hosted runner** - Si budget infrastructure disponible

## Liens

- **Issue GitHub** : #53
- **Fichier modifié** : `.github/workflows/main_stockhub-back.yml`
- **Documentation GitHub Actions cache** : https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows
- **Node 20 LTS schedule** : https://github.com/nodejs/release#release-schedule
- **Azure Web Apps Deploy action** : https://github.com/Azure/webapps-deploy

---

**Note:** Les ADRs sont immuables. Si cette décision change, créer une nouvelle ADR qui supplante celle-ci.
