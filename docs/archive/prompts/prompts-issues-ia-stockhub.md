# Prompts Claude Code — Issues GitHub Module IA StockHub V2

> Généré le 30 mars 2026  
> Ordre d'exécution : études d'abord, features ensuite  
> Ne pas recréer : #118, #119 (front) et #124 (back) — existent déjà

---

## PRÉAMBULE — Label `ai`

```bash
gh label create "ai" \
  --repo SandrineCipolla/stockhub_back \
  --color "7c3aed" \
  --description "Intelligence artificielle, LLM, prédictions"

gh label create "ai" \
  --repo SandrineCipolla/stockHub_V2_front \
  --color "7c3aed" \
  --description "Intelligence artificielle, LLM, prédictions"
```

> Si le label existe déjà, ignorer l'erreur et continuer.

---

## PARTIE 1 — ÉTUDES (à créer en premier)

---

### ÉTUDE 1 — Choix du modèle LLM via OpenRouter

```bash
gh issue create \
  --repo SandrineCipolla/stockhub_back \
  --title "study: évaluation et choix du modèle LLM via OpenRouter pour StockHub" \
  --label "ai,documentation" \
  --body "## Contexte
Le choix d'OpenRouter comme gateway LLM est acté (ADR-013).
La question ouverte est : quel modèle utiliser derrière ?
Ce choix impacte la qualité des suggestions, la latence,
le coût et la conformité RGPD.

## Objectif
Tester plusieurs modèles sur des cas réels StockHub
et documenter le choix final dans ADR-015.

## Candidats à tester

| Modèle | Avantage | Coût |
|--------|----------|------|
| \`mistralai/mistral-small-3.1\` | Entreprise française, RGPD, function calling natif | Faible |
| \`meta-llama/llama-3.3-70b-instruct\` | Gratuit via OpenRouter (rate-limité) | Gratuit |
| \`anthropic/claude-haiku-4-5\` | Très rapide, excellent JSON structuré | Faible |
| \`google/gemini-flash-1.5\` | Multimodal, bon marché | Très faible |

## Méthode
1. Créer \`scripts/spike-model-comparison.ts\` (standalone)
2. Envoyer le même prompt à chaque modèle via OpenRouter
3. Tester sur 3 scénarios :
   - Stocks alimentaires → suggestions recettes
   - Stocks artistiques → suggestions projets créatifs
   - Stocks bricolage → suggestions projets DIY
4. Mesurer et comparer

## Critères d'évaluation

| Critère | Poids |
|---------|-------|
| Qualité et cohérence des suggestions | Élevé |
| Respect du format JSON demandé | Élevé |
| Latence moyenne | Moyen |
| Coût estimé pour ~100 appels/mois | Moyen |
| Hébergement EU / RGPD | Moyen |
| Support function calling natif | Faible |

## Critères d'acceptation
- [ ] Script \`scripts/spike-model-comparison.ts\` créé et exécuté
- [ ] 4 modèles testés sur les 3 scénarios
- [ ] Tableau comparatif complété avec résultats réels
- [ ] Modèle sélectionné avec justification écrite
- [ ] ADR-015 rédigé dans \`docs/adr/\`
- [ ] Variable \`AI_MODEL\` documentée dans \`.env.example\`
  avec le modèle retenu comme valeur par défaut

## Note
OpenRouter étant provider-agnostic, changer de modèle
ultérieurement = modifier uniquement \`AI_MODEL\` dans .env.
Aucun changement de code nécessaire.

## Débloque
- feat: AIService — suggestions LLM via OpenRouter (#124)

## Référence RNCP
CE2.5.4 — choix technologiques présentés de façon claire et argumentée"
```

---

### ÉTUDE 2 — Prompt engineering suggestions

