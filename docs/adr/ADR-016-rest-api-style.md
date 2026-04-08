# ADR-016 : Choix du style d'API — REST

**Date :** 2026-04-08
**Statut :** ✅ Accepté
**Décideurs :** Sandrine Cipolla
**Tags :** `api`, `rest`, `graphql`, `architecture`

---

## Besoin métier

StockHub expose des ressources bien définies : stocks, items, contributions, collaborateurs. Les opérations sont du CRUD enrichi — créer un stock, ajouter un item, consulter les prédictions. Le client unique est une SPA React qui consomme ces données via des appels HTTP classiques.

La question n'est pas "quel style est le plus moderne" mais "quel style répond aux besoins réels de cette application".

---

## Décision

**REST avec versioning URL** (`/api/v2/...`) est le style retenu pour l'API StockHub.

---

## Raisons

### 1. Les ressources sont naturellement hiérarchiques

Le modèle de données de StockHub est un arbre :

```
/stocks                      → collection de stocks
/stocks/:id                  → un stock
/stocks/:id/items            → items d'un stock
/stocks/:id/items/:itemId    → un item
/contributions/pending-count → agrégat métier
```

Cette structure correspond exactement au modèle REST : ressources nommées, identifiées par URL, manipulées via les verbes HTTP standard (GET, POST, PATCH, DELETE). Il n'y a pas de requête complexe ou de composition de données multi-domaines qui nécessiterait autre chose.

### 2. Les opérations mappent directement sur HTTP

| Opération métier         | Verbe HTTP | Endpoint                            |
| ------------------------ | ---------- | ----------------------------------- |
| Lister les stocks        | GET        | /api/v2/stocks                      |
| Créer un stock           | POST       | /api/v2/stocks                      |
| Ajouter un item          | POST       | /api/v2/stocks/:id/items            |
| Modifier un item         | PATCH      | /api/v2/stocks/:id/items/:itemId    |
| Contributions en attente | GET        | /api/v2/contributions/pending-count |

La sémantique HTTP (codes de statut, méthodes, headers) fournit un protocole standard que le client frontend comprend sans couche d'abstraction supplémentaire.

### 3. La cachabilité est gratuite

Les endpoints GET REST sont cachables par nature (CDN, navigateur, proxy). Cela ne change pas les performances mesurées de StockHub aujourd'hui, mais c'est un avantage structurel sans coût additionnel — une décision cohérente avec les bonnes pratiques, pas une optimisation prématurée.

### 4. Lisibilité et débogage immédiats

Un endpoint REST se teste directement depuis un navigateur, curl ou Postman sans connaître de schéma. Pour un projet inspecté dans un contexte RNCP, la lisibilité directe des URLs est un atout opérationnel concret.

---

## Alternatives considérées

### GraphQL

**Principe :** Un seul endpoint `/graphql`, le client décrit exactement les données qu'il veut.

**Avantages :**

- ✅ Évite le sur-fetching (le client ne reçoit que ce qu'il demande)
- ✅ Idéal quand plusieurs clients ont des besoins très différents (mobile vs web)
- ✅ Introspection du schéma native

**Pourquoi rejeté :**

- ❌ StockHub a **un seul client** (SPA React) — le sur-fetching n'est pas un problème réel
- ❌ Les données par endpoint sont stables (un stock = toujours label + description + items) — aucune flexibilité de requête n'est nécessaire
- ❌ Ajoute une complexité de setup (schéma SDL, resolvers, DataLoader pour éviter le N+1) sans bénéfice mesurable pour ce cas d'usage
- ❌ L'encadrant lui-même qualifie StockHub de "CRUD glorifié" — GraphQL répond à des problèmes de composition de données que ce projet n'a pas

### gRPC

**Principe :** Communication binaire ultra-rapide entre services, conçu pour la communication serveur-à-serveur.

**Avantages :**

- ✅ Très performant (données compressées en binaire, pas de JSON texte)
- ✅ Contrat typé strict (fichiers `.proto`)
- ✅ Streaming natif

**Pourquoi rejeté :**

- ❌ **Les navigateurs ne savent pas parler gRPC nativement.** Pour qu'une SPA React puisse l'utiliser, il faudrait ajouter une librairie cliente spéciale (grpc-web) et un serveur proxy de traduction (Envoy) entre le frontend et l'API — infrastructure sans rapport avec les besoins de StockHub
- ❌ Adapté à de la communication microservices, pas à des APIs consommées par un navigateur

---

## Conséquences

### Positives ✅

- API testable directement via navigateur ou curl
- Sémantique claire (GET = lecture, POST = création, PATCH = modification partielle)
- Documentation OpenAPI (`docs/openapi.yaml`) naturelle pour du REST
- Cohérence avec les standards de l'industrie pour des APIs internes à client unique

### Négatives ⚠️

- Sur-fetching possible si le client n'a besoin que d'un sous-ensemble des données
  → **Mitigation :** Les DTOs sont déjà définis pour retourner l'essentiel, pas les entités complètes

---

## Liens

- `docs/openapi.yaml` — documentation REST de l'API
- [ADR-005](./ADR-005-api-versioning-v2.md) — stratégie de versioning URL
- Issue : [#181](https://github.com/SandrineCipolla/stockhub_back/issues/181)
