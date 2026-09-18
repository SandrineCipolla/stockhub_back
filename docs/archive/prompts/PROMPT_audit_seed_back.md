# Audit Seed — `stockhub_back`

## Contexte

Je prépare un **seed de démonstration** pour StockHub V2 : un script Prisma qui peuple la base de données staging avec des données réalistes, afin que les démos jury et encadrante arrivent sur un dashboard vivant plutôt qu'une app vide.

Avant toute implémentation, j'ai besoin d'un audit complet de l'existant.

## Ce que tu dois faire

**Ne pas écrire de code pour l'instant.** L'objectif de cette session est uniquement d'inventorier et de rendre compte.

### 1. Audit Prisma

- Lire `prisma/schema.prisma` en entier
- Lister tous les modèles avec leurs champs exacts (noms, types, champs obligatoires, valeurs par défaut, relations)
- Identifier les champs qui ont des contraintes particulières (unique, enum, foreign key…)
- Vérifier si `prisma/seed.ts` ou un dossier `prisma/seed/` existe déjà

### 2. Audit données de test existantes

- Chercher dans tout le repo : fichiers `*.factory.ts`, `*.fixture.ts`, `*.mock.ts`, `*.seed.ts`
- Chercher dans les dossiers `tests/`, `__tests__/`, `src/tests/`, `test/`
- Y a-t-il déjà des helpers qui créent des objets Prisma pour les tests ?
- Y a-t-il un pattern de création de données déjà établi dans le projet ?

### 3. Audit `package.json`

- La clé `"prisma": { "seed": ... }` est-elle déjà configurée ?
- Y a-t-il des scripts liés au seed ou aux données de démo (`seed`, `db:seed`, `demo`…) ?
- Quelle version de `ts-node` ou `tsx` est disponible pour exécuter le seed ?

### 4. Audit authentification

- Comment l'utilisateur est-il identifié dans la DB ? (champ `azureId` ? `email` ? autre ?)
- Le modèle `User` dans Prisma — quels champs sont obligatoires à la création ?
- Y a-t-il une logique de création d'utilisateur à la première connexion Azure B2C ?

## Livrable attendu

Un rapport structuré avec :

- Le schéma Prisma résumé (modèles + champs clés)
- Ce qui existe déjà côté seed/fixtures/factories
- Ce qui manque et devra être créé
- Les contraintes techniques à respecter pour le seed (champs obligatoires, unicité, ordre de création dû aux relations)
- Une recommandation sur l'approche (créer `prisma/seed.ts` from scratch, ou étendre quelque chose d'existant ?)

**Ne pas implémenter avant validation du rapport.**