```bash
gh issue create \
  --repo SandrineCipolla/stockhub_back \
  --title "study: conception et test des prompts système pour suggestions IA" \
  --label "ai,documentation" \
  --body "## Contexte
Le AIService doit envoyer des prompts adaptés selon la catégorie
du stock (FOOD, ART_SUPPLIES, DIY). La qualité des suggestions
dépend directement de la qualité des prompts système.

## Objectif
Concevoir, tester et valider les prompts système pour chaque
catégorie, avant de les versionner dans le code.

## Scénarios à tester

### FOOD
Prompt : assistant culinaire, stocks en contexte,
réponse JSON avec recettes + ingrédients + ingrédients manquants.
Test : 5 combinaisons de stocks alimentaires différentes.

### ART_SUPPLIES
Prompt : assistant créatif, matériel en contexte,
réponse JSON avec projets + matériel nécessaire + manquant.
Test : 5 combinaisons de matériel artistique.

### DIY
Prompt : assistant bricolage, matériel/outils en contexte,
réponse JSON avec projets + matériel + manquant.
Test : 5 combinaisons outils/matériaux.

## Format JSON cible à valider
\`\`\`typescript
interface SuggestionResponse {
  suggestions: {
    name: string
    duration: number        // minutes
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    description: string
    requiredItems: {
      name: string
      quantity: number
      unit: string
      availableInStock: boolean
      availableQuantity?: number
    }[]
    missingItems: {
      name: string
      quantity: number
      unit: string
    }[]
    tutorialSteps: string[]  // 4-6 étapes résumées
  }[]
}
\`\`\`

## Critères d'acceptation
- [ ] Script \`scripts/spike-prompt-engineering.ts\` créé
- [ ] 15 scénarios testés (5 par catégorie)
- [ ] Prompts validés : JSON cohérent sur 90%+ des appels
- [ ] Prompts versionnés dans \`src/domain/ai/prompts/\` :
  - \`foodSuggestions.ts\`
  - \`artSuggestions.ts\`
  - \`diySuggestions.ts\`
- [ ] Note technique dans \`docs/\` sur les résultats observés

## Débloque
- feat: AIService — suggestions LLM via OpenRouter (#124)

## Référence RNCP
CE2.5.3 — analyse prédictive innovante
CE2.5.4 — choix technologiques argumentés"
```

---

### ÉTUDE 3 — Modélisation données N4

```bash
gh issue create \
  --repo SandrineCipolla/stockhub_back \
  --title "study: modélisation données Recipe / SavedProject / ShoppingList" \
  --label "ai,documentation,backend" \
  --body "## Contexte
Le module IA N4 introduit 3 nouvelles entités majeures :
- Recipe / RecipeIngredient (recettes et projets sauvegardés)
- SavedProject / ProjectStep / ProjectMaterial (suivi de projets)
- ShoppingList / ShoppingListItem (liste d'approvisionnement)

Avant de créer les migrations, valider le schéma sur des cas réels.

## Objectif
Modéliser, discuter et valider le schéma Prisma complet
pour les entités N4, en identifiant les edge cases.

## Questions à trancher

### Recettes / Projets
- Une recette/projet est-il lié à un stock ou global ?
- Comment gérer les portions (2 pers → 4 pers) ?
- Les ingrédients/matériaux sont-ils normalisés ou libres (string) ?
- Une suggestion LLM peut-elle être éditée par l'utilisateur ?
- Statut SavedProject : TODO / IN_PROGRESS / DONE suffit ?
- Le suivi de consommation réelle par étape est-il V2 ou V3 ?

### ShoppingList
- Une liste est-elle liée à 1 projet ou N projets ?
- La consolidation (plusieurs recettes → 1 liste)
  se fait côté backend ou frontend ?
- Les items ont-ils une notion de rayon/catégorie ?

## Schéma Prisma proposé à valider

\`\`\`prisma
model Recipe {
  id          Int      @id @default(autoincrement())
  name        String
  duration    Int
  difficulty  String   // EASY | MEDIUM | HARD
  category    String   // FOOD | ART_SUPPLIES | DIY
  source      String   // llm_generated | user_created
  stockId     Int
  createdBy   String
  createdAt   DateTime @default(now())
  ingredients RecipeIngredient[]
  stock       Stock    @relation(fields: [stockId], references: [id])
}

model RecipeIngredient {
  id        Int    @id @default(autoincrement())
  recipeId  Int
  name      String
  quantity  Float
  unit      String
  recipe    Recipe @relation(fields: [recipeId], references: [id])
}

model SavedProject {
  id          Int      @id @default(autoincrement())
  stockId     Int
  name        String
  category    String
  difficulty  String
  duration    Int
  source      String
  status      String   // TODO | IN_PROGRESS | DONE
  notes       String?
  createdAt   DateTime @default(now())
  startedAt   DateTime?
  completedAt DateTime?
  steps       ProjectStep[]
  materials   ProjectMaterial[]
  stock       Stock @relation(fields: [stockId], references: [id])
}

model ProjectStep {
  id          Int      @id @default(autoincrement())
  projectId   Int
  order       Int
  description String
  completed   Boolean  @default(false)
  completedAt DateTime?
  project     SavedProject @relation(fields: [projectId], references: [id])
}

model ProjectMaterial {
  id        Int    @id @default(autoincrement())
  projectId Int
  name      String
  quantity  Float
  unit      String
  project   SavedProject @relation(fields: [projectId], references: [id])
}

model ShoppingList {
  id        Int      @id @default(autoincrement())
  stockId   Int
  name      String
  createdAt DateTime @default(now())
  items     ShoppingListItem[]
  stock     Stock @relation(fields: [stockId], references: [id])
}

model ShoppingListItem {
  id             Int     @id @default(autoincrement())
  shoppingListId Int
  name           String
  quantity       Float
  unit           String
  checked        Boolean @default(false)
  fromProjectId  Int?
  shoppingList   ShoppingList @relation(fields: [shoppingListId], references: [id])
}
\`\`\`

## Critères d'acceptation
- [ ] Toutes les questions ci-dessus tranchées
- [ ] Schéma Prisma final validé et annoté
- [ ] Edge cases identifiés et documentés
- [ ] Note de design créée dans \`docs/design/ia-data-model.md\`

## Débloque
- feat: migrations Recipe + RecipeIngredient
- feat: migrations SavedProject + ProjectStep + ProjectMaterial
- feat: migrations ShoppingList + ShoppingListItem

## Référence RNCP
CE2.5.2 — stockage de données structurées
CE2.4.4 — configuration BDD répondant aux contraintes"
```

