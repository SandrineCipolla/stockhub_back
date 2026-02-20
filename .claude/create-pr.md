# Créer une Pull Request

Crée une PR GitHub en respectant le format du projet StockHub V2.

## Instructions

1. Récupère les informations nécessaires :

```bash
# Branche courante
git branch --show-current

# Commits depuis main
git log main..HEAD --oneline

# Fichiers modifiés
git diff main --name-only
```

2. Demande-moi si nécessaire :
   - **Numéro de l'issue** liée (obligatoire)
   - **Type** : feature / bug / refactor / docs / config
   - Y a-t-il des changements UI ? (pour les screenshots)

3. Crée la PR :

```bash
gh pr create \
  --title "[type]: [description courte]" \
  --body "## 🔗 Issue liée
Closes #[numéro]

## 📋 Description
[Ce que fait cette PR en 2-3 lignes]

## 🔧 Détails d'implémentation
[Composants modifiés, choix techniques, compromis éventuels]
[Déduit automatiquement des fichiers modifiés et des commits]

## ✅ Checklist
- [ ] \`npm run ci:check\` passant
- [ ] Couverture de tests maintenue
- [ ] Accessibilité vérifiée si changement UI
- [ ] GitHub Project mis à jour

## 📸 Screenshots
[Ajouter si changement UI]" \
  --assignee "@me"
```

## Règles

- ✅ Toujours lier à une issue avec `Closes #`
- ✅ Le titre suit les Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.)
- ✅ Les détails techniques vont ici, PAS dans l'issue
- ❌ Ne pas merger sans que la checklist soit complète
