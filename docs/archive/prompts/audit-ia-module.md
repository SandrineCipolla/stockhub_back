# Audit : État réel du module IA / Prédictions

## Objectifs

1. Vérifier ce qui existe déjà en base et dans le code
2. Identifier les gaps par rapport au plan prévu
3. Produire un rapport d'état factuel

## Tâches à exécuter

### 1. Base de données — schema Prisma

- Lire `prisma/schema.prisma`
- Chercher : modèles `item_history`, `ItemHistory`, ou tout modèle
  contenant des champs `OLD_QUANTITY`, `NEW_QUANTITY`, `CHANGE_TYPE`
- Chercher dans `prisma/migrations/` :
  toute migration mentionnant `item_history`
- Rapport : la table existe-t-elle ? Quelle est sa structure exacte ?

### 2. Code métier — services existants

- Chercher dans `src/` (récursivement) :
  - Fichiers contenant "prediction", "Prediction", "history", "History"
  - Fichiers contenant "AIService", "LLM", "mistral", "openai"
  - Fichiers contenant "CONSUMPTION", "RESTOCK", "daysUntilEmpty"
- Pour chaque fichier trouvé : nom, chemin, état (stub/implémenté)

### 3. Routes API existantes

- Lire les fichiers de routes dans `src/`
- Chercher : routes contenant "predict", "suggest", "history", "ai"
- Rapport : endpoints existants liés à l'IA ou aux prédictions

### 4. Issues GitHub existantes (si accès)

- Si tu peux lire un fichier TODO ou BACKLOG local, le lire
- Sinon noter "accès GitHub requis manuellement"

### 5. Variables d'environnement

- Lire `.env.example` ou `README.md`
- Chercher : `OPENAI`, `MISTRAL`, `OPENROUTER`, `AI`
- Rapport : des clés API IA sont-elles déjà prévues ?

## Format du rapport à produire

Créer le fichier `audit-results/ia-module-audit.md` avec :

```
# Rapport Audit Module IA — [date]

## item_history
- Statut : [EXISTE / N'EXISTE PAS / PARTIEL]
- Structure : [champs trouvés ou "non trouvé"]
- Migration : [nom du fichier migration si trouvé]

## Services de prédiction
- Statut : [EXISTE / N'EXISTE PAS / PARTIEL]
- Fichiers trouvés : [liste]
- Niveau d'implémentation : [stub / partiel / complet]

## Routes API IA
- Statut : [EXISTE / N'EXISTE PAS]
- Endpoints trouvés : [liste]

## Config IA (env vars)
- Statut : [PRÉVUE / NON PRÉVUE]
- Variables trouvées : [liste]

## Conclusion
- Ce qui est prêt : [liste]
- Ce qui est à créer from scratch : [liste]
- Ce qui est à compléter : [liste]
```