---

### ÉTUDE 4 — Function calling vs JSON mode

```bash
gh issue create \
  --repo SandrineCipolla/stockhub_back \
  --title "study: évaluation function calling vs JSON mode pour AIService" \
  --label "ai,documentation" \
  --body "## Contexte
Le AIService doit retourner des données structurées (JSON)
pour les suggestions et le diff stocks/besoins.
Deux approches principales sont possibles.

## Objectif
Comparer les approches sur des cas concrets et choisir
celle qui offre le meilleur compromis fiabilité / complexité
/ compatibilité OpenRouter.

## Approches à comparer

### Approche A — Function calling natif Mistral
Le modèle appelle une fonction définie avec son schéma.
- ✅ Structuré par design, typé, prévisible
- ❌ Support variable selon les providers via OpenRouter
- ❌ Plus complexe à implémenter et mocker

### Approche B — JSON mode + validation Zod
Le prompt demande une réponse JSON,
Zod valide et parse la réponse.
- ✅ Simple, compatible tous providers
- ✅ Facile à tester et mocker
- ❌ Hallucinations JSON possibles → nécessite retry logic

### Approche C — Prompt pur + parsing manuel
Réponse texte parsée manuellement.
- ✅ Ultra simple
- ❌ Fragile, non typé, risqué en prod

## Tests à réaliser
1. Implémenter les 3 approches sur le même scénario :
   suggestions recettes pour stocks alimentaires donnés
2. Mesurer sur 20 appels par approche :
   - Taux de succès JSON valide
   - Latence moyenne
   - Complexité du code

## Critères d'acceptation
- [ ] Script \`scripts/spike-function-calling.ts\` créé
- [ ] 3 approches testées sur 20 appels chacune
- [ ] Tableau comparatif complété
- [ ] Approche choisie documentée avec justification
- [ ] ADR-016 rédigé dans \`docs/adr/\`
- [ ] Si Zod retenu : ajouté dans \`package.json\`

## Débloque
- feat: AIService suggestions LLM (#124)
- feat: AIService diff stocks/besoins

## Référence RNCP
CE2.5.4 — choix technologiques argumentés et documentés"
```

---

### ÉTUDE 5 — Spike Ollama local

