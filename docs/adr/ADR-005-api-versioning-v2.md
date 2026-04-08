# ADR-005: Versioning API (V2 sans V1)

**Date:** 2025-12-17
**Statut:** ✅ Accepté
**Décideurs:** Sandrine Cipolla, Équipe de développement StockHub

---

## Contexte

Lors de la revue du projet, l'encadrant RNCP a questionné le choix de commencer directement avec une API **V2** :

> "Pourquoi avez-vous une API V2 alors qu'il n'y a pas de V1 en production ?"

Cette question soulève un débat légitime sur le versioning prématuré.

### Contexte technique

Le projet StockHub a démarré avec :

- **API V1 initiale** : Prototype rapide, code legacy non structuré
- **API V2** : Refonte complète en DDD/CQRS (architecture propre)

**Routes actuelles :**

```
/api/v2/stocks              (GET, POST)
/api/v2/stocks/:id          (GET)
/api/v2/stocks/:id/items    (GET, POST, PATCH)
```

**Question :** Pourquoi ne pas appeler ça `/api/v1/` et incrémenter plus tard ?

---

## Décision

**Commencer directement en V2** et considérer V1 comme un prototype déprécié (non en production).

**Rationale :** V1 était un prototype architectural non viable. V2 est la **première version production-ready**.

---

## Raisons

### 1. V1 a été déployée pour évaluation, mais sans utilisateurs réels

**Faits :**

- ✅ V1 a été déployée dans le cadre de la certification RNCP niveau 6
- ❌ V1 n'a jamais eu d'utilisateurs réels ni de consommateurs externes
- ❌ V1 n'a pas été maintenue après la soutenance RNCP 6

**Conséquence :** Même si V1 a existé en production, il n'y a **pas de breaking change** pour d'éventuels clients, car
aucun consommateur externe ne dépendait de ses routes. Le versioning API a du sens quand des tiers ont intégré l'API et
ne peuvent pas migrer du jour au lendemain — ce cas ne s'est jamais produit.

```
Chronologie du projet :
│
├─ Phase 1 (2024): V1 — architecture Transaction Script
│   └─ Code: couplage fort Prisma, pas de DDD
│   └─ Statut: déployée pour RNCP 6, aucun utilisateur réel
│
├─ Phase 2 (Nov-Déc 2024): Refonte complète DDD/CQRS → V2
│   └─ Code: architecture propre, séparation READ/WRITE
│   └─ Statut: production-ready, frontend React connecté
│
└─ Aujourd'hui: V2 est la seule version active et maintenue
```

### 2. V1 = première version d'évaluation, pas une version consommateur

Le versioning d'API (V1, V2…) sert à **protéger les consommateurs externes** d'une rupture de contrat. Si une entreprise
tierce a intégré `/api/v1/stocks` dans son système, elle ne peut pas migrer du jour au lendemain — on maintient V1 le
temps qu'elle s'adapte.

Dans le cas de StockHub, V1 a été déployée pour une évaluation académique (RNCP 6), pas pour des intégrations tierces.
Il n'y avait aucun consommateur externe à protéger lors du passage en V2. Le préfixe `/v2` reflète donc une rupture
architecturale (Transaction Script → DDD/CQRS), pas une rupture de contrat avec des clients existants.

**Analogie :** On ne maintient pas la V1 d'un prototype présenté en soutenance comme on maintiendrait la V1 d'une API
publique consommée par des milliers de clients.

###3. Éviter une migration V1 → V2 inutile

**Si on avait appelé l'API actuelle "V1" :**

```typescript
// Aujourd'hui : /api/v1/stocks (hypothétique)
GET / api / v1 / stocks;
```

**Dans 6 mois, ajout de features (ML, containers) :**

```typescript
// Breaking changes nécessaires
GET / api / v2 / stocks ? include = predictions  // Nouveau champ
```

**Problème :** On devrait maintenir V1 ET V2 en parallèle, alors qu'il n'y a **aucun client V1** à supporter.

**Solution actuelle :**

```typescript
// Aujourd'hui : /api/v2/stocks (actuel)
GET / api / v2 / stocks

// Dans 6 mois : /api/v3/stocks (si breaking changes)
GET / api / v3 / stocks ? include = predictions

// Pas de V1 à maintenir !
```

### 4. Anticipation des évolutions futures

Le projet StockHub a des **évolutions planifiées** qui nécessiteront des breaking changes :

**Phase 3 (2025 Q1) : Prédictions ML**

```json
// V2 actuel
{
  "id": 1,
  "label": "Stock Cuisine",
  "itemCount": 5
}

// V3 futur (avec ML)
{
  "id": 1,
  "label": "Stock Cuisine",
  "itemCount": 5,
  "predictions": {
    // ← Nouveau champ
    "lowStockAlert": [
      "Tomates",
      "Carottes"
    ],
    "suggestedOrder": 15
  }
}
```

**Breaking change :** Ajout de champs, changement de structure.

En appelant l'API actuelle "V2", on a la **marge de manœuvre** pour créer V3 sans devoir supporter V1 (qui n'a jamais
existé en production).

### 5. Convention de nommage claire

**Principe :** Le numéro de version reflète l'**architecture**, pas la chronologie de développement.

| Version | Architecture                | Statut                                       |
| ------- | --------------------------- | -------------------------------------------- |
| ❌ V1   | Transaction Script (legacy) | Déployée RNCP 6, sans consommateurs externes |
| ✅ V2   | DDD/CQRS (propre)           | Production-ready                             |
| 🔮 V3   | DDD/CQRS + ML (futur)       | Planifié 2025                                |

