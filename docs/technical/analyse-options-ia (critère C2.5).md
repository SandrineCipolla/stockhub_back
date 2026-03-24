# Synthèse module IA (C2.5)

## Contexte

Le critère C2.5 impose un module IA dans le projet (référentiel officiel RNCP Ingetis):

C2.5 — Traitement des données massives

"Coordonner le développement des solutions technologiques visant le traitement de la donnée à grande échelle, comportant
la collecte (ex. avec Open Refine ou Nifi), le traitement par lots ou en temps réel (ex. Apache Spark ou Storm) et le
stockage de données massives structurées ou non structurées, en utilisant des bases de données analytiques ou
opérationnelles, et en utilisant l'analyse descriptive ou prédictive (ex. machine learning), afin d'extraire toute la
valeur des données disponibles pour l'aide à la décision et automatisation de tâches répétitives."

Les 4 sous-critères d'évaluation :

CE2.5.1 — La collecte et le traitement par lot ou en temps réel via des outils technologiques répondent aux contraintes
techniques et fonctionnelles du projet
CE2.5.2 — Le stockage de données massives (structurées ou non) répond aux contraintes et assure sécurité et intégrité
CE2.5.3 — Les analyses descriptives et prédictives, y compris machine learning, permettent d'extraire de la valeur de
façon innovante
CE2.5.4 — Les choix technologiques, frameworks et outils sont présentés clairement et de façon argumentée

Note importante : le référentiel parle de "données massives" et cite Apache Spark, NiFi... c'est clairement calibré pour
des contextes big data en entreprise. Pour un projet solo RNCP, le jury s'attend à une adaptation raisonnée — et ton
discours "j'ai adapté l'approche big data aux contraintes réelles d'une appli familiale" couvre parfaitement CE2.5.4 (
choix argumentés). CE2.5.3 est couvert par ta régression linéaire + LLM, et CE2.5.1/2 par ton ItemHistory + MySQL.
L'audit du 23/03/2026 révèle que :

- ✅ **Le frontend a déjà une architecture IA complète** — composants, types, tests en place
- ❌ **Le backend est absent à 100%** — pas de table `item_history`, pas de service, pas d'endpoints
- ⚠️ **Tout est simulé avec des constantes hardcodées** côté client

### État réel du frontend (audit)

| Fichier                    | Utilisé            | Endpoints backend | Données                  |
| -------------------------- | ------------------ | ----------------- | ------------------------ |
| `stockPredictions.ts`      | ✅ StockDetailPage | Aucun             | ⚠️ Taux 10%/j hardcodé   |
| `mlSimulation.ts`          | ✅ Analytics       | Aucun             | ⚠️ Historique 30j simulé |
| `aiPredictions.ts`         | ✅ Dashboard       | Aucun             | ⚠️ Taux 5%/j hardcodé    |
| `StockPrediction.tsx`      | ✅ Analytics       | Aucun             | Délègue à mlSimulation   |
| `AIAlertBannerWrapper.tsx` | ✅ Dashboard       | Aucun             | Délègue à aiPredictions  |

**Conclusion** : l'architecture est là, il faut juste brancher des données réelles.

### Choix définitivement écartés

| Technologie            | Pourquoi écarté                                                             |
| ---------------------- | --------------------------------------------------------------------------- |
| **TensorFlow.js**      | Régression linéaire TypeScript pur = résultat identique, sans 2MB de bundle |
| **Clustering K-Means** | Nécessite des centaines d'items                                             |
| **Saisonnalité**       | Requiert 12 mois de données réelles — pas encore constituées                |

---

## Un peu de théorie

### LLM vs modèle prédictif — deux choses très différentes

|                        | LLM (Mistral, Claude...)    | Algo déterministe        |
| ---------------------- | --------------------------- | ------------------------ |
| **Produit**            | Du texte vraisemblable      | Un chiffre calculé       |
| **Données**            | Contexte dans le prompt     | Historique en BDD        |
| **Fiabilité chiffrée** | ❌ Hallucinations possibles | ✅ 100% fiable           |
| **Idéal pour**         | Suggestions, explications   | Dates rupture, quantités |