```bash
gh issue create \
  --repo SandrineCipolla/stockhub_back \
  --title "spike: exploration Ollama + Mistral 7B local — évaluation faisabilité prod" \
  --label "ai,documentation" \
  --body "## Contexte
Dans le cadre du critère C2.5, explorer la faisabilité
d'un modèle IA local (Ollama + Mistral 7B) comme alternative
aux APIs cloud pour les suggestions de stocks.

## Objectif
Explorer, mesurer, documenter — pas livrer en prod.
Produire un ADR justifiant le choix final (OpenRouter retenu).

## Étapes

### Installation et prise en main
- [ ] Ollama installé localement (ollama.com)
- [ ] Modèle \`mistral\` téléchargé (\`ollama pull mistral\`)
- [ ] Test interactif : scénarios stocks en langage naturel

### Script Node.js standalone
- [ ] Fichier \`scripts/spike-ollama.ts\` créé
- [ ] Appel \`http://localhost:11434/api/chat\` depuis Node.js
- [ ] Prompt système StockHub basique testé
- [ ] Résultats consignés : qualité, latence, format JSON

### Données synthétiques
- [ ] Script \`scripts/generateSyntheticData.ts\` créé
- [ ] Génère 90j d'historique réaliste pour 5 items types
  (farine, lait, pâtes, huile, café) avec variation gaussienne
- [ ] Export JSON utilisable comme contexte LLM

### Documentation
- [ ] ADR-013 rédigé dans \`docs/adr/\` :
  - Avantages constatés (confidentialité, coût zéro)
  - Blocages prod identifiés (GPU, infrastructure, latence)
  - Décision : écarté V2, horizon V3
  - Comparatif Ollama local vs OpenRouter cloud

## Critères d'acceptation
- [ ] Scripts créés dans \`scripts/\`
- [ ] ADR-013 rédigé et versionné
- [ ] Conclusions documentées avec mesures réelles

## Ne débloque pas de feature directement
Livrable documentaire pour jury RNCP C2.5

## Référence RNCP
CE2.5.4 — exploration technologique documentée
et arbitrage argumenté"
```

---

## PARTIE 2 — FEATURES N4 (après études 2, 3 et 4)

---

### FEATURE N4-1 — Migration Recipe + RecipeIngredient (back)

```bash
gh issue create \
  --repo SandrineCipolla/stockhub_back \
  --title "feat: migration et modèle Prisma Recipe + RecipeIngredient" \
  --label "ai,backend" \
  --body "## Contexte
Première migration du module N4.
Introduit les entités Recipe et RecipeIngredient
pour stocker les recettes/projets suggérés par le LLM
ou créés manuellement par l'utilisateur.

## Dépend de
- study: modélisation données N4 (schéma validé)

## Fichiers à créer / modifier
- \`prisma/schema.prisma\` : ajouter modèles Recipe, RecipeIngredient
- \`prisma/migrations/\` : nouvelle migration générée
- Relation à ajouter sur le modèle \`Stock\` existant

## Critères d'acceptation
- [ ] Modèle \`Recipe\` ajouté au schema Prisma
  (id, name, duration, difficulty, category,
   source, stockId, createdBy, createdAt)
- [ ] Modèle \`RecipeIngredient\` ajouté
  (id, recipeId, name, quantity, unit)
- [ ] Relation \`recipes Recipe[]\` ajoutée sur \`Stock\`
- [ ] Migration générée : \`prisma migrate dev\`
- [ ] Migration appliquée en staging sans erreur
- [ ] \`prisma generate\` sans erreur

## Pattern à suivre
Même pattern que la migration \`ItemHistory\`
introduite dans PR #134.

## Référence RNCP
CE2.5.2 — stockage de données structurées"
```

---

### FEATURE N4-2 — Migration SavedProject (back)

```bash
gh issue create \
  --repo SandrineCipolla/stockhub_back \
  --title "feat: migration et modèle Prisma SavedProject + ProjectStep + ProjectMaterial" \
  --label "ai,backend" \
  --body "## Contexte
Deuxième migration du module N4.
Introduit les entités SavedProject, ProjectStep et ProjectMaterial
pour la bibliothèque de projets sauvegardés avec suivi d'étapes.

## Dépend de
- study: modélisation données N4 (schéma validé)
- feat: migration Recipe (#N4-1 — peut aller en parallèle)

## Fichiers à créer / modifier
- \`prisma/schema.prisma\` : ajouter SavedProject, ProjectStep,
  ProjectMaterial
- \`prisma/migrations/\` : nouvelle migration

## Critères d'acceptation
- [ ] Modèle \`SavedProject\` ajouté
  (id, stockId, name, category, difficulty, duration,
   source, status, notes?, createdAt, startedAt?, completedAt?)
- [ ] Modèle \`ProjectStep\` ajouté
  (id, projectId, order, description, completed, completedAt?)
- [ ] Modèle \`ProjectMaterial\` ajouté
  (id, projectId, name, quantity, unit)
- [ ] Enum ou constantes pour status : TODO | IN_PROGRESS | DONE
- [ ] Relations correctes entre les 3 modèles
- [ ] Migration appliquée en staging sans erreur

## Référence RNCP
CE2.5.2 — stockage de données structurées"
```