**Message envoyé :** "V2 = architecture mûre, stable, production-ready".

---

## Alternatives considérées

### Alternative 1: Appeler l'API actuelle "V1"

**Principe :** Commencer en V1, incrémenter plus tard.

```typescript
// Aujourd'hui
GET / api / v1 / stocks;

// Plus tard (breaking changes)
GET / api / v2 / stocks;
```

**Avantages :**

- ✅ Suit la convention "première version = V1"
- ✅ Évite les questions de l'encadrant

**Inconvénients :**

- ❌ Crée confusion : "V1 = architecture legacy" vs "V1 = production"
- ❌ Obligation de maintenir V1 + V2 même si aucun client V1
- ❌ Gaspillage de numéro de version (V1 utilisé pour prototype)

**Pourquoi rejeté :** Maintenabilité. Si on doit supporter V1, on a un coût de maintenance pour ZÉRO client.

---

### Alternative 2: Pas de versioning (routes stables)

**Principe :** Pas de `/v1/` ou `/v2/`, juste `/api/stocks`.

```typescript
GET / api / stocks; // Stable, pas de breaking changes
```

**Avantages :**

- ✅ Simplicité (pas de gestion de versions)
- ✅ Évite confusion

**Inconvénients :**

- ❌ **Impossible d'introduire breaking changes** sans casser clients existants
- ❌ Obligation de compatibilité ascendante infinie
- ❌ Code pollué par flags de compatibilité

**Example de pollution :**

```typescript
// ❌ Code pollué par compatibilité rétroactive
GET / api / stocks ? legacy_format = true  // Flag pour ancien format
```

**Pourquoi rejeté :** Le projet a des évolutions ML planifiées qui **nécessiteront** des breaking changes. Il faut un
mécanisme de versioning.

---

### Alternative 3: Versioning sémantique dans headers

**Principe :** Version dans headers HTTP, pas dans l'URL.

```http
GET /api/stocks
Accept: application/vnd.stockhub.v2+json
```

**Avantages :**

- ✅ URLs stables
- ✅ Standard REST (GitHub API utilise ça)

**Inconvénients :**

- ❌ Complexité pour clients (headers custom)
- ❌ Moins visible/debuggable (version cachée dans headers)
- ❌ Overkill pour projet de cette taille

**Pourquoi rejeté :** Trop complexe pour besoins actuels. URL versioning est plus simple et standard pour APIs internes.

---

## Conséquences

### Positives ✅

1. **Clarté architecturale**
   - V2 = DDD/CQRS (architecture propre)
   - Message clair : "Production-ready"

2. **Flexibilité future**
   - Possibilité de créer V3 sans maintenir V1 fantôme
   - Breaking changes sans culpabilité

3. **Honnêteté technique**
   - V1 a existé mais sans consommateurs externes → pas d'obligation de maintien
   - V2 est la première version avec un frontend réel connecté

4. **Maintenance simplifiée**
   - Une seule version à maintenir (V2)
   - Pas de code de compatibilité rétroactive

---

### Négatives ⚠️

1. **Confusion potentielle**
   - Encadrant/reviewers peuvent questionner "Où est V1 ?"
   - **Mitigation :** Cet ADR documente la décision

2. **Perception de gaspillage**
   - Impression de "sauter" une version
   - **Mitigation :** V1 a existé pour RNCP 6, sans consommateurs externes — le `/v2` documente la rupture
     architecturale, pas un saut de version arbitraire

3. **Pas de standard universel**
   - Débat : "Première version = V1 ou peut commencer à V2 ?"
   - **Mitigation :** Convention interne documentée

---

### Risques

**Risque 1 : Mauvaise impression lors d'audit**

- **Impact :** Auditeurs pensent que projet mal géré (V1 perdue)
- **Probabilité :** Moyenne
- **Mitigation :** **Cet ADR** explique clairement la décision rationnelle

**Risque 2 : Clients futurs confus**

- **Impact :** Nouveaux utilisateurs cherchent V1
- **Probabilité :** Faible (documentation indique V2 = première version stable)
- **Mitigation :** Documentation API claire

---

## Validation

### Métriques de succès

✅ **Clarté :**

- Documentation API indique clairement : "V2 = première version stable"
- README explique l'absence de V1

✅ **Maintenance :**

- Une seule version en production : V2
- Coût maintenance : **0** (pas de support V1)

✅ **Évolutivité :**

- Possibilité de créer V3 sans dette technique V1

---

## Liens

- **Routes API :** `src/api/routes/StockRoutesV2.ts`
- **Documentation API :** (à créer) Swagger/OpenAPI pour V2
- **ADR lié :** [ADR-001 (Migration DDD/CQRS)](./ADR-001-migration-ddd-cqrs.md)
- **Référence versioning :** [Semantic Versioning](https://semver.org/)

---

**Réponse à l'encadrant :**

> "V1 a effectivement existé et a été déployée dans le cadre de la certification RNCP 6. En revanche, elle n'a jamais eu
> de consommateurs externes — aucune application tierce n'a intégré ses routes. Le passage en V2 correspond à une
> refonte
> architecturale complète (Transaction Script → DDD/CQRS) sans rupture de contrat avec des clients réels, puisqu'il n'y
> en
> avait pas. Le versioning d'API a pour but de protéger des intégrations tierces existantes — cette contrainte ne
> s'appliquait pas ici. Le préfixe `/v2` documente la rupture architecturale, pas une migration consommateur."
