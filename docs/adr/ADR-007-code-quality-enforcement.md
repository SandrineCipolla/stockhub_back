# ADR-007 : Application stricte des standards de qualité de code

**Date** : 2024-12-19
**Statut** : ✅ Accepté
**Décideurs** : Équipe technique
**Tags** : `qualité`, `typescript`, `eslint`, `git-hooks`, `standards`

## Contexte

Le projet backend StockHub manquait de standards de qualité stricts et automatisés. Problèmes identifiés :

1. **76 warnings `@typescript-eslint/no-explicit-any`** dans le code
2. Absence de vérifications TypeScript strictes (`noImplicitReturns`, `noUnusedParameters`, etc.)
3. Pas de vérification automatique du formatage avant push
4. Présence de code mort et d'exports inutilisés
5. Typage laxiste avec utilisation excessive de `any`

Ces problèmes réduisaient la maintenabilité et augmentaient le risque de bugs en production.

## Décision

Nous appliquons une **configuration stricte de qualité de code** au même niveau que les projets frontend modernes :

### 1. Configuration TypeScript stricte

Activation de toutes les options de type-safety :

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

### 2. Élimination des `any` dans le code de production

- **0 `any`** toléré dans `src/` (code de production)
- `any` accepté uniquement dans `tests/` pour mocks/fixtures
- Usage de `unknown` pour types vraiment inconnus
- Documentation obligatoire avec `eslint-disable-next-line` si `any` nécessaire

### 3. Hooks Git automatisés (Husky)

**pre-commit** :

- ✅ `lint-staged` : Auto-fix Prettier + ESLint
- ✅ `tsc --noEmit` : Vérification compilation TypeScript

**pre-push** :

- ✅ `format:check` : Vérification formatage Prettier
- ✅ `lint` : Vérification ESLint (max 110 warnings)
- ✅ `knip` : Détection code mort
- ✅ `test:unit` : Lancement tests unitaires

**commit-msg** :

- ✅ `commitlint` : Validation conventional commits

### 4. Règles de codage

**Types de retour explicites :**

```typescript
async function handler(req, res): Promise<void> {
  // ...
}
```

**Early returns propres :**

```typescript
if (!data) {
  sendError(res, new Error('...'));
  return; // Explicite, pas return sendError(...)
}
```

**Paramètres non utilisés :**

```typescript
app.use((_req, res, next) => {
  /* ... */
});
```

## Alternatives considérées

### Alternative 1 : Configuration moins stricte

**Avantages** :

- Migration plus rapide
- Moins de refactoring nécessaire

**Inconvénients** :

- ❌ Maintenabilité réduite à long terme
- ❌ Risque de régression
- ❌ Dette technique accumulée

**Rejeté** : Non aligné avec les objectifs de qualité du projet.

### Alternative 2 : Migration progressive

**Avantages** :

- Moins disruptif
- Peut s'étaler sur plusieurs sprints

**Inconvénients** :

- ❌ Prend plus de temps
- ❌ Risque de zones du code non migrées
- ❌ Deux standards en parallèle temporairement

**Rejeté** : Préférence pour une migration complète immédiate.

## Conséquences

### Positives ✅

1. **Type-safety maximale** : Détection précoce des erreurs
2. **Code uniforme** : Formatage et style cohérents
3. **Qualité garantie** : Impossible de pousser du code non conforme
4. **Dette technique réduite** : 0 `any` dans production, 0 code mort
5. **Onboarding facilité** : Standards clairs et automatisés
6. **ISO frontend** : Même niveau de rigueur que les projets React/Vue

### Négatives ⚠️

1. **Temps initial** : ~4-6h pour migration complète
2. **Apprentissage** : Développeurs doivent s'adapter aux règles strictes
3. **Hooks plus lents** : pre-push prend 30-60s (tests + lint)
4. **Refactoring nécessaire** : Code existant a nécessité modifications

### Mitigations 🛡️

- Documentation complète créée (`docs/code-quality-standards.md`)
- Guides de bonnes pratiques intégrés
- Messages d'erreur clairs des hooks
- Possibilité de skip temporaire avec `--no-verify` en urgence

## Métriques

### Avant

| Métrique                    | Valeur  |
| --------------------------- | ------- |
| Warnings ESLint             | 96      |
| Warnings `any`              | 76      |
| `any` dans src/             | ~16     |
| Exports inutilisés          | Inconnu |
| Options TypeScript strictes | 3/7     |

### Après

| Métrique                    | Valeur     |
| --------------------------- | ---------- |
| Warnings ESLint             | 56 (-42%)  |
| Warnings `any`              | 36 (-53%)  |
| `any` dans src/             | **0** ✅   |
| Exports inutilisés          | **0** ✅   |
| Options TypeScript strictes | **7/7** ✅ |

### Après Phase 2 (Type Aliases Pattern - 2025-12-26)

Suite à l'implémentation du pattern type aliases (ADR-008), les métriques ont été encore améliorées :

| Métrique                         | Valeur   |
| -------------------------------- | -------- |
| Type assertions (`as`) dans src/ | **0** ✅ |
| Type aliases créés               | 6        |
| Pattern réutilisable documenté   | ✅       |

## Implémentation

### Phase 1 : Configuration stricte

- ✅ Ajout options TypeScript strictes
- ✅ Configuration hooks Git
- ✅ Documentation standards

### Phase 2 : Nettoyage code

- ✅ Élimination `any` dans src/
- ✅ Ajout types de retour explicites
- ✅ Correction early returns
- ✅ Suppression exports inutilisés

### Phase 3 : Documentation

- ✅ `docs/code-quality-standards.md`
- ✅ ADR-007
- ✅ Mise à jour README

## Validation

**Tests** :

- ✅ Tous les tests unitaires passent (53/53)
- ✅ Build production réussit
- ✅ Compilation TypeScript sans erreurs

**Hooks** :

- ✅ pre-commit fonctionne (lint-staged + tsc)
- ✅ pre-push fonctionne (format + lint + knip + tests)
- ✅ commit-msg valide conventional commits

**Métriques qualité** :

- ✅ 0 `any` dans src/
- ✅ 0 exports inutilisés
- ✅ ESLint sous le seuil (56/110)
- ✅ 0 type assertions dans src/

## Liens

- [Index des ADRs](./INDEX.md)
- [Documentation standards qualité](../technical/code-quality-standards.md)
- [ADR-008 - Type Aliases Pattern](./ADR-008-typescript-request-type-aliases.md)
- [Issue #52 - ESLint cleanup](https://github.com/SandrineCipolla/stockhub_back/issues/52)
- [Issue #54 - Typage any](https://github.com/SandrineCipolla/stockhub_back/issues/54) ✅ Complétée
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Notes

Cette décision s'inscrit dans la stratégie globale de **clean architecture** et **DDD** du projet (voir ADR-001). La qualité du code est un prérequis pour maintenir une architecture propre à long terme.

Les hooks Git peuvent être temporairement désactivés avec `git commit --no-verify` en cas d'urgence absolue, mais cela doit rester exceptionnel et documenté.

---

**Auteur** : Équipe technique
**Approuvé par** : Tech Lead
**Dernière révision** : 2025-12-26 (Phase 2 - Type Aliases)