---

### FEATURE N4-3 — Migration ShoppingList (back)

```bash
gh issue create \
  --repo SandrineCipolla/stockhub_back \
  --title "feat: migration et modèle Prisma ShoppingList + ShoppingListItem" \
  --label "ai,backend" \
  --body "## Contexte
Troisième migration du module N4.
Introduit la liste d'approvisionnement consolidée,
générée depuis un ou plusieurs projets/recettes.

## Dépend de
- study: modélisation données N4 (schéma validé)
- feat: migration SavedProject (#N4-2)

## Fichiers à créer / modifier
- \`prisma/schema.prisma\` : ajouter ShoppingList, ShoppingListItem
- \`prisma/migrations/\` : nouvelle migration

## Critères d'acceptation
- [ ] Modèle \`ShoppingList\` ajouté
  (id, stockId, name, createdAt)
- [ ] Modèle \`ShoppingListItem\` ajouté
  (id, shoppingListId, name, quantity, unit,
   checked, fromProjectId?)
- [ ] Relation \`shoppingLists ShoppingList[]\` sur \`Stock\`
- [ ] Migration appliquée en staging sans erreur

## Référence RNCP
CE2.5.2 — stockage de données structurées"
```

---

### FEATURE N4-4 — CRUD Recipe backend

```bash
gh issue create \
  --repo SandrineCipolla/stockhub_back \
  --title "feat: CRUD Recipe — domain + infrastructure + api (DDD/CQRS)" \
  --label "ai,backend" \
  --body "## Contexte
Implémentation complète du CRUD Recipe
en respectant l'architecture DDD/CQRS existante.

## Dépend de
- feat: migration Recipe (#N4-1)
- study: function calling vs JSON mode (pour le service LLM)

## Architecture à respecter
Pattern identique à \`stock-management/\` :

\`\`\`
domain/recipe/
  entities/Recipe.ts
  repositories/IRecipeRepository.ts
  commands/ (CreateRecipe, UpdateRecipe, DeleteRecipe)
  queries/ (GetRecipe, GetRecipesByStock)

infrastructure/recipe/
  repositories/PrismaRecipeRepository.ts

api/
  controllers/RecipeController.ts
  routes/ (ajout dans StockRoutesV2.ts)
  dtos/RecipeDTO.ts
\`\`\`

## Endpoints à créer
- \`GET  /api/v2/stocks/:stockId/recipes\`
- \`POST /api/v2/stocks/:stockId/recipes\`
- \`GET  /api/v2/stocks/:stockId/recipes/:recipeId\`
- \`PATCH /api/v2/stocks/:stockId/recipes/:recipeId\`
- \`DELETE /api/v2/stocks/:stockId/recipes/:recipeId\`

## Critères d'acceptation
- [ ] Domain : entité Recipe + interface IRecipeRepository
- [ ] Commands : CreateRecipe, UpdateRecipe, DeleteRecipe
- [ ] Queries : GetRecipesByStock, GetRecipeById
- [ ] Infrastructure : PrismaRecipeRepository
- [ ] Controller + routes + DTOs
- [ ] Tests unitaires RecipeRepository (mock Prisma)
- [ ] OpenAPI mis à jour

## Référence RNCP
CE2.4.2 — liaison front/back assurée par APIs
CE2.5.3 — extraction de valeur de la donnée"
```

---

### FEATURE N4-5 — CRUD SavedProject backend

