# Audit faisabilité — Module IA StockHub V2 Backend

## Contexte

Je veux implémenter un module IA composé de :

1. Prédictions déterministes (ItemHistory + StockPredictionService)
2. Assistant LLM avec function calling (Mistral via OpenRouter)
   → suggestions recettes/projets selon stocks disponibles
   → bibliothèque de projets sauvegardés avec étapes
   → suivi d'étapes avec mise à jour automatique des stocks
   → liste d'approvisionnement consolidée et partagée

## Tâche 1 — État du repo stockhub_back

### Schema Prisma

- Lire `prisma/schema.prisma` en entier
- Lister tous les modèles existants avec leurs champs
- Identifier ce qui manque pour le module IA :
  ItemHistory, Recipe, RecipeIngredient,
  SavedProject, ProjectStep, ProjectMaterial,
  ShoppingList, ShoppingListItem
- Y a-t-il déjà des relations entre Item/Stock
  qui facilitent l'ajout de ces modèles ?

### Migrations existantes

- Lister tous les fichiers dans `prisma/migrations/`
- Identifier la dernière migration appliquée
- Y a-t-il des migrations en attente (drift) ?

### Architecture src/

- Lire la structure complète de `src/`
- Identifier le pattern architectural utilisé :
  → CQRS ? commands/ queries/ ?
  → DDD ? domain/ application/ infrastructure/ ?
  → MVC classique ?
- Lister tous les fichiers de routes
- Lister tous les services/use cases existants
- Y a-t-il déjà un dossier domain/ai/ ou similar ?
- Y a-t-il des middlewares Prisma existants ?
- Y a-t-il un pattern de réponse API standardisé ?

### Dépendances

- Lire `package.json` complet
- Vérifier la présence de :
  → @mistralai/mistralai
  → openai (compatible OpenRouter)
  → @prisma/client version
  → framework de test (jest/vitest)
  → zod ou équivalent pour validation
- Identifier ce qu'il faudra installer

### Tests existants

- Lister les fichiers de tests dans src/
- Quel framework ? Jest ? Vitest ?
- Couverture actuelle si disponible
- Y a-t-il des tests d'intégration avec la BDD ?
- Pattern de mock utilisé ?

### Variables d'environnement

- Lire `.env.example`
- Lister toutes les variables existantes
- Identifier ce qui manque :
  OPENROUTER_API_KEY, AI_MODEL

### Configuration

- Y a-t-il un ConfigManager.ts ou équivalent ?
- Comment les variables d'env sont-elles gérées ?

## Tâche 2 — Issues et PRs GitHub en cours

### Issues ouvertes

Lister toutes les issues ouvertes du repo stockhub_back.
Pour chaque issue :

- Numéro et titre
- Labels
- Assignée ou non
- Fichiers potentiellement impactés

Si pas d'accès GitHub direct :

- Lire CHANGELOG.md, TODO.md, BACKLOG.md si existants
- Lire les branches Git locales : `git branch -a`
- Lire les derniers commits : `git log --oneline -20`

### PRs ouvertes

- Lister les PRs ouvertes si accessible
- Identifier celles qui modifient :
  → prisma/schema.prisma
  → src/domain/ ou src/routes/
  → fichiers de config

### Branches actives

- `git branch -a` pour voir toutes les branches
- Branches feature/ en cours qui pourraient conflicyter

## Tâche 3 — Estimation par brique

Pour chaque brique du module IA, estimer :

| Brique                                | Complexité | Dépend de         | Durée est. | Bloquant ? |
| ------------------------------------- | ---------- | ----------------- | ---------- | ---------- |
| Migration ItemHistory                 | ?          | schema actuel     | ?          | Oui        |
| Middleware Prisma (auto-feed history) | ?          | ItemHistory       | ?          | Oui        |
| StockPredictionService                | ?          | ItemHistory       | ?          | Oui        |
| Routes /prediction /history           | ?          | PredictionService | ?          | Non        |
| Package OpenRouter/Mistral            | ?          | rien              | ?          | Non        |
| ConfigManager étendu                  | ?          | .env              | ?          | Non        |
| AIService suggestions                 | ?          | OpenRouter        | ?          | Non        |
| Function calling tools                | ?          | AIService         | ?          | Non        |
| Migration Recipe + Ingredient         | ?          | schema actuel     | ?          | Non        |
| Migration SavedProject + Steps        | ?          | Recipe            | ?          | Non        |
| Migration ShoppingList + Items        | ?          | SavedProject      | ?          | Non        |
| Routes CRUD Recipe                    | ?          | migration         | ?          | Non        |
| Routes CRUD SavedProject              | ?          | migration         | ?          | Non        |
| Routes ShoppingList consolidée        | ?          | SavedProject      | ?          | Non        |
| Service consolidation (algo)          | ?          | ShoppingList      | ?          | Non        |
| Tests unitaires nouveaux services     | ?          | services          | ?          | Non        |

## Tâche 4 — Conflits et risques

- Y a-t-il des fichiers touchés par des issues
  en cours ET par le module IA ?
- Le pattern architectural actuel
  accueille-t-il facilement de nouveaux domaines ?
- Y a-t-il des risques de régression sur
  les routes existantes ?
- La BDD de staging est-elle accessible
  pour appliquer les migrations ?

## Tâche 5 — Recommandation finale

Produire un avis sur :

**Niveau 1 — Fondation (prédictions algo)**
ItemHistory + StockPredictionService + routes
→ Faisable en V2 ? Estimation ?

**Niveau 2 — LLM basique (suggestions)**
AIService + suggestions recettes/projets
→ Faisable en V2 ? Estimation ?

**Niveau 3 — Agent (function calling)**
Suivi d'étapes avec MAJ stocks auto
→ Faisable en V2 ou reporter en V3 ?

**Niveau 4 — Entités complètes**
Recipe, SavedProject, ShoppingList
→ Faisable en V2 ? Dans quel ordre ?

## Format du rapport

Produire `audit-results/ia-back-feasibility-audit.md` avec :

### Résumé exécutif (5 lignes max)

Go / No-go / Go partiel sur chaque niveau

### Architecture existante

Description du pattern trouvé et
comment le module IA s'y intègre

### Tableau d'estimation complet

### Issues en cours — risques de conflit

### Ordre d'implémentation recommandé

Séquence précise avec dépendances

### Ce qu'il faut installer

Liste des packages npm à ajouter
