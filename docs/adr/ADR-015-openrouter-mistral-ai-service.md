# ADR-015: OpenRouter + Mistral comme provider LLM pour l'AIService

**Date:** 2026-03-27
**Statut:** Accepté
**Décideurs:** Sandrine Cipolla

---

## Contexte

Le module IA de StockHub V2 requiert un LLM pour transformer les prédictions
déterministes (daysUntilEmpty, trend, avgDailyConsumption) en suggestions
textuelles lisibles. Il faut choisir un provider LLM et une stratégie d'intégration.

Contraintes :

- Budget limité (projet perso/pédagogique) → coût des tokens réduit au minimum
- Pas de données personnelles envoyées à un tiers (RGPD)
- L'app doit fonctionner sans clé API configurée (fallback obligatoire)
- Critère RNCP C2.5 : intégration LLM, architecture provider-agnostic, résilience

## Décision

Utiliser **OpenRouter** comme gateway provider-agnostic avec **Mistral Small 3.1**
comme modèle par défaut, via `fetch` natif (Node 18+). Les suggestions LLM sont
mises en cache 24h dans la table `stock_predictions` (champs `aiSuggestions`,
`aiGeneratedAt`) pour minimiser les appels et les coûts.

## Raisons

- **OpenRouter** permet de changer de modèle (Mistral, Llama, Claude) via une
  variable `AI_MODEL` sans modifier le code
- **Mistral Small 3.1** : bon ratio qualité/coût, supporte le JSON structuré
- **fetch natif** : zéro dépendance externe, Node 18+ natif
- **Cache DB** : évite les appels répétés, économise les tokens, pas d'infra
  supplémentaire (MySQL déjà en place)
- **Fallback déterministe** : l'app reste fonctionnelle sans clé API

## Alternatives considérées

### Alternative 1 : SDK @mistralai/mistralai

- **Avantages:** API typée, maintenance officielle
- **Inconvénients:** dépendance externe, lock-in Mistral, incompatible avec OpenRouter
- **Pourquoi rejetée:** fetch natif suffit, OpenRouter offre plus de flexibilité

### Alternative 2 : OpenAI SDK (compatible OpenRouter)

- **Avantages:** SDK mature, très documenté
- **Inconvénients:** dépendance externe, surcharge pour un usage simple
- **Pourquoi rejetée:** idem, fetch natif suffit

### Alternative 3 : Appel direct API Mistral

- **Avantages:** moins d'intermédiaires
- **Inconvénients:** lock-in provider, changement de modèle = changement de code
- **Pourquoi rejetée:** OpenRouter offre le provider-agnostic sans surcoût

### Alternative 4 : Cache Redis

- **Avantages:** ultra-rapide (< 1ms), TTL natif
- **Inconvénients:** infrastructure supplémentaire, coût, complexité opérationnelle
- **Pourquoi rejetée:** le vrai coût à éviter est l'appel LLM (~500ms + tokens),
  pas la lecture DB (~5-20ms). MySQL est suffisant.

## Conséquences

### Positives

- Zéro dépendance npm supplémentaire
- Changement de modèle LLM via variable d'environnement uniquement
- App 100% fonctionnelle sans clé OpenRouter (fallback déterministe)
- Aucune donnée personnelle envoyée au LLM (contexte anonymisé : quantités, seuils, tendances)
- Cache DB réduit les appels OpenRouter à ~1/jour par stock

### Négatives

- Cache par item en DB (pas par stock) : logique de merge dans le controller
- Pas de TTL automatique : la purge des vieilles suggestions n'est pas implémentée

### Risques

- **OpenRouter indisponible** → fallback déterministe activé automatiquement
- **Clé API expirée ou quota dépassé** → idem fallback
- **Réponse LLM malformée** → parsing défensif avec type guard, fallback si invalide

## Validation

- 9 tests unitaires couvrent : appel nominal, fallback clé absente, fallback erreur réseau,
  fallback réponse non-JSON, fallback tableau vide
- `SWAGGER_ENABLED=true` → endpoint `GET /api/v2/stocks/{stockId}/suggestions` visible et testable
- Sans `OPENROUTER_API_KEY` : suggestions retournées avec `source: 'deterministic'`

## Liens

- Issue GitHub: #124
- ADR précédent: [ADR-013](./ADR-013-llm-provider-local-vs-cloud.md) — choix provider LLM
- ADR prédictions: [ADR-014](./ADR-014-stock-prediction-deterministic.md) — prédictions déterministes
- Code concerné: `src/domain/ai/`, `src/infrastructure/ai/`, `src/api/controllers/StockSuggestionsController.ts`

---

**Note:** Les ADRs sont immuables. Si cette décision change, créer une nouvelle ADR qui supplante celle-ci.