> **Règle d'or** : le LLM interprète et verbalise, il ne calcule jamais.

### Fine-tuning vs prompting

Le fine-tuning modifie les poids du modèle une fois (comportement général).  
Il **ne peut pas** apprendre les habitudes d'une famille spécifique — ça se fait dans le prompt à chaque appel.

| Besoin                        | Fine-tuning      | Prompt engineering              |
| ----------------------------- | ---------------- | ------------------------------- |
| Format JSON spécifique        | ✅ Utile         | ✅ Suffit souvent               |
| Habitudes famille spécifique  | ❌ Impossible    | ✅ Données dans le prompt       |
| Prédictions chiffrées fiables | ❌ LLM hallucine | ❌ → utiliser algo déterministe |

### Ollama

Outil open-source pour faire tourner des LLM (Mistral, Llama...) en local. API REST sur `localhost:11434`, compatible
format OpenAI. Nécessite un GPU pour des performances acceptables en production.

### OpenRouter

Gateway unifiée donnant accès à 290+ modèles via **une seule clé API**. Compatible OpenAI — on change juste la base URL.
Pas d'abonnement, facturation au token. Permet de switcher de modèle en changeant une variable d'env.

### Mistral

Startup française (Paris), modèles open-weight Apache 2.0. Pertinent pour StockHub : entreprise européenne (RGPD),
function calling natif (JSON structuré), disponible via OpenRouter.

---

## Comparaison des 3 options

| Critère                 | 🔵 Ollama local     | 🟡 Déterministe (algo)       | 🟢 LLM via OpenRouter  |
| ----------------------- | ------------------- | ---------------------------- | ---------------------- |
| **Technologie**         | Ollama + Mistral 7B | TypeScript pur               | Mistral / OpenRouter   |
| **Infrastructure prod** | ❌ GPU requis       | ✅ Aucune                    | ✅ API managée         |
| **Données nécessaires** | ⚠️ Grand volume     | ✅ Dès 7 jours               | ✅ Dès 7 jours         |
| **Fiabilité chiffrée**  | ⚠️ Hallucinations   | ✅ Déterministe              | ⚠️ Interprétatif       |
| **Coût prod**           | ❌ ~30-50€/mois     | ✅ 0€                        | ✅ ~0-2€/mois          |
| **Temps impl.**         | ✅ Spike 4h (doc)   | ✅ ~2 journées               | ✅ ~1 journée          |
| **RGPD**                | ✅ Aucun transfert  | ✅ Aucun transfert           | ✅ Données anonymisées |
| **Valeur jury**         | ✅ Exploration/ADR  | ✅✅ Implémentation testable | ✅✅✅ Démo visible    |
| **Rôle dans V2**        | 📚 Spike/ADR        | 🏗️ Fondation                 | ✨ Enrichissement      |

---

## Les 3 options en détail

### 🔵 Option 1 — Ollama + Mistral 7B en local (Spike)

Faire tourner Mistral 7B localement, appeler l'API depuis Node.js, tester sur données synthétiques générées par script.

**✅ Points positifs**

- Aucun coût, aucune donnée envoyée en externe
- Exploration complète du fonctionnement d'un LLM local
- Données synthétiques valorisables pour le jury
- Produit un ADR documentant l'arbitrage

**❌ Points négatifs**

- GPU requis en prod — VM Azure GPU = 30-50€/mois
- Latence 20-60s par réponse sur CPU
- Données insuffisantes pour entraîner quoi que ce soit en V2
- Maintenance du modèle local

**Décision** : Réalisé comme spike documentaire. Écarté pour la prod V2?? → **ADR-013**

---

### 🟡 Option 2 — Prédictions déterministes (TypeScript)

Table `ItemHistory` en BDD + `StockPredictionService` calculant des prédictions fiables.

**✅ Points positifs**

- Résultats déterministes, testables unitairement
- Aucun coût, aucune dépendance externe
- Architecture DDD respectée (`domain/prediction/`)
- Frontend déjà prêt — il suffit de brancher les endpoints
- RGPD simplifié — rien ne quitte Azure

**❌ Points négatifs**

- Nécessite 7+ jours d'historique avant résultats pertinents
- Suggestions purement chiffrées, pas de langage naturel

