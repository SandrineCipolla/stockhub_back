# ADR-014: Prédictions de stock — algorithmes déterministes avec historique de consommation

**Date:** 2026-03-25
**Statut:** Accepté
**Décideurs:** Sandrine Cipolla

---

## Contexte

StockHub a besoin de prédire quand un stock va s'épuiser et recommander des réassorts. Deux approches sont possibles : ML (modèles entraînés) ou algorithmes déterministes sur l'historique de consommation. Le projet dispose d'un historique limité (données de démo, pas encore de vraies données de prod) et doit rester déployable sur Azure App Service F1 (ressources limitées).

## Décision

Implémenter des **algorithmes déterministes** basés sur l'historique de consommation (`ItemHistory`) plutôt que des modèles ML. Un `StockPredictionService` calcule `avgDailyConsumption`, `daysUntilEmpty`, `detectTrend` et `recommendedRestock` à partir des 90 derniers jours d'historique.

La stratégie de cache retenue (option A) : retourner la dernière prédiction sauvegardée si elle existe, recalculer uniquement si absente. Un cron job quotidien (ticket #135) assurera la fraîcheur des données.

## Raisons

- **Données insuffisantes** : pas assez d'historique réel pour entraîner un modèle ML fiable
- **Déployabilité** : les modèles ML nécessitent des ressources (RAM/CPU) incompatibles avec Azure F1
- **Maintenabilité** : algorithmes lisibles, testables unitairement, sans dépendance externe
- **Évolutivité** : l'architecture (interfaces `IItemHistoryRepository`, `IPredictionRepository`) permet de remplacer les algorithmes par du ML plus tard sans changer les couches supérieures
- **Rapidité** : livrable en un seul ticket, valeur immédiate pour l'utilisateur

## Alternatives considérées

### Alternative 1 : ML via OpenRouter/LLM (ADR-013)

- **Avantages:** Prédictions potentiellement plus précises sur données riches
- **Inconvénients:** Latence réseau, coût API, hallucinations sur données insuffisantes
- **Pourquoi rejetée:** Spike #122 a montré des résultats peu fiables avec 90 jours de données synthétiques, et un coût non maîtrisé en prod

### Alternative 2 : ML local (TensorFlow.js, ONNX)

- **Avantages:** Pas de latence réseau, pas de coût
- **Inconvénients:** Entraînement nécessaire, taille de modèle incompatible avec Azure F1, complexité de maintenance
- **Pourquoi rejetée:** Overkill pour la phase actuelle du projet

### Alternative 3 : Recalcul à chaque requête GET

- **Avantages:** Prédictions toujours fraîches
- **Inconvénients:** Requêtes lentes, charge inutile sur la base de données
- **Pourquoi rejetée:** Option A (cache + cron) offre un meilleur équilibre fraîcheur/performance

## Conséquences

### Positives

- 170 tests unitaires passants, `StockPredictionService` entièrement couvert
- `GET /prediction` est un pure read (option A) — performant
- Architecture extensible : swap ML possible sans modifier les interfaces
- Seed 90 jours permet de tester les prédictions dès le démarrage

### Négatives

- Prédictions moins précises que du ML sur données riches
- `simulatedFallback=true` retourné si historique < 7 jours (nouveau item)

### Risques

- Historique de consommation dépend de la qualité des données saisies — mitigation : enregistrement automatique à chaque action (handler)
- Fraîcheur des prédictions dépend du cron job (#135) — mitigation : fallback sur recalcul si aucune prédiction existante

## Validation

- 11 tests unitaires `StockPredictionService.test.ts` couvrent tous les cas limites
- `GET /stocks/:stockId/items/:itemId/prediction` retourne une prédiction cohérente avec l'historique seedé

## Liens

- Issue GitHub: #123
- Issue cron job: #135
- ADR LLM provider: [ADR-013](./ADR-013-llm-provider-local-vs-cloud.md)
- Code concerné: `src/domain/prediction/`, `src/infrastructure/prediction/`, `src/api/controllers/StockPredictionController.ts`

---

**Note:** Les ADRs sont immuables. Si cette décision change, créer une nouvelle ADR qui supplante celle-ci.
