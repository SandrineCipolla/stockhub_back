# StockHub Backend - Module de Visualisation des Stocks

StockHub est une application web conçue pour aider les familles à gérer leurs stocks de produits (entre autres stocks
alimentaires, artistiques...). Elle permet aux utilisateurs de visualiser l'état des stocks mais aussi de les mettre à
jour facilement.
Cette documentation couvre le module de **Visualisation des Stocks** de la V2.

## 1. Introduction métier

### Problèmatique

Visualiser rapidement les quantités en notre possession,que l'on soit à la maison ou en plein shopping afin d'éviter les
ruptures ou les doublons.
Mettre à jour facilement les stocks après utilisation d'un article ou des achats.

### Public cible

Usage personnel/familial → visibilité rapide sur les stocks, valeur ajoutée = meilleure planification, moins d'oublis.

### Module choisi

**Visualisation des stocks** (liste + détail). Manipulation viendra en second temps avec une gestion de scopes pour les
utilisateurs.

## 2. Périmètre fonctionnel

### Inclus (MVP)

- `GET /api/v2/stocks` → liste des stocks
- `GET /api/v2/stocks/{stockId}` → détail d'un stock
- `GET /api/v2/stocks/{stockId}/items/{itemId}` → détail d'un item
- Entités DDD (`Stock`, `StockItem`, `Quantity`) + service `StockVisualizationService`

## 3. Cas d'usage

1.En tant qu'utilisateur, je veux pouvoir consulter mon stock d'aquarelle lorsque je suis au "Géants des beaux-arts"
afin de ne pas acheter une réference en double malgré la super promo de rentrée.

2.En tant qu'utilisateur, je veux pouvoir consulter mes stocks alimentaires pour faire ma liste de course avant de
passer ma commande drive.

## 4. Choix techniques

### Architecture

DDD avec division en modules.
Séparation entre domaine (`entities`, `services`) et API (
`controllers`, `routes`).

### Tests

TDD appliqué sur `Quantity`, `StockItem`, `Stock`, puis `StockVisualizationService`.

### Sécurité

- **V1** = routes protégées par auth Bearer (Azure)
- **V2** = ouvert (justification : itération MVP)

### Base de données

MySQL (Azure). → Prisma + migrations prévues (Jour 2).

### API

Routes REST Express `/api/v2/stocks`.

### Cloud

Déploiement cible Azure App Service + DB MySQL Azure.

## 5. Base de données

### Diagramme relationnel

![Database Schema](https://dbdiagram.io/d/StockHub_V2-68c1481a61a46d388e5f4cb9.png)

### Modèle actuel

- `users(ID, EMAIL)`
- `stocks(ID, LABEL, DESCRIPTION, USER_ID)`
- `items(ID, LABEL, DESCRIPTION, QUANTITY, STOCK_ID)`

### Relations

- **users (1) → (N) stocks** : Un utilisateur possède plusieurs stocks
- **stocks (1) → (N) items** : Un stock contient plusieurs items
- **Clés étrangères** : `stocks.USER_ID` → `users.ID`, `items.STOCK_ID` → `stocks.ID`

### Évolutions prévues

Systeme de scopes pour les utilisateurs (partage de stocks entre membres d'une famille).
Les utilisateurs "normaux" pourront faire des demandes de réapprovisionnementr au propriétaire du stok.

## 6. API (MVP)

### GET /api/v2/stocks

- **Response 200** : `[Stock]`

### GET /api/v2/stocks/{stockId}

- **Response 200** : `Stock` complet
- **Response 404** : erreur `Stock not found`

### Exemple de réponse

```json
{
  "id": 1,
  "label": "Cuisine",
  "description": "Stock alimentaire",
  "category": "alimentation",
  "items": [
    {
      "label": "Pâtes",
      "quantity": {
        "value": 5
      },
      "minimumStock": 2
    },
    {
      "label": "Riz",
      "quantity": {
        "value": 0
      },
      "minimumStock": 1
    }
  ]
}
```

## 7. Tests

### Unitaires (TDD)

- `Quantity` : valeurs invalides interdites
- `StockItem` : `isOutOfStock()`, `isLowStock()`
- `Stock` : `getTotalItems()`, `getTotalQuantity()`
- `StockVisualizationService` : cas vide, cas stocks présents, cas 404

### Intégration (à venir)

`supertest` sur `/api/v2/stocks`

## 8. Sécurité & performances

### Authentification

Auth V1 (Azure Bearer) reste active → séparation claire dans logs :

- 🔒 `/api/v1` protégé
- ✅ `/api/v2` sans auth (MVP)

### Performance

- Index SQL existants (`stocks.USER_ID`, `items.STOCK_ID`)
- Prévu avec Prisma : `include` pour éviter N+1
- Logs (`console.info`, Application Insights)

## 9. Déploiement (Azure)

### Infrastructure

- **DB** : Azure MySQL
- **Backend** : Azure App Service / Container
- **Monitoring** : Application Insights (présent, warnings dépréciation à gérer)
- **Secrets** : `.env` → `DATABASE_URL`, `AZURE_CLIENT_ID`, etc.

---

**Stack technique** : Node.js + TypeScript + Express + MySQL + Prisma  
**Architecture** : DDD + Repository Pattern  
**Tests** : Jest (TDD)  
**Cloud** : Azure (App Service + Database)