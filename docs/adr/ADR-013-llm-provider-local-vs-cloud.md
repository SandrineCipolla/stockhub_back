# ADR-013: Choix du provider LLM pour le module IA — local (Ollama) vs cloud (OpenRouter)

**Date:** 2026-03-24
**Statut:** Accepté
**Décideurs:** Sandrine Cipolla

---

## Contexte

Dans le cadre du module IA de StockHub (suggestions de réapprovisionnement, profil consommateur), une décision doit être prise sur le provider LLM à utiliser. Deux approches ont été évaluées via un spike (#122) :

- **Local** : Ollama, exécuté sur la machine de développement (GPU : NVIDIA RTX 3060, 12 GB VRAM)
- **Cloud** : OpenRouter, proxy vers des modèles hébergés (ex. Mistral 7B Instruct via API)

Un script de spike (`scripts/spike-ollama.ts`) a été utilisé pour mesurer la latence et la qualité des réponses sur un payload de test représentatif (2 stocks, 5 items avec statuts).

### Résultats du spike

| Critère                | phi3:mini (Ollama local)                   | mistral (Ollama local) | OpenRouter (cloud) |
| ---------------------- | ------------------------------------------ | ---------------------- | ------------------ |
| **Latence**            | ~60 000 ms                                 | ~31 000 ms             | ~800 ms            |
| **JSON valide**        | ❌ (enveloppé dans des backticks markdown) | ✅                     | ✅                 |
| **Structure correcte** | ❌ (champs inventés, hors prompt)          | ✅ (mineurs écarts)    | ✅                 |
| **Qualité globale**    | Médiocre                                   | Acceptable             | Bonne              |
| **Dépendance réseau**  | Aucune                                     | Aucune                 | Requise            |
| **Coût**               | 0                                          | 0                      | Pay-per-use        |

## Décision

Utiliser **OpenRouter** (cloud) comme provider LLM pour l'environnement de développement et de production, avec Ollama conservé uniquement comme option de fallback en cas d'indisponibilité réseau.

## Raisons

- La latence de 31–60 secondes en local est incompatible avec une expérience utilisateur acceptable (seuil cible : < 3s)
- Ollama avec phi3:mini produit du JSON invalide sans prompt engineering avancé — risque de régression en production
- OpenRouter à ~800ms offre une qualité supérieure avec un coût marginal pour un projet personnel RNCP
- La machine de dev (12 GB VRAM) ne supporte pas des modèles plus performants (ex. Mistral 22B) sans dégradation significative
- L'API OpenRouter est compatible OpenAI SDK — facilite un éventuel changement de provider ultérieur

## Alternatives considérées

### Alternative 1 : Ollama local (phi3:mini)

- **Avantages:** Gratuit, pas de dépendance réseau, données restent locales
- **Inconvénients:** ~60s de latence, JSON non valide, qualité médiocre
- **Pourquoi rejetée:** Latence et qualité incompatibles avec les critères d'acceptation du module IA

### Alternative 2 : Ollama local (mistral)

- **Avantages:** Gratuit, JSON valide, qualité acceptable
- **Inconvénients:** ~31s de latence, nécessite ~4 GB VRAM, non déployable en production sans infrastructure dédiée
- **Pourquoi rejetée:** Latence trop élevée pour la production, non portable sur Azure App Service

### Alternative 3 : OpenAI API directe

- **Avantages:** Qualité maximale, fiabilité élevée
- **Inconvénients:** Coût plus élevé, vendor lock-in
- **Pourquoi rejetée:** OpenRouter offre le même accès avec plus de flexibilité de modèle

## Conséquences

### Positives

- Latence compatible avec une UX fluide (~800ms)
- JSON valide et structure cohérente sans prompt engineering complexe
- Portabilité : fonctionne en dev, staging (Render) et production (Azure)
- Flexibilité : changement de modèle via une variable d'environnement

### Négatives

- Dépendance réseau obligatoire pour les features IA
- Coût pay-per-use (faible mais non nul)
- Clé API à gérer dans les secrets d'environnement

### Risques

- **Disponibilité OpenRouter** : si le service est indisponible, le module IA est dégradé → mitigation : fallback gracieux (désactiver les suggestions, pas d'erreur bloquante)
- **Coût inattendu** : si le volume de requêtes explose → mitigation : rate limiting côté API StockHub

## Validation

- La latence du module IA doit être < 3s en production
- Les réponses LLM doivent être du JSON valide parseable sans post-traitement
- Les tests d'intégration du module IA doivent mocker OpenRouter (pas d'appels réels en CI)

## Liens

- Issue GitHub: #122
- Script de spike: `scripts/spike-ollama.ts`
- Audit module IA: `audit-results/ia-module-audit.md`

---

**Note:** Les ADRs sont immuables. Si cette décision change, créer une nouvelle ADR qui supplante celle-ci.
