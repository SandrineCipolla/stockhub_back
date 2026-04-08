# ADR-016 : Choix du style d'API — REST

**Date :** 2026-04-08
**Statut :** ✅ Accepté
**Décideurs :** Sandrine Cipolla
**Tags :** `api`, `rest`, `graphql`, `architecture`

---

## Besoin métier

StockHub expose des ressources bien définies : stocks, items, contributions, collaborateurs. Les opérations sont du CRUD enrichi — créer un stock, ajouter un item, consulter les prédictions. Le seul client est l'application React.

La question n'est pas "quel style est le plus moderne" mais "quel style répond aux besoins réels de cette application".

---

## Décision

**REST avec versioning URL** (`/api/v2/...`) est le style retenu pour l'API StockHub.

---

## Raisons

### 1. Les données de StockHub s'organisent naturellement en arbre

Un stock contient des items, un item appartient à un stock. C'est une hiérarchie simple, et REST reflète exactement ça dans les URLs — on lit l'URL et on comprend immédiatement de quoi on parle :

```
/stocks                      → tous les stocks
/stocks/3                    → le stock numéro 3
/stocks/3/items              → les items du stock numéro 3
/stocks/3/items/12           → l'item 12 du stock 3
```

### 2. Chaque action a un verbe HTTP qui lui correspond naturellement

REST réutilise les verbes HTTP (GET, POST, PATCH, DELETE) comme "actions". Pas besoin d'inventer un nouveau langage — les conventions existent déjà :

| Ce qu'on veut faire      | Verbe HTTP | URL                                 |
| ------------------------ | ---------- | ----------------------------------- |
| Voir tous les stocks     | GET        | /api/v2/stocks                      |
| Créer un stock           | POST       | /api/v2/stocks                      |
| Ajouter un item          | POST       | /api/v2/stocks/:id/items            |
| Modifier un item         | PATCH      | /api/v2/stocks/:id/items/:itemId    |
| Contributions en attente | GET        | /api/v2/contributions/pending-count |

Un développeur qui découvre l'API comprend ce que fait chaque endpoint sans lire la doc. C'est un gain de temps et de clarté concret.

### 3. On peut tester l'API directement depuis le navigateur

Avec REST, une URL GET se colle dans la barre d'adresse du navigateur et retourne les données. Pas besoin de connaître un schéma, d'installer un outil, ou d'apprendre une syntaxe de requête spéciale.

```
https://monapi.com/api/v2/stocks   → affiche les stocks directement
```

C'est pratique pour déboguer, pour montrer l'API lors de la soutenance, et pour que n'importe quel outil (Postman, curl, navigateur) puisse l'interroger.

### 4. Les réponses GET peuvent être mises en cache automatiquement

Un navigateur ou un réseau intermédiaire peut garder en mémoire la réponse d'une requête GET REST et la réutiliser sans rappeler le serveur. Ce n'est pas critique pour StockHub aujourd'hui, mais c'est une propriété que REST offre gratuitement sans configuration supplémentaire.

---

## Alternatives considérées

### GraphQL

**Principe :** Avec GraphQL, il n'y a plus plein d'URLs différentes — il y a un seul endpoint (`/graphql`). C'est le client qui, dans chaque requête, décrit exactement les champs qu'il veut recevoir.

**Exemple :** plutôt que `/api/v2/stocks/3`, le client envoie :

```graphql
query {
  stock(id: 3) {
    label
    items {
      label
      quantity
    }
  }
}
```

**Avantages :**

- ✅ Le client ne reçoit que ce qu'il a demandé — utile quand les clients ont des besoins très différents (app mobile qui veut peu de champs, app web qui en veut plus)
- ✅ Idéal quand plusieurs clients différents consomment la même API
- ✅ Le schéma de l'API est auto-documenté et explorable

**Pourquoi rejeté :**

- ❌ StockHub n'a **qu'un seul client** (l'appli React) — le problème que GraphQL résout (adapter les données à chaque client) ne se pose pas ici
- ❌ Les données renvoyées par chaque endpoint sont stables : un stock retourne toujours les mêmes champs — il n'y a pas besoin de flexibilité
- ❌ GraphQL demande beaucoup plus de configuration à mettre en place (définir un schéma, écrire un "resolver" pour chaque champ, gérer les problèmes de performance liés aux requêtes imbriquées) pour un résultat équivalent à du REST simple

### gRPC

**Principe :** gRPC est un protocole de communication très rapide, conçu pour que des serveurs se parlent entre eux en interne (par exemple, des microservices). Les données ne sont pas envoyées en texte lisible (JSON) mais en binaire compressé, ce qui est beaucoup plus rapide à transmettre et à lire.

**Avantages :**

- ✅ Très performant (données compressées, pas de JSON texte)
- ✅ Contrat strict entre client et serveur (défini dans des fichiers `.proto`)
- ✅ Streaming natif (envoi de données en flux continu)

**Pourquoi rejeté :**

- ❌ **Les navigateurs ne savent pas parler gRPC.** Pour qu'une application React puisse l'utiliser, il faudrait ajouter une librairie cliente spéciale (grpc-web) ET un serveur proxy intermédiaire (Envoy) chargé de traduire les requêtes entre le navigateur et l'API. C'est une infrastructure complexe sans rapport avec les besoins de StockHub
- ❌ gRPC est adapté à la communication entre serveurs, pas entre un navigateur et une API

---

## Conséquences

### Positives ✅

- API testable directement via navigateur, curl ou Postman
- Verbes HTTP standard : facile à comprendre, facile à maintenir
- Documentation OpenAPI (`docs/openapi.yaml`) adaptée nativement au style REST
- N'importe quel développeur peut prendre en main l'API sans formation spécifique

### Négatives ⚠️

- On retourne parfois un peu plus de données que ce dont le client a besoin (par exemple, retourner tous les champs d'un item alors que le frontend n'en affiche que deux)
  → **Mitigation :** Les DTOs sont déjà définis pour retourner l'essentiel, sans exposer les entités complètes du domaine

---

## Liens

- `docs/openapi.yaml` — documentation REST de l'API
- [ADR-005](./ADR-005-api-versioning-v2.md) — stratégie de versioning URL
- Issue : [#181](https://github.com/SandrineCipolla/stockhub_back/issues/181)