```bash
gh issue create \
  --repo SandrineCipolla/stockhub_back \
  --title "feat: CRUD SavedProject — domain + infrastructure + api (DDD/CQRS)" \
  --label "ai,backend" \
  --body "## Contexte
Implémentation complète du CRUD SavedProject
incluant la gestion des étapes (ProjectStep)
et la mise à jour du statut (TODO/IN_PROGRESS/DONE).

## Dépend de
- feat: migration SavedProject (#N4-2)

## Endpoints à créer
- \`GET    /api/v2/stocks/:stockId/projects\`
- \`POST   /api/v2/stocks/:stockId/projects\`
- \`GET    /api/v2/stocks/:stockId/projects/:projectId\`
- \`PATCH  /api/v2/stocks/:stockId/projects/:projectId\`
- \`DELETE /api/v2/stocks/:stockId/projects/:projectId\`
- \`PATCH  /api/v2/stocks/:stockId/projects/:projectId/steps/:stepId\`
  (cocher/décocher une étape)

## Critères d'acceptation
- [ ] Domain complet (entité, repository interface, commands, queries)
- [ ] Infrastructure : PrismaSavedProjectRepository
- [ ] Controller + routes + DTOs
- [ ] Endpoint PATCH step : met à jour \`completed\` + \`completedAt\`
- [ ] Tests unitaires
- [ ] OpenAPI mis à jour

## Référence RNCP
CE2.4.2 — liaison front/back assurée par APIs"
```

---

### FEATURE N4-6 — ShoppingList + consolidation backend

```bash
gh issue create \
  --repo SandrineCipolla/stockhub_back \
  --title "feat: ShoppingList CRUD + service de consolidation algo" \
  --label "ai,backend" \
  --body "## Contexte
La liste d'approvisionnement est générée depuis un ou plusieurs
projets/recettes. La consolidation (additionner les besoins,
soustraire les stocks disponibles) est un algorithme pur TypeScript
— pas de LLM.

## Dépend de
- feat: migration ShoppingList (#N4-3)
- feat: CRUD SavedProject (#N4-5)

## Endpoints à créer
- \`GET  /api/v2/stocks/:stockId/shopping-lists\`
- \`POST /api/v2/stocks/:stockId/shopping-lists\`
  (body : projectIds[] → génère automatiquement la liste)
- \`GET  /api/v2/stocks/:stockId/shopping-lists/:listId\`
- \`PATCH /api/v2/stocks/:stockId/shopping-lists/:listId/items/:itemId\`
  (cocher un item ou modifier la quantité)
- \`DELETE /api/v2/stocks/:stockId/shopping-lists/:listId\`

## Service de consolidation (algo pur)
\`\`\`typescript
// ShoppingListConsolidationService.ts
// 1. Récupérer les matériaux de tous les projets sélectionnés
// 2. Additionner les quantités par item (même nom + même unité)
// 3. Soustraire les quantités disponibles en stock
// 4. Retourner uniquement ce qui manque
\`\`\`

## Critères d'acceptation
- [ ] Domain + infrastructure + api complets
- [ ] ShoppingListConsolidationService implémenté
- [ ] POST génère automatiquement les items depuis les projets
- [ ] PATCH item : met à jour \`checked\` et/ou \`quantity\`
- [ ] Tests unitaires ShoppingListConsolidationService
- [ ] OpenAPI mis à jour

## Référence RNCP
CE2.5.3 — algorithme déterministe pour extraction de valeur
CE2.4.2 — liaison front/back assurée par APIs"
```

---

### FEATURE N4-7 — Page Suggestions frontend

