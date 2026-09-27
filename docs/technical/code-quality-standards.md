# Standards de qualité de code - StockHub Backend

## 📋 Vue d'ensemble

Ce document décrit les standards de qualité de code appliqués au projet backend StockHub, garantissant un code maintenable, type-safe et de haute qualité.

## 🔒 Configuration TypeScript (tsconfig.json)

### Mode strict activé

```json
{
  "compilerOptions": {
    "strict": true, // Active tous les checks stricts
    "strictNullChecks": true, // Pas de null/undefined implicites
    "noImplicitAny": true, // Interdit les any implicites
    "noUnusedLocals": true, // Détecte variables locales non utilisées
    "noUnusedParameters": true, // Détecte paramètres non utilisés
    "noImplicitReturns": true, // Tous les chemins doivent retourner une valeur
    "noFallthroughCasesInSwitch": true, // Interdit les fallthrough dans switch
    "forceConsistentCasingInFileNames": true
  }
}
```

### Bonnes pratiques

- ✅ **Typage explicite** : Pas de `any` dans le code de production (src/)
- ✅ **Types de retour** : Fonctions async doivent déclarer `Promise<void>` ou `Promise<T>`
- ✅ **Early returns** : Utiliser `return;` explicitement, pas `return sendError(...)`
- ✅ **Paramètres non utilisés** : Préfixer avec `_` (ex: `_req`, `_res`, `_next`)

## 🎨 Configuration ESLint

### Règles principales

```javascript
{
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',         // Limite usage de any
    '@typescript-eslint/no-unused-vars': 'warn',          // Détecte variables inutilisées
    '@typescript-eslint/no-non-null-assertion': 'warn',   // Limite usage de !
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }]
  }
}
```

### Seuils de qualité

- Maximum **110 warnings** ESLint autorisés
- **0 warnings** dans `src/` (code de production)
- Warnings dans `tests/` sont acceptables (mocks, fixtures)

## 🪝 Hooks Git automatiques (Husky)

### pre-commit (à chaque commit)

Vérifie et corrige automatiquement :

```bash
npx lint-staged    # Auto-fix Prettier + ESLint sur fichiers staged
npx tsc --noEmit   # Vérifie compilation TypeScript (pas de build)
```

**Configuration lint-staged :**

```json
{
  "*.{ts,js}": ["prettier --write", "eslint --fix"],
  "*.{json,md}": ["prettier --write"]
}
```

### pre-push (avant chaque push)

Vérifie la qualité complète :

```bash
npm run format:check  # Vérifie formatage Prettier (sans modifier)
npm run lint          # Vérifie ESLint (max 110 warnings)
npx knip              # Détecte exports/imports inutilisés
npm run test:unit     # Lance tests unitaires Jest
```

**Temps estimé :** ~30-60 secondes

### commit-msg (validation message)

Force les conventional commits :

```bash
npx commitlint        # Valide format du message
```

**Formats acceptés :**

- `feat: nouvelle fonctionnalité`
- `fix: correction de bug`
- `refactor: refactorisation`
- `test: ajout/modification tests`
- `docs: documentation`
- `chore: tâches diverses`
- `ci: intégration continue`
- `perf: optimisation performances`

## 📊 Métriques de qualité actuelles

| Métrique                 | Objectif     | État actuel |
| ------------------------ | ------------ | ----------- |
| Warnings ESLint          | ≤ 110        | ✅ 55       |
| Warnings `any` dans src/ | 0            | ✅ 0        |
| Exports inutilisés       | 0            | ✅ 0        |
| Tests unitaires          | Tous passent | ✅ 53/53    |
| Coverage minimum         | 80%          | 🔄 En cours |
| TypeScript errors        | 0            | ✅ 0        |

## 🚀 Scripts npm disponibles

### Qualité de code

```bash
npm run lint              # Vérifie ESLint
npm run lint:fix          # Corrige automatiquement ESLint
npm run format            # Formate avec Prettier
npm run format:check      # Vérifie formatage Prettier
npm run knip              # Détecte code mort
```

### Tests

```bash
npm run test              # Tous les tests
npm run test:unit         # Tests unitaires uniquement
npm run test:integration  # Tests d'intégration
npm run test:e2e          # Tests end-to-end (Playwright)
npm run test:coverage     # Tests avec coverage
```

### Build & Dev

```bash
npm run start:dev         # Développement avec nodemon
npm run build             # Build production (webpack)
npm run build:local       # Build local (tsc + tsc-alias)
```

## 📝 Guide de contribution

### Avant de commiter

1. **Vérifier que le code compile** : `npx tsc --noEmit`
2. **Vérifier ESLint** : `npm run lint`
3. **Formater le code** : `npm run format`
4. **Lancer les tests** : `npm run test:unit`

### Les hooks font automatiquement

- ✅ Formatage Prettier sur fichiers modifiés
- ✅ Fix ESLint automatique quand possible
- ✅ Vérification compilation TypeScript
- ✅ Validation format du message de commit

### Si un hook échoue

**pre-commit :**

- TypeScript errors → Corriger les erreurs de types
- Prettier → Laisser faire, il corrige automatiquement
- ESLint → Corriger les erreurs qui ne peuvent pas être auto-fix

**pre-push :**

- `format:check` → Lancer `npm run format`
- `lint` → Corriger warnings ou augmenter seuil temporairement
- `knip` → Supprimer exports/imports inutilisés
- `test:unit` → Corriger tests qui échouent

**commit-msg :**

- Message non conforme → Utiliser format conventional commit

## 🎯 Règles spécifiques au projet

### Types any

- ❌ **Interdit** dans `src/` (code de production)
- ⚠️ **Toléré** dans `tests/` pour mocks/fixtures
- ✅ **Documenté** si absolument nécessaire avec `// eslint-disable-next-line`

Exemple acceptable :

```typescript
// Express body/params are dynamic by design
// eslint-disable-next-line @typescript-eslint/no-explicit-any
body: any;
```

### Gestion des erreurs

Utiliser `unknown` dans les catch blocks :

```typescript
try {
  // code
} catch (err: unknown) {
  if (err instanceof Error) {
    rootException(err);
  }
  sendError(res, err as CustomError);
}
```

### Types de retour Express

Toujours déclarer `Promise<void>` pour les route handlers :

```typescript
router.post('/users', async (req, res): Promise<void> => {
  // ...
});
```

### Early returns

Ne pas retourner la valeur de `sendError` :

```typescript
// ❌ Incorrect
if (!data) {
  return sendError(res, new Error('...'));
}

// ✅ Correct
if (!data) {
  sendError(res, new Error('...'));
  return;
}
```

## 📚 Références

- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [ESLint TypeScript Plugin](https://typescript-eslint.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Git Hooks](https://typicode.github.io/husky/)
- [Prettier Code Formatter](https://prettier.io/)

## 🔄 Historique

| Date       | Version | Changements                                                       |
| ---------- | ------- | ----------------------------------------------------------------- |
| 2024-12-19 | 1.0     | Configuration initiale - Standards stricts TypeScript + Hooks Git |

---

**Maintenu par :** Équipe StockHub
