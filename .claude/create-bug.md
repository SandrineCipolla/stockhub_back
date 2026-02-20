# Créer une Issue GitHub — Bug Report

Crée une issue GitHub de type bug en respectant strictement le format du projet.

## Instructions

1. Demande-moi les informations manquantes si elles ne sont pas fournies :
   - **Description** : que se passe-t-il ?
   - **Étapes pour reproduire**
   - **Comportement attendu** vs **comportement actuel**
   - **Sévérité** : Bloquant / Majeur / Mineur / Cosmétique
   - **Module** : Frontend / Backend / Design System

2. Exécute :

```bash
gh issue create \
  --title "[BUG] [description courte du problème]" \
  --label "bug" \
  --body "## Description
[description du bug]

## Étapes pour reproduire
1. [étape 1]
2. [étape 2]
3. Observer...

## Comportement attendu
[ce qui devrait se passer]

## Comportement actuel
[ce qui se passe réellement]

## Sévérité
[Bloquant / Majeur / Mineur / Cosmétique]

## Contexte
[navigateur, OS, logs console si pertinent]"
```

## Règles

- ❌ Pas de solution technique dans le body (ça va dans la PR)
- ✅ Se concentrer sur les faits observables
- ✅ Les étapes de reproduction doivent être vérifiables