```bash
gh issue create \
  --repo SandrineCipolla/stockHub_V2_front \
  --title "feat: Page Suggestions 'Que faire avec ce que j'ai ?' + SuggestionCard + TutoModal" \
  --label "ai,frontend" \
  --body "## Contexte
Première page frontend du module N4.
Affiche les suggestions LLM (recettes/projets/bricolage)
adaptées aux stocks disponibles de l'utilisateur.

## Dépend de
- feat: AIService suggestions LLM (#124 back) — endpoints /suggestions
- study: prompt engineering (prompts validés)

## Fichiers à créer

### API et hooks
\`\`\`
src/services/api/suggestionsAPI.ts
  → getSuggestions(stockId, category): Promise<SuggestionResponse>
  → Pattern identique à stocksAPI.ts existant

src/hooks/useSuggestions.ts
  → useQuery React Query
  → Pattern identique à useItems.ts existant
\`\`\`

### Composants
\`\`\`
src/pages/SuggestionsPage.tsx
  → Sélecteur de catégorie (FOOD / ART_SUPPLIES / DIY)
  → Liste de SuggestionCard
  → Loading state (LLM peut être lent : skeleton)
  → Message si catégorie non supportée (ex: HYGIENE)

src/components/ai/SuggestionCard.tsx
  → Utilise sh-card du DS comme conteneur
  → Nom, durée, difficulté (badge sh-badge)
  → Bouton 'Voir le tuto' → ouvre TutoDetailModal
  → Bouton 'Sauvegarder ce projet'

src/components/ai/TutoDetailModal.tsx
  → Affiche les étapes résumées (4-6 steps)
  → Pattern identique à ItemFormModal existant
\`\`\`

### Routing
- Ajouter route \`/stocks/:stockId/suggestions\`
  dans App.tsx (lazy loading, pattern existant)
- Ajouter lien depuis Dashboard ou StockDetailPage

## Critères d'acceptation
- [ ] suggestionsAPI.ts + useSuggestions.ts créés
- [ ] SuggestionsPage affiche les suggestions par catégorie
- [ ] SuggestionCard affiche nom, durée, difficulté, boutons
- [ ] TutoDetailModal affiche les étapes
- [ ] Loading skeleton pendant appel LLM
- [ ] Message adapté si catégorie sans LLM (HYGIENE etc.)
- [ ] Route ajoutée dans App.tsx
- [ ] Lien depuis Dashboard
- [ ] Tests composants critiques

## Référence RNCP
CE2.3.4 — frameworks répondant aux besoins du projet
CE2.5.3 — extraction de valeur innovante"
```

---

### FEATURE N4-8 — Bibliothèque projets frontend

```bash
gh issue create \
  --repo SandrineCipolla/stockHub_V2_front \
  --title "feat: Bibliothèque projets sauvegardés — liste + détail + étapes cochables" \
  --label "ai,frontend" \
  --body "## Contexte
Deuxième page frontend du module N4.
Permet à l'utilisateur de consulter et suivre
ses projets/recettes sauvegardés.

## Dépend de
- feat: CRUD SavedProject backend (#N4-5)

## Fichiers à créer

### API et hooks
\`\`\`
src/services/api/projectsAPI.ts
  → getProjects(stockId): Promise<SavedProject[]>
  → createProject(stockId, data): Promise<SavedProject>
  → updateProject(stockId, projectId, data): Promise<SavedProject>
  → updateStep(stockId, projectId, stepId, completed): Promise<void>
  → deleteProject(stockId, projectId): Promise<void>

src/hooks/useProjects.ts
  → useQuery + useMutation React Query
  → Pattern identique à useItems.ts
\`\`\`

### Composants
\`\`\`
src/pages/ProjectsLibraryPage.tsx
  → Filtres par statut (TODO / IN_PROGRESS / DONE)
  → Filtres par catégorie (FOOD / ART / DIY)
  → Liste de ProjectCard
  → Bouton créer projet manuel

src/components/ai/ProjectCard.tsx
  → Utilise sh-card + sh-status-badge du DS
  → Nom, catégorie, statut, progression étapes
  → Bouton voir détail / démarrer / terminer

src/pages/ProjectDetailPage.tsx
  → Titre, description, matériaux nécessaires
  → Liste d'étapes cochables (StepperChecklist)
  → Bouton 'Générer liste d'approvisionnement'

src/components/ai/StepperChecklist.tsx
  → Étapes numérotées avec checkbox
  → Barre de progression (étapes cochées / total)
  → Créer en React/Tailwind pur (pas dans DS pour l'instant)
\`\`\`

## Critères d'acceptation
- [ ] projectsAPI.ts + useProjects.ts créés
- [ ] ProjectsLibraryPage avec filtres statut/catégorie
- [ ] ProjectCard avec progression visible
- [ ] ProjectDetailPage avec étapes cochables
- [ ] StepperChecklist : cocher une étape appelle PATCH step
- [ ] Barre de progression mise à jour en temps réel
- [ ] Route \`/stocks/:stockId/projects\` dans App.tsx
- [ ] Route \`/stocks/:stockId/projects/:projectId\` dans App.tsx
- [ ] Tests composants critiques

## Référence RNCP
CE2.3.4 — frameworks répondant aux besoins du projet"
```

