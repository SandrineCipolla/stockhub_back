# ADR-013: Choix du provider LLM pour le module IA — local (Ollama) vs cloud (OpenRouter)

**Date:** 2026-03-24
**Mis à jour:** 2026-03-25
**Statut:** Accepté
**Décideurs:** Sandrine Cipolla

---

## Contexte

Dans le cadre du module IA de StockHub (suggestions de réapprovisionnement, profil consommateur), une décision doit être prise sur le provider LLM à utiliser. Deux approches ont été évaluées via un spike (#122) :

- **Local** : Ollama, exécuté sur la machine de développement (GPU : NVIDIA RTX 3060, 12 GB VRAM)
- **Cloud** : OpenRouter, proxy vers des modèles hébergés

Le spike a été conduit en deux phases :

1. **Phase 1** — payload simple (2 stocks, 5 items avec statuts uniquement) via `scripts/spike-ollama.ts`
2. **Phase 2** — payload réaliste : 90 jours d'historique de consommation pour 8 items, généré par `scripts/generateSyntheticData.ts`, via `scripts/spike-ollama.ts` et `scripts/spike-openrouter.ts`

### Résultats — Phase 1 (payload simple)

| Critère                | phi3:mini (Ollama local)                   | mistral (Ollama local) | OpenRouter (cloud) |
| ---------------------- | ------------------------------------------ | ---------------------- | ------------------ |
| **Latence**            | ~60 000 ms                                 | ~31 000 ms             | ~800 ms            |
| **JSON valide**        | ❌ (enveloppé dans des backticks markdown) | ✅                     | ✅                 |
| **Structure correcte** | ❌ (champs inventés, hors prompt)          | ✅ (écarts mineurs)    | ✅                 |
| **Qualité globale**    | Médiocre                                   | Acceptable             | Bonne              |

### Résultats — Phase 2 (historique 90 jours, payload réaliste)

| Critère                       | mistral (Ollama local)                            | OpenRouter (cloud)                          |
| ----------------------------- | ------------------------------------------------- | ------------------------------------------- |
| **Latence**                   | ~30 000 ms                                        | ~2 500 ms                                   |
| **JSON valide**               | ✅                                                | ✅                                          |
| **Couverture du payload**     | ❌ Garde-manger ignoré — seule l'Hygiène analysée | ✅ Tous les stocks et items analysés        |
| **Détection patterns**        | ❌ Patterns weekend/weekday non détectés          | ✅ Intégrés dans la recommandation          |
| **Précision des estimations** | ❌ Chiffres incohérents avec les données fournies | ✅ Cohérents avec les données (Farine : 3j) |
| **Hallucinations**            | ❌ Oui ("achetive", "ruptures en lavabo")         | ❌ Aucune                                   |
| **Qualité de recommandation** | Générique et partiellement inventée               | Précise, actionnelle, personnalisée         |

**Diagnostic Ollama Phase 2** : Mistral 7B sature sur un grand contexte JSON (~4k tokens de payload). Il tronque silencieusement une partie de l'input et hallucine pour combler — comportement inacceptable en production.

### Comparaison production

| Critère               | Ollama local (mistral)                           | OpenRouter (cloud)                    |
| --------------------- | ------------------------------------------------ | ------------------------------------- |
| **Déploiement**       | ❌ Impossible sur Azure App Service (pas de GPU) | ✅ Juste une variable d'env           |
| **Dépendance réseau** | Aucune                                           | Requise                               |
| **Coût**              | 0 (hors infra)                                   | Pay-per-use (tier gratuit disponible) |
| **Privacy**           | Données locales                                  | Données envoyées en cloud             |
| **Scalabilité**       | Limité à 1 requête simultanée (GPU dédié)        | Scalable selon le plan                |
| **Rate limits**       | Aucun                                            | Tier gratuit : rate limits agressifs  |

## Décision

Utiliser **OpenRouter** (cloud) comme provider LLM pour l'environnement de développement et de production.

**Modèle retenu pour la prod** : `openrouter/free` (routing automatique vers le meilleur modèle gratuit disponible) avec possibilité de passer sur un modèle payant fixe si les rate limits deviennent bloquants.

Ollama est **écarté** définitivement pour la production — non deployable sur Azure et incapable de traiter un contexte réaliste sans halluciner.

## Raisons

- La latence de ~30s en local est incompatible avec le seuil cible de < 3s
- Ollama mistral sature sur un payload réaliste (90j d'historique) : tronque l'input, hallucine, ignore des stocks entiers
- OpenRouter à ~2.5s sur payload réaliste reste dans les critères UX
- OpenRouter détecte les patterns de consommation (weekend vs weekday) et produit des recommandations actionnables
- Ollama non déployable sur Azure App Service sans infrastructure GPU dédiée (hors scope projet RNCP)
- L'API OpenRouter est compatible OpenAI SDK — facilite un éventuel changement de provider

## Alternatives considérées

### Alternative 1 : Ollama local (phi3:mini)

- **Avantages:** Gratuit, pas de dépendance réseau, données restent locales
- **Inconvénients:** ~60s de latence, JSON non valide, qualité médiocre
- **Pourquoi rejetée:** Latence et qualité incompatibles avec les critères d'acceptation

### Alternative 2 : Ollama local (mistral 7B)

- **Avantages:** Gratuit, JSON valide sur payload simple
- **Inconvénients:** ~30s de latence, sature sur un contexte réaliste, hallucine, non déployable en production
- **Pourquoi rejetée:** Incompatible prod (Azure), tronque l'input sur données réelles

### Alternative 3 : OpenAI API directe

- **Avantages:** Qualité maximale, fiabilité élevée
- **Inconvénients:** Coût plus élevé, vendor lock-in
- **Pourquoi rejetée:** OpenRouter offre le même accès avec plus de flexibilité de modèle

### Alternative 4 : OpenRouter tier payant (modèle fixe)

- **Avantages:** Pas de rate limits, modèle prévisible, latence stable
- **Inconvénients:** Coût pay-per-use
- **Pourquoi non retenue immédiatement:** Tier gratuit suffisant pour un usage RNCP — à réévaluer si volume augmente

## Conséquences

### Positives

- Latence compatible avec une UX fluide (~2.5s sur données réelles)
- JSON valide et structure cohérente sans prompt engineering complexe
- Analyse de patterns de consommation exploitable (weekends, tendances)
- Portabilité : fonctionne en dev, staging (Render) et production (Azure)
- Flexibilité : changement de modèle via une variable d'environnement

### Négatives

- Dépendance réseau obligatoire pour les features IA
- Rate limits sur le tier gratuit (observés lors du spike)
- Clé API à gérer dans les secrets d'environnement
- Données de stocks envoyées à un service cloud tiers

### Risques

- **Rate limits** : tier gratuit throttlé en pic de charge → mitigation : `openrouter/free` route automatiquement vers un provider disponible ; fallback gracieux si tous saturés
- **Disponibilité OpenRouter** : si le service est indisponible, le module IA est dégradé → mitigation : désactiver les suggestions sans erreur bloquante
- **Coût inattendu** : si le volume de requêtes explose → mitigation : rate limiting côté API StockHub

## Validation

- La latence du module IA doit être < 3s en production
- Les réponses LLM doivent être du JSON valide parseable sans post-traitement
- Les tests d'intégration du module IA doivent mocker OpenRouter (pas d'appels réels en CI)

## Liens

- Issue GitHub: #122
- Scripts de spike: `scripts/spike-ollama.ts`, `scripts/spike-openrouter.ts`
- Données synthétiques: `scripts/generateSyntheticData.ts`
- Liste des modèles disponibles: `scripts/list-openrouter-models.ts`

---

**Note:** Les ADRs sont immuables. Si cette décision change, créer une nouvelle ADR qui supplante celle-ci.
