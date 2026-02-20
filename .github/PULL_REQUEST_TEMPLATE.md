<!--
⚠️ IMPORTANT: Le titre de cette PR doit suivre le format Conventional Commits
Exemples:
  ✅ feat: add user authentication
  ✅ fix: resolve stock calculation bug
  ✅ docs: update API documentation
  ✅ refactor: improve error handling
  ❌ feat/issue-123 add feature

Types valides: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
Optionnel: feat(scope): description
-->

## 🔗 Issue liée

Closes #[numéro]

## 📋 Description

<!-- Contexte et résumé des changements apportés -->

## 🔧 Détails d'implémentation

<!-- Couches DDD impactées (domain / infrastructure / api), choix techniques, ADR lié si applicable -->

## 🧪 Type de changement

- [ ] ✨ Nouvelle fonctionnalité (feat)
- [ ] 🐛 Correction de bug (fix)
- [ ] ♻️ Refactoring
- [ ] 📚 Documentation
- [ ] 🧪 Tests
- [ ] ⚙️ CI/CD / Config (chore, ci, build)

## ✅ Checklist

### Tests

- [ ] Tests unitaires passent (`npm run test:unit`)
- [ ] Tests d'intégration passent (`npm run test:integration`)
- [ ] Build réussit (`npm run build`)

### Qualité

- [ ] Titre PR suit le format Conventional Commits
- [ ] ESLint 0 warnings (`npm run lint`)
- [ ] TypeScript 0 erreurs — pas de `as` non justifié
- [ ] Pas de `console.*` — logging structuré utilisé
- [ ] Pas de secrets exposés dans le code

### Documentation

- [ ] OpenAPI mis à jour si nouvel endpoint (`docs/openapi.yaml`)
- [ ] ADR créé si décision architecturale importante (`docs/adr/`)
- [ ] GitHub Project mis à jour

## ❓ Points à surveiller / Questions

<!-- Points à valider ou questions pour le reviewer -->
