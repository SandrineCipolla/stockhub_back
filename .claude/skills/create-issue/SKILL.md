---
name: create-issue
description: Crée une issue GitHub au format User Story du projet StockHub, pour une nouvelle fonctionnalité ou une amélioration. Se déclenche sur des demandes comme « crée une issue pour… », « nouvelle user story », « ajoute une issue GitHub ».
---

<!-- commun:debut skill-create-issue v1 -->
<!-- Bloc commun aux trois repos StockHub : le modifier à l'identique dans les trois, en incrémentant la version. Vérifié par check-docs. -->

# Créer une issue au format User Story

Les règles (labels, titre, format User Story, ce qui est interdit dans le body) sont dans la section « Gestion des issues GitHub » du `CONTRIBUTING.md` de ce repo. Les relire avant de rédiger, ne pas les improviser.

## Étapes

1. Demander les informations manquantes :
   - **Persona** : qui est l'utilisateur (ex : utilisateur connecté, admin famille)
   - **Action souhaitée** et **bénéfice attendu**
   - **Type** : `feature`, `improvement`, `tech` ou `documentation`
   - **Priorité** : `P0` à `P4`, selon les critères du CONTRIBUTING
2. Rédiger le body au format User Story du CONTRIBUTING, avec au plus 5 critères d'acceptation qui décrivent un comportement visible. Section **Contexte** facultative à la fin : le constat, sans solution technique.
3. Créer l'issue avec le label de scope de ce repo (voir plus bas) et l'ajouter au GitHub Project :

```bash
gh issue create \
  --title "[phrase courte orientée résultat, sans préfixe]" \
  --label "[scope],[type],[priorité]" \
  --project "StockHub V2" \
  --body "[body]"
```

4. Donner le lien de l'issue et rappeler de remplir les champs Module et Estimation sur le board.

## Règles

- Pas de détails d'implémentation, d'étapes techniques, de commandes ni de TODO dans le body : ça va dans la PR
- Titre compréhensible par une personne non technique, sans préfixe (`[US-XXX]`, `feat:`)
- Aucune mention d'outil ou d'IA dans le titre ou le body

<!-- commun:fin skill-create-issue -->

## Dans ce repo

- Label de scope : `back`
- Branche principale : `main`
