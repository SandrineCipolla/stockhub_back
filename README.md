# StockHub Backend - Module de Visualisation des Stocks

![CI/CD Pipeline](https://github.com/sandrineCipolla/stockhub_back/actions/workflows/main_stockhub-back.yml/badge.svg)
![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Security](https://img.shields.io/badge/security-npm%20audit-green)
![Node](https://img.shields.io/badge/node-20.x-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

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

- **V1** et **V2** = routes protégées par auth Bearer (Azure)

### Base de données

MySQL (Azure). → Prisma + migrations.

### API

Routes REST Express `/api/v2/stocks`.

### Cloud

Déploiement cible Azure App Service + DB MySQL Azure.

## 📚 Documentation Architecture

### Architecture Decision Records (ADRs)

Les **ADRs** documentent les décisions techniques majeures du projet avec leur contexte, alternatives considérées, et conséquences.

📖 **[Voir tous les ADRs](./docs/adr/INDEX.md)**

| #                                                                | Décision                                  | Date     |
| ---------------------------------------------------------------- | ----------------------------------------- | -------- |
| [ADR-001](./docs/adr/ADR-001-migration-ddd-cqrs.md)              | Migration vers DDD/CQRS                   | Nov 2025 |
| [ADR-002](./docs/adr/ADR-002-choix-prisma-orm.md)                | Choix de Prisma vs TypeORM                | Déc 2025 |
| [ADR-003](./docs/adr/ADR-003-azure-ad-b2c-authentication.md)     | Azure AD B2C pour authentification        | Déc 2025 |
| [ADR-004](./docs/adr/ADR-004-tests-value-objects-entities.md)    | Tests sur Value Objects et Entities       | Déc 2025 |
| [ADR-005](./docs/adr/ADR-005-api-versioning-v2.md)               | Versioning API (V2 sans V1)               | Déc 2025 |
| [ADR-006](./docs/adr/ADR-006-mysql-azure-cloud.md)               | MySQL Azure vs autres clouds              | Déc 2025 |
| [ADR-007](./docs/adr/ADR-007-code-quality-enforcement.md)        | Standards de qualité de code stricts      | Déc 2024 |
| [ADR-008](./docs/adr/ADR-008-typescript-request-type-aliases.md) | Type Aliases pour requêtes Express typées | Déc 2025 |

### Documentation complète

- 📘 [Architecture DDD/CQRS complète](./docs/architecture/DDD-CQRS-ARCHITECTURE.md)
- 📄 [Guide d'implémentation routes manipulation](./docs/ddd-manipulation-routes-implementation.md)
- 🧪 [Guide des Tests E2E](./docs/E2E_TESTS_GUIDE.md)

## 5. Base de données

### Diagramme relationnel

![Database Schema](src/docs/images/StockHub_V2.png)

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

### 💰 Gestion de la base de données Azure (Économies)

**IMPORTANT** : Pour économiser de l'argent (~15€/mois), arrêtez le serveur MySQL quand vous ne développez pas !

#### **Base de données active** :

- **Serveur** : `stockhub-database-mysql-restored`
- **Host** : `stockhub-database-mysql-restored.mysql.database.azure.com`
- **Coût actif** : ~15-20€/mois (24/7)
- **Coût arrêté** : ~0€/mois

#### **Démarrer la base de données** (avant de développer)

**Méthode 1 - Explorateur Windows (le plus simple)** :

1. Ouvrez l'explorateur de fichiers
2. Allez dans le dossier du projet `stockhub_back`
3. **Clic droit** sur `start_mysql.ps1`
4. Cliquez sur **"Exécuter avec PowerShell"**
5. ⏳ Attend 1-2 minutes
6. ✅ MySQL démarré, vous pouvez lancer votre app

**Méthode 2 - Terminal PowerShell** :

```powershell
# Depuis le dossier stockhub_back
.\start_mysql.ps1
```

**Méthode 3 - Commande manuelle** :

```powershell
az mysql flexible-server start --resource-group StockHubApp-resources --name stockhub-database-mysql-restored
```

#### **Arrêter la base de données** (quand vous avez fini de développer)

**Méthode 1 - Explorateur Windows** :

- **Clic droit** sur `stop_mysql.ps1` → "Exécuter avec PowerShell"

**Méthode 2 - Terminal PowerShell** :

```powershell
.\stop_mysql.ps1
```

**Méthode 3 - Commande manuelle** :

```powershell
az mysql flexible-server stop --resource-group StockHubApp-resources --name stockhub-database-mysql-restored
```

💡 **Astuce** : Les scripts PowerShell (`.ps1`) affichent des messages en couleur et restent ouverts pour que vous puissiez lire les informations.

#### **Workflow de développement recommandé** :

1. **Avant de commencer** : `.\start_mysql.ps1` (1-2 min)
2. **Développer** : Lancez votre application normalement
3. **Après avoir fini** : `.\stop_mysql.ps1` (économie immédiate)

**Économie estimée** : ~10€/mois si vous développez 50% du temps, ~15€/mois si vous développez rarement.

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

**Commande** :

```bash
npm run test:unit
```

### Tests d'Intégration

Tests d'intégration des services et repositories avec base de données de test.

**Commande** :

```bash
npm run test:integration
```

### Tests E2E (End-to-End) ✅

Tests fonctionnels complets avec **authentification Azure AD B2C réelle** via Playwright.

**Workflow testé** :

1. ✅ Authentification Azure AD B2C (ROPC)
2. ✅ Création d'un stock
3. ✅ Ajout d'items au stock
4. ✅ Visualisation du stock
5. ✅ Mise à jour de quantités
6. ✅ Détection des items en rupture
7. ✅ Nettoyage automatique des données de test

**⚠️ IMPORTANT - Prérequis** :

```bash
# Terminal 1 : Démarrer le serveur backend
npm run start:dev

# Terminal 2 : Une fois le serveur démarré, lancer les tests E2E
npm run test:e2e
```

**Commandes disponibles** :

```bash
# Tests E2E standard
npm run test:e2e

# Interface UI de Playwright
npm run test:e2e:ui

# Mode headed (avec navigateur visible)
npm run test:e2e:headed
```

**Documentation complète** : Voir [Guide des Tests E2E](./docs/E2E_TESTS_GUIDE.md)

**Résultat attendu** :

```
✅ 7 tests passed (14.4s)
```

## 8. 🧪 Procédure de Test Utilisateur - Module DDD

### Guide de Test Complet

Cette section décrit la procédure pour tester le module DDD de visualisation avec un compte utilisateur réel, de la
création à la visualisation.

#### 🎯 Objectif

Valider le fonctionnement complet du module DDD de visualisation en tant qu'utilisateur final, depuis la création de
compte jusqu'à la visualisation des stocks via les APIs V1 et V2.

#### 📋 Prérequis

- Navigateur web moderne avec outils de développement
- Adresse email valide pour la vérification Azure B2C
- Accès à l'application de production

#### 🚀 Procédure Étape par Étape

##### 1. Accès à l'Application

Rendez-vous sur l'application déployée :

```
https://brave-field-03611eb03.5.azurestaticapps.net/
```

##### 2. Création de Compte via Azure AD B2C

1. **Inscription** : Cliquez sur "Se connecter" ou "Créer un compte"
2. **Portail Azure B2C** : Redirection vers le portail d'authentification Azure
3. **Saisie des informations** :
   - Email valide
   - Mot de passe sécurisé
   - Informations complémentaires requises
4. **Vérification email** :
   - Consultez votre boîte email (vérifiez les spams)
   - Cliquez sur le lien de vérification reçu
   - Saisissez le code de vérification
5. **Finalisation** : Terminez la création de votre compte

##### 3. Première Connexion et Vérification

1. **Authentification** : Connectez-vous avec vos identifiants
2. **Redirection** : Validation de la redirection vers le dashboard (attention, le premier appel peut être lent du fait
   du container azure)
3. **Token JWT** : Vérifiez dans les DevTools (Application > Local Storage) la présence du token

##### 4. Test Création de Stock (API V1)

1. **Navigation** : Accédez à la section "Créer un stock"
2. **Formulaire** : Remplissez les informations :
   - **Nom** : ex. "Stock Cuisine"
   - **Description** : ex. "Produits alimentaires de la cuisine"
   - **Catégorie** : Sélectionnez une catégorie
3. **Soumission** : Cliquez sur "Créer le stock"

**🔍 Vérification Network (DevTools F12 > Network)** :

- ✅ Appel : `POST /api/v1/stocks`
- ✅ Status : `201 Created`
- ✅ Headers : `Authorization: Bearer [token]`
- ✅ Response : Objet stock créé avec ID

##### 5. Test Visualisation DDD (API V2)

1. **Liste des stocks** :
   - Naviguez vers "Mes stocks" ou "Visualisation"
   - Vérifiez l'affichage de vos stocks créés

**🔍 Vérification Network** :

- ✅ Appel : `GET /api/v2/stocks`
- ✅ Status : `200 OK`
- ✅ Response : Array de stocks avec structure DDD

2. **Détail d'un stock** :
   - Cliquez sur un stock pour voir ses détails
   - Examinez la structure des données retournées

**🔍 Vérification Network** :

- ✅ Appel : `GET /api/v2/stocks/{stockId}`
- ✅ Status : `200 OK`
- ✅ Response : Stock complet avec items et quantities

3. **Détail d'un item** (si applicable) :
   - Cliquez sur un item du stock
   - Vérifiez les détails de l'item

**🔍 Vérification Network** :

- ✅ Appel : `GET /api/v2/stocks/{stockId}/items/{itemId}`
- ✅ Status : `200 OK`
- ✅ Response : Détails de l'item avec quantity

#### 🔍 Points de Contrôle Techniques

##### API V1 (Création - Architecture Classique)

```bash
POST /api/v1/stocks
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json

{
  "label": "Stock Cuisine",
  "description": "Produits alimentaires",
  "category": "alimentation"
}

# Réponse attendue : 201 Created
```

##### API V2 (Visualisation - Architecture DDD)

```bash
GET /api/v2/stocks
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json

# Réponse attendue : 200 OK
[
  {
    "id": 1,
    "label": "Stock Cuisine",
    "description": "Produits alimentaires",
    "category": "alimentation",
    "items": [...]
  }
]
```

#### ⚠️ Limitations Connues

##### Système de Rôles (Non Implémenté)

**État actuel** :

- ⚠️ **Fonctionnalité non implémentée côté backend**
- ⚠️ **Aucun effet sur les permissions actuellement**

**Comportement observé** :

- Tous les utilisateurs ont les mêmes permissions

**À prévoir** : Implémentation future avec :

- Rôles : Propriétaire, Lecteur, Contributeur
- Permissions différenciées par rôle
- Système de partage familial

#### 📊 Métriques et Validation

**Temps de parcours** : 15-20 minutes  
**Étapes critiques** : 8 étapes principales  
**APIs testées** : 2 versions (V1 création, V2 visualisation)  
**Architecture validée** : DDD vs Classique

#### 🔄 Script de Validation Automatique

```bash
# 1. Vérification de l'application frontend
curl -I https://brave-field-03611eb03.5.azurestaticapps.net/

# 2. Récupération du token JWT
# ⚠️ PRÉREQUIS: Se connecter manuellement sur l'app web et récupérer le token
# Méthode 1: DevTools > Application > Local Storage > authToken
# Méthode 2: DevTools > Network > Copier le header Authorization d'une requête

# 3. Définir le token en variable (remplacer par votre token)
export JWT_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6..."

# 4. Test API V2 (Architecture DDD)
curl -X GET "https://your-backend-url/api/v2/stocks" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $JWT_TOKEN"

# 5. Test API V1 (Architecture Classique)
curl -X GET "https://your-backend-url/api/v1/stocks" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $JWT_TOKEN"

# 6. Test d'authentification (doit échouer avec 401/403)
curl -X GET "https://your-backend-url/api/v2/stocks" \
     -H "Content-Type: application/json"
```

#### 📝 Checklist de Test

**Avant le test** :

- [ ] Application accessible
- [ ] Email de test disponible
- [ ] DevTools du navigateur activés

**Pendant le test** :

- [ ] Création de compte réussie
- [ ] Vérification email effectuée
- [ ] Connexion fonctionnelle
- [ ] Token JWT présent
- [ ] Stock créé via API V1
- [ ] Visualisation fonctionnelle via API V2
- [ ] Appels réseau validés

**Après le test** :

- [ ] Documentation des bugs éventuels
- [ ] Validation des temps de réponse
- [ ] Cohérence des données V1 ↔ V2

Cette procédure permet de valider l'intégration complète du module DDD dans un environnement de production avec de vrais
utilisateurs.

## 9. Sécurité & performances

### Authentification

Middleware d'authentification Azure Bearer appliqué sur **toutes les routes** :

- 🔒 `/api/v1` **protégé** (Bearer Token requis)
- 🔒 `/api/v2` **protégé** (Bearer Token requis)

**Configuration actuelle** :

```typescript
// API V2 - avec authentification
app.use(
  '/api/v2',
  authenticationMiddleware, // Middleware d'auth appliqué
  stockRoutesV2
);

// API V1 - avec authentification
app.use(
  '/api/v1',
  authenticationMiddleware, // Middleware d'auth appliqué
  stockRoutes
);
```

**Token requis** : Toutes les requêtes vers `/api/v1/*` et `/api/v2/*` nécessitent un header
`Authorization: Bearer [JWT_TOKEN]`

### Performance

- Index SQL existants (`stocks.USER_ID`, `items.STOCK_ID`)
- Prévu avec Prisma : `include` pour éviter N+1
- Logs (`console.info`, Application Insights)

## 10. Déploiement (Azure)

### Infrastructure

- **DB** : Azure MySQL
- **Backend** : Azure App Service / Container
- **Monitoring** : Application Insights (présent, warnings dépréciation à gérer)
- **Secrets** : `.env` → `DATABASE_URL`, `AZURE_CLIENT_ID`, `ALLOWED_ORIGINS`, etc.

---

**Stack technique** : Node.js + TypeScript + Express + MySQL + Prisma  
**Architecture** : DDD + Repository Pattern  
**Tests** : Jest (TDD)  
**Cloud** : Azure (App Service + Database)
