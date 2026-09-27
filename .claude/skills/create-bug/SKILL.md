---
name: create-bug
description: Crée une issue GitHub de bug au format du projet StockHub. Se déclenche sur des demandes comme « signale un bug », « crée un bug report », « il y a un problème avec… ».
---

<!-- commun:debut skill-create-bug v1 -->
<!-- Bloc commun aux trois repos StockHub : le modifier à l'identique dans les trois, en incrémentant la version. Vérifié par check-docs. -->

# Créer une issue de bug

Les règles de titre et de labels sont dans la section « Gestion des issues GitHub » du `CONTRIBUTING.md` de ce repo.

## Étapes

1. Demander les informations manquantes :
   - **Description** : ce qui se passe
   - **Étapes pour reproduire**
   - **Comportement attendu** et **comportement actuel**
   - **Priorité** : `P0` à `P4`, selon les critères du CONTRIBUTING
2. Créer l'issue avec le label de scope de ce repo (voir plus bas) et l'ajouter au GitHub Project :

```bash
gh issue create \
  --title "[problème observé en une phrase, sans préfixe]" \
  --label "[scope],bug,[priorité]" \
  --project "StockHub V2" \
  --body "## Description
[ce qui se passe]

## Étapes pour reproduire
1. [étape]
2. [étape]
3. Observer [résultat]

## Comportement attendu
[ce qui devrait se passer]

## Comportement actuel
[ce qui se passe réellement]

## Contexte
[environnement, navigateur, logs si pertinent]"
```

3. Donner le lien de l'issue.

## Règles

- Des faits observables et des étapes vérifiables, pas de solution technique : elle va dans la PR
- Titre sans préfixe (`[BUG]`) : le type passe par le label
- Aucune mention d'outil ou d'IA dans le titre ou le body

<!-- commun:fin skill-create-bug -->

## Dans ce repo

- Label de scope : `back`
- Branche principale : `main`
