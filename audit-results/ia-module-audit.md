# Rapport Audit Module IA — 2026-03-23

## item_history

- **Statut** : N'EXISTE PAS
- **Structure** : non trouvé — aucun modèle `item_history` / `ItemHistory` dans `prisma/schema.prisma`
- **Migration** : aucune migration mentionnant `item_history`, `OLD_QUANTITY`, `NEW_QUANTITY` ou `CHANGE_TYPE`
- **Modèles existants** : `Item`, `Stock`, `User`, `Family`, `FamilyMember`, `StockCollaborator`

## Services de prédiction

- **Statut** : N'EXISTE PAS
- **Fichiers trouvés** : aucun fichier contenant "prediction", "AIService", "LLM", "mistral", "openai", "CONSUMPTION", "RESTOCK", "daysUntilEmpty"
- **Note** : Les 3 fichiers remontés par la recherche "history" (`StockRoutesV2.ts`, `initializeApp.ts`, `stockRoutes.ts`) ne contiennent que des occurrences dans des noms de fonctions de routing (`configureStockRoutes`), sans lien avec le module IA
- **Niveau d'implémentation** : néant

## Routes API IA

- **Statut** : N'EXISTE PAS
- **Endpoints trouvés** : aucun endpoint lié à `predict`, `suggest`, `history` ou `/ai` dans les fichiers de routes
- **Routes existantes** : `GET/POST /stocks`, `GET /stocks/:id/items`, `POST/PATCH /stocks/:id/items/:itemId`

## Config IA (env vars)

- **Statut** : NON PRÉVUE
- **Variables trouvées** : aucune variable `OPENAI_*`, `MISTRAL_*`, `OPENROUTER_*`, `AI_*` dans `.env.example`
- **Variables existantes** : DB, Azure AD B2C, CORS, Application Insights, PORT, SEED

## Conclusion

### Ce qui est prêt

- Rien — le module IA est absent à 100% du codebase actuel

### Ce qui est à créer from scratch

- Modèle Prisma `ItemHistory` (champs : `id`, `itemId`, `oldQuantity`, `newQuantity`, `changeType`, `changedAt`, `changedBy`)
- Migration Prisma correspondante
- Hook Prisma ou logique dans les commandes pour alimenter `item_history` à chaque modification de quantité
- Service de prédiction (calcul `daysUntilEmpty`, taux de consommation, suggestion de réapprovisionnement)
- Intégration LLM optionnelle (Mistral / OpenAI) si suggestions textuelles souhaitées
- Routes API : `GET /stocks/:id/items/:itemId/history`, `GET /stocks/:id/items/:itemId/prediction`
- Variables d'environnement dans `.env.example` pour les clés API IA
- Tests unitaires et d'intégration pour les nouveaux services

### Ce qui est à compléter

- Rien à compléter — tout est à construire