**Décision** : **Fondation obligatoire.** L'option 3 s'appuie dessus.

---

### 🟢 Option 3 — LLM Mistral via OpenRouter

`AIService` qui prend les résultats chiffrés du `StockPredictionService` (anonymisés) et appelle Mistral via OpenRouter
pour des suggestions en langage naturel.

**✅ Points positifs**

- Suggestions lisibles et contextualisées
- Provider-agnostic : changer de modèle = changer une variable d'env
- Mistral = entreprise française, argument RGPD solide
- Fallback automatique si LLM indisponible
- Modèles gratuits disponibles pour les tests

**❌ Points négatifs**

- Latence ~500ms-2s (plus lent que calcul local)
- Nécessite une clé API (`OPENROUTER_API_KEY`)

**Décision** : Couche d'enrichissement au-dessus de l'option 2. Données anonymisées uniquement. → **ADR-014**

---

## Architecture finale retenue

```
┌─────────────────────────────────────────────────────┐
│  MySQL — table ItemHistory                          │
│  → historique réel de consommation familiale        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  StockPredictionService (TypeScript pur)             │
│  → daysUntilEmpty, avgDailyConsumption, trend        │
│  → fiable 100%, testable, 0 dépendance externe      │
└──────────────────────┬──────────────────────────────┘
                       │ données anonymisées
┌──────────────────────▼──────────────────────────────┐
│  AIService — Mistral via OpenRouter                  │
│  → suggestions en langage naturel (JSON structuré)   │
│  → fallback automatique si indisponible              │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  Frontend React (composants déjà en place)           │
│  → badge "IA" (LLM) vs "Calcul" (déterministe)      │
│  → loading state, fallback UX                        │
└─────────────────────────────────────────────────────┘
```

### Flux pour une demande de suggestions

1. `GET /api/v2/stocks/:id/suggestions`
2. Récupération `ItemHistory` 90 derniers jours
3. `StockPredictionService` calcule les métriques
4. `AIService` anonymise + appelle Mistral via OpenRouter
5. Si OpenRouter indisponible → fallback déterministe
6. Frontend affiche avec badge source (`llm` | `deterministic`)

### Discours jury RNCP

> _"Le module C2.5 s'articule en trois niveaux : des algorithmes déterministes déjà testés côté client, un historique de
> consommation réel en base MySQL alimenté automatiquement, et une couche LLM via Mistral/OpenRouter pour les suggestions
> en langage naturel. TensorFlow.js et K-Means ont été évalués et écartés — inadaptés au volume de données d'une
> application familiale. Ollama a été exploré localement (ADR-013). L'architecture est provider-agnostic : changer de
> modèle IA ne nécessite pas de modifier le code."_

---

## Planning

| Semaine | Tâches                                                    | Durée | Livrable                             |
| ------- | --------------------------------------------------------- | ----- | ------------------------------------ |
| S1      | Spike Ollama + ItemHistory + PredictionService (back)     | ~8h   | ADR-013, migration Prisma            |
| S2      | Brancher front sur vrais endpoints + AIService LLM (back) | ~7h   | Prédictions réelles, suggestions LLM |
| S3      | Affichage front LLM + ADR-014 + tests                     | ~5h   | Démo RNCP C2.5 ✅                    |

**Total : ~3 journées de travail**

### Issues GitHub (5 issues créées)

- `[back]` [#122](http s://github.com/SandrineCipolla/stockhub_back/issues/122)
  spike: exploration Ollama + Mistral 7B en local
- `[back]` [#123](https://github.com/SandrineCipolla/stockhub_back/issues/123) feat: ItemHistory +
  StockPredictionService
- `[back]` [#124](https://github.com/SandrineCipolla/stockhub_back/issues/124) feat: AIService — suggestions LLM via
  OpenRouter
- `[front]` [#118](https://github.com/SandrineCipolla/stockHub_V2_front/issues/118) feat: brancher mlSimulation.ts sur
  vrais endpoints
- `[front]` [#119](https://github.com/SandrineCipolla/stockHub_V2_front/issues/119) feat: affichage suggestions LLM vs
  déterministes

---