---

### FEATURE N4-9 — Page Liste d'approvisionnement frontend

```bash
gh issue create \
  --repo SandrineCipolla/stockHub_V2_front \
  --title "feat: Page liste d'approvisionnement — générée, éditable, partageable" \
  --label "ai,frontend" \
  --body "## Contexte
Troisième page frontend du module N4.
La liste est générée depuis un ou plusieurs projets,
consolidée par le backend (algo déterministe),
puis éditée par l'utilisateur.

## Dépend de
- feat: ShoppingList backend (#N4-6)
- feat: Bibliothèque projets (#N4-8 — pour le bouton génération)

## Fichiers à créer

### API et hooks
\`\`\`
src/services/api/shoppingListAPI.ts
  → getLists(stockId): Promise<ShoppingList[]>
  → createList(stockId, projectIds[]): Promise<ShoppingList>
  → updateItem(stockId, listId, itemId, data): Promise<void>
  → deleteList(stockId, listId): Promise<void>

src/hooks/useShoppingList.ts
  → useQuery + useMutation React Query
\`\`\`

### Composants
\`\`\`
src/pages/ShoppingListPage.tsx
  → Nom de la liste + date
  → Liste de ShoppingListItem
  → Bouton ajouter item manuellement
  → Bouton partager (copier texte / exporter CSV)
  → Compteur : X/Y articles cochés

src/components/ai/ShoppingListItemComponent.tsx
  → Checkbox + nom + quantité éditable + unité
  → Bouton supprimer
  → Style barré si coché
\`\`\`

## Critères d'acceptation
- [ ] shoppingListAPI.ts + useShoppingList.ts créés
- [ ] ShoppingListPage affiche les items générés
- [ ] Checkbox met à jour \`checked\` via PATCH
- [ ] Quantité éditable inline
- [ ] Bouton ajouter item manuellement
- [ ] Export texte (copier dans presse-papier)
- [ ] Compteur progression articles cochés
- [ ] Route \`/stocks/:stockId/shopping-lists/:listId\`
- [ ] Tests composants critiques

## Référence RNCP
CE2.3.4 — frameworks répondant aux besoins du projet
CE2.5.3 — extraction de valeur innovante"
```

---

## RÉCAPITULATIF

### Ordre d'exécution

```
LABEL
└── Prompt 0 — créer label ai (2 repos)

ÉTUDES (dans l'ordre)
├── Étude 5  — spike Ollama (peut démarrer maintenant)
├── Étude 1  — choix modèle LLM via OpenRouter
├── Étude 2  — prompt engineering
├── Étude 3  — modélisation données N4
└── Étude 4  — function calling vs JSON mode

FEATURES N2 (issues existantes — implémenter après études 1+2+4)
├── back #124 — AIService LLM OpenRouter
├── front #118 — brancher mlSimulation sur backend
└── front #119 — distinguer LLM vs déterministe

FEATURES N4 back (après étude 3 — peuvent aller en parallèle)
├── N4-1 — Migration Recipe + RecipeIngredient
├── N4-2 — Migration SavedProject + ProjectStep + ProjectMaterial
├── N4-3 — Migration ShoppingList + ShoppingListItem
├── N4-4 — CRUD Recipe
├── N4-5 — CRUD SavedProject
└── N4-6 — ShoppingList + consolidation algo

FEATURES N4 front (après N4 back correspondant)
├── N4-7 — Page Suggestions "Que faire ?"
├── N4-8 — Bibliothèque projets + StepperChecklist
└── N4-9 — Page liste d'approvisionnement
```

### Estimation avec Claude Code

| Scope                              | Journées estimées |
| ---------------------------------- | ----------------- |
| Études (5)                         | ~2j               |
| N2 (back #124 + front #118 + #119) | ~1.5j             |
| N4 back (migrations + CRUD)        | ~3j               |
| N4 front (3 pages)                 | ~3j               |
| **Total module IA complet**        | **~10j**          |

> Avec Claude Code : facteur x2.5 sur le code répétitif (migrations, CRUD, hooks, API services)

---

_Généré le 30 mars 2026 — Session de travail module IA StockHub V2_
