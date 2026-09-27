---
name: create-pr
description: Crée une pull request GitHub au format du projet StockHub, liée à une issue. Se déclenche sur des demandes comme « crée une PR », « ouvre une pull request ».
---

<!-- commun:debut skill-create-pr v1 -->
<!-- Bloc commun aux trois repos StockHub : le modifier à l'identique dans les trois, en incrémentant la version. Vérifié par check-docs. -->

# Créer une pull request

Les règles de titre et de body sont dans la section « Pull requests » du `CONTRIBUTING.md` de ce repo. La structure du body est celle du template de PR du repo (`.github/pull_request_template.md` ou `.github/PULL_REQUEST_TEMPLATE.md`) : le lire, ne pas en recopier une version de mémoire.

## Étapes

1. Récupérer le contexte, avec la branche principale de ce repo (voir plus bas) :

```bash
git branch --show-current
git log <branche-principale>..HEAD --oneline
git diff <branche-principale> --name-only
```

2. Demander le numéro de l'issue liée s'il ne se déduit pas du nom de la branche (`type/numero-description`).
3. Remplir le template de PR : sections sans objet supprimées, cases cochées seulement pour ce qui a réellement été vérifié.
4. Créer la PR :

```bash
gh pr create \
  --title "type(scope): #numero description" \
  --body "[template rempli]" \
  --assignee "@me"
```

## Règles

- Toujours lier l'issue avec `Closes #numero`
- Les détails techniques vont dans la PR, pas dans l'issue
- Ne pas écrire « Sans objet » : supprimer la section
- Aucune mention d'outil ou d'IA (signature, lien de session, « Generated with ») dans le titre ou le body

<!-- commun:fin skill-create-pr -->

## Dans ce repo

- Label de scope : `back`
- Branche principale : `main`
