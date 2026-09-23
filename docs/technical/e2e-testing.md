# Guide Complet des Tests E2E - StockHub Backend

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Démarrage rapide](#démarrage-rapide)
3. [Ce qui fonctionne](#ce-qui-fonctionne)
4. [Configuration](#configuration)
5. [Les tests en détail](#les-tests-en-détail)
6. [Problèmes rencontrés et solutions](#problèmes-rencontrés-et-solutions)
7. [Documentation technique](#documentation-technique)

---

## Introduction

Les tests E2E (End-to-End) de StockHub valident le workflow complet de gestion de stock avec **authentification Azure AD B2C réelle**. Ils utilisent Playwright pour effectuer des appels API HTTP et tester l'intégration complète du système.

### État actuel : ✅ FONCTIONNEL

**Date de mise à jour** : 3 décembre 2025

```
✅ 7 tests passed (14.4s)

Step 1: Create a new stock                    ✅
Step 2: Add first item (normal stock)          ✅
Step 3: Add second item (low stock)            ✅
Step 4: Visualize stock and verify items       ✅
Step 5: Update item quantity                   ✅
Step 6: Check for low stock items              ✅
Cleanup: Delete test data                      ✅
```

---

## Démarrage rapide

### Prérequis OBLIGATOIRES

1. **Serveur backend démarré** - Les tests E2E nécessitent un serveur actif
2. **Base de données accessible** - MySQL test doit être disponible
3. **Configuration Azure AD B2C** - Voir section Configuration

### Lancer les tests en 2 étapes

#### 1. Démarrer le serveur backend

```bash
npm run start:dev
```

**Attendez** que vous voyiez : `Server started on port 3006`

#### 2. Lancer les tests E2E

Dans un **nouveau terminal** :

```bash
npm run test:e2e
```

### ⚠️ Erreur courante : Serveur non démarré

**Symptôme** :

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:3006
```

**Cause** : Le serveur backend n'est pas en cours d'exécution.

**Solution** : Retournez à l'étape 1 et démarrez le serveur avec `npm run start:dev`

---

## 🔐 Choix de la méthode d'authentification

### Les options possibles pour l'authentification dans les tests

Nous avions **3 options principales** pour authentifier les tests E2E :

#### Option 1 : ROPC avec MSAL Node ✅ (notre choix)

**Ce qu'on utilise** : `tests/e2e/helpers/azureAuth.ts`

```typescript
import * as msal from '@azure/msal-node';

const request: msal.UsernamePasswordRequest = {
  scopes: ['access_as_user'],
  username: 'sandrine.cipolla@gmail.com',
  password: 'Test@2024',
};

const response = await msalClient.acquireTokenByUsernamePassword(request);
```

**Avantages** :

- ✅ **Rapide** : Pas de navigateur à lancer
- ✅ **Simple** : Username + password direct
- ✅ **Automatique** : Pas d'interaction utilisateur
- ✅ **Parfait pour tests API** : On teste le backend, pas le frontend
- ✅ **Reproductible** : Même résultat à chaque fois

**Inconvénients** :

- ⚠️ **Déconseillé en production** : Microsoft le déconseille pour les vraies apps
- ⚠️ **Pas de MFA** : Incompatible avec l'authentification multi-facteurs
- ⚠️ **Comptes locaux uniquement** : Ne fonctionne pas avec Google, Facebook, etc.

**Pourquoi on l'a choisi** :

- On teste uniquement l'API backend (pas de frontend)
- On a besoin d'automatisation complète pour les tests
- C'est acceptable pour les tests (pas pour la production)

#### Option 2 : Authentification interactive avec Playwright ❌ (pas adapté)

**Ce que ça aurait été** :

```typescript
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://login.microsoftonline.com/...');
await page.fill('input[type="email"]', 'test@test.com');
await page.fill('input[type="password"]', 'password');
await page.click('button[type="submit"]');
const token = await page.evaluate(() => localStorage.getItem('token'));
await browser.close();

// Puis utiliser le token pour les requêtes API
await request.get('/api/v2/stocks', {
  headers: { Authorization: `Bearer ${token}` },
});
```

**Avantages** :

- ✅ **Simule le vrai comportement utilisateur**
- ✅ **Fonctionne avec MFA, redirections, providers sociaux**
- ✅ **Plus réaliste**
- ✅ **Standard pour tests E2E frontend**

**Inconvénients** :

- ❌ **Lent** : Doit lancer un navigateur
- ❌ **Complexe** : Gestion des sélecteurs, timeouts, popups
- ❌ **Overkill pour API** : On n'a pas de page web à tester
- ❌ **Flaky** : Peut être instable (changements d'UI Azure)

**Pourquoi on ne l'a PAS choisi** :

- On teste uniquement l'API backend, pas le frontend
- Pas besoin de lancer un navigateur juste pour obtenir un token
- Trop complexe pour notre cas d'usage

**Quand l'utiliser** : Pour tester le **frontend complet** avec UI

#### Option 3 : Appels HTTP directs à Azure B2C ❌ (supprimé)

**Ce qu'on avait essayé** : `tests/e2e/helpers/directAzureAuth.ts` (supprimé)

```typescript
const axios = require('axios');
const params = new URLSearchParams({
  grant_type: 'password',
  client_id: process.env.AZURE_CLIENT_ID,
  username: process.env.AZURE_TEST_USERNAME,
  password: process.env.AZURE_TEST_PASSWORD,
  scope: 'https://stockhubb2c.onmicrosoft.com/stockhub-api/FilesRead',
});

const response = await axios.post(tokenEndpoint, params);
```

**Avantages** :

- ✅ **Très simple** : Pas de librairie MSAL
- ✅ **Contrôle total** : On voit exactement ce qui se passe

**Inconvénients** :

- ❌ **Bas niveau** : Il faut gérer manuellement tout
- ❌ **Moins maintenable** : Si Azure change son API, ça casse
- ❌ **Pas de gestion d'erreurs** : MSAL gère beaucoup de cas automatiquement
- ❌ **Réinventer la roue** : MSAL fait déjà ce travail

**Pourquoi on ne l'a PAS choisi** :

- MSAL est mieux maintenu et plus robuste
- Pas besoin de réinventer ce qui existe déjà

### Comparaison des méthodes

| Critère                      | ROPC (notre choix)  | Playwright Interactive       | HTTP Direct      |
| ---------------------------- | ------------------- | ---------------------------- | ---------------- |
| **Vitesse**                  | ✅ Rapide (< 1s)    | ❌ Lent (~5-10s)             | ✅ Rapide (< 1s) |
| **Complexité**               | ✅ Simple           | ❌ Complexe                  | ✅ Très simple   |
| **Adapté backend API**       | ✅ Parfait          | ❌ Overkill                  | ✅ OK            |
| **Adapté frontend UI**       | ❌ Non              | ✅ Parfait                   | ❌ Non           |
| **Maintenabilité**           | ✅ Bonne (MSAL)     | ⚠️ Moyenne (UI peut changer) | ❌ Faible        |
| **Recommandé par Microsoft** | ⚠️ Tests uniquement | ✅ Oui pour E2E UI           | ❌ Non           |

### Notre configuration finale

**Fichier utilisé** : `tests/e2e/helpers/azureAuth.ts`

**Dépendance** : `@azure/msal-node` (version 3.8.3)

**Flow** : ROPC (Resource Owner Password Credentials)

**Politique Azure B2C** : `B2C_1_ROPC` (spéciale pour ROPC)

**Utilisation** :

```typescript
test.beforeAll(async () => {
  const authHelper = createAzureAuthHelper();
  authToken = await authHelper.getBearerToken();
  // Token utilisé pour tous les appels API
});
```

### ⚠️ Important : ROPC est UNIQUEMENT pour les tests

**NE JAMAIS utiliser ROPC dans une vraie application** :

- 🚫 Pas pour du code de production
- 🚫 Pas pour de vrais utilisateurs finaux
- 🚫 Pas si vous avez besoin de MFA

**Utilisation acceptable de ROPC** :

- ✅ Tests E2E backend automatisés (notre cas)
- ✅ Tests d'intégration
- ✅ Scripts CI/CD
- ✅ Scripts d'administration

### Si vous faisiez des tests E2E frontend...

**Alors Playwright avec auth interactive serait le bon choix** :

```typescript
// Setup une seule fois
test('setup', async ({ page }) => {
  await page.goto('https://stockhub-frontend.com');
  await page.click('Sign in');
  await page.fill('email', 'test@test.com');
  await page.fill('password', 'Test@2024');
  await page.click('Submit');

  // Sauvegarder la session
  await page.context().storageState({ path: 'auth.json' });
});

// Réutiliser dans tous les tests
test.use({ storageState: 'auth.json' });

test('can create stock', async ({ page }) => {
  // Déjà authentifié grâce au storage state !
  await page.goto('/stocks');
  await page.click('Create stock');
});
```

---

## Ce qui fonctionne

### Configuration actuelle

- ✅ **Authentification Azure AD B2C** : ROPC flow avec MSAL Node
- ✅ **Politique utilisée** : `B2C_1_ROPC`
- ✅ **Application** : `ROPC_Auth_app` (Client ID: `a6a645f0-32fe-42cc-b524-6a3d83bbfb43`)
- ✅ **Utilisateur de test** : `sandrine.cipolla@gmail.com`
- ✅ **Scope** : `access_as_user` (custom scope de l'application)
- ✅ **Création automatique d'utilisateurs** : Le backend crée l'utilisateur en base à la première connexion
- ✅ **Nettoyage automatique** : Les données de test sont supprimées après chaque exécution

### Workflow testé

Les tests couvrent le cycle de vie complet d'un stock :

```
┌─────────────────────────────────────┐
│ 1. Authentification Azure AD B2C   │ ✅ Token ROPC obtenu
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 2. Créer un stock                   │ ✅ POST /api/v1/stocks
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 3. Ajouter items (Pommes, Bananes)  │ ✅ POST /api/v1/stocks/{id}/items
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 4. Visualiser le stock              │ ✅ GET /api/v2/stocks/{id}/items
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 5. Mettre à jour une quantité       │ ✅ PUT /api/v1/stocks/{id}/items/{id}
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 6. Détecter items en rupture        │ ✅ GET /api/v1/low-stock-items
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ 7. Nettoyer les données de test     │ ✅ DELETE /api/v1/stocks/{id}
└─────────────────────────────────────┘
```

---

## Configuration

### Variables d'environnement `.env.test`

Le fichier `.env.test` à la racine du projet doit contenir :

```bash
# Database
DATABASE_URL="mysql://root:root@localhost:3308/stockhub_test"

# Azure AD B2C Configuration for E2E Tests
AZURE_CLIENT_ID=a6a645f0-32fe-42cc-b524-6a3d83bbfb43
AZURE_TENANT_ID=stockhubb2c
AZURE_TEST_USERNAME=sandrine.cipolla@gmail.com
AZURE_TEST_PASSWORD=Test@2024

# Azure AD B2C specific configuration
AZURE_B2C_DOMAIN=stockhubb2c.b2clogin.com
AZURE_TENANT=stockhubb2c
AZURE_B2C_POLICY=B2C_1_ROPC

# API Configuration
API_BASE_URL=http://localhost:3006
```

### Variables d'environnement `.env` (serveur backend)

Pour que le serveur accepte les tokens ROPC :

```bash
# Enable ROPC policy for E2E tests
AZURE_USE_ROPC_POLICY=true

# ROPC-specific client ID
AZURE_ROPC_CLIENT_ID=a6a645f0-32fe-42cc-b524-6a3d83bbfb43
```

**⚠️ Important** : Redémarrez le serveur après modification de `.env`

### Structure des fichiers de test

```
tests/e2e/
├── stock-management/
│   └── stock-manipulation.e2e.test.ts    # Tests principaux
├── helpers/
│   ├── azureAuth.ts                      # Helper MSAL ROPC (utilisé)
│   ├── directAzureAuth.ts                # Helper HTTP direct
│   └── azureAuthInteractive.ts           # Helper interactif (non utilisé)
└── cleanup-test-data.e2e.test.ts         # Script de nettoyage
```

---

## Les tests en détail

### Test 1 : Authentification Azure AD B2C

**Fichier** : `tests/e2e/helpers/azureAuth.ts`

```typescript
const authHelper = createAzureAuthHelper();
authToken = await authHelper.getBearerToken();
```

**Ce qui se passe** :

1. Connexion à Azure AD B2C avec MSAL Node
2. Utilisation du flow ROPC (username + password)
3. Obtention d'un token JWT Bearer
4. Le token est utilisé pour tous les appels API suivants

**Logs** :

```
🔐 Authenticating with Azure AD B2C...
✅ Successfully obtained Azure AD B2C token
✅ Azure AD B2C authentication successful!
```

### Test 2 : Création d'un stock

**API** : `POST /api/v1/stocks`

```typescript
await request.post(`${apiV1}/stocks`, {
  headers: { Authorization: authToken },
  data: {
    LABEL: 'E2E Test Stock with Azure AD',
    DESCRIPTION: 'Stock created via E2E test',
  },
});
```

**Vérifications** :

- ✅ Status 201 Created
- ✅ Message de confirmation
- ✅ Récupération du stock ID

### Test 3 & 4 : Ajout d'items

**API** : `POST /api/v1/stocks/{stockId}/items`

**Item 1 - Pommes Bio (stock normal)** :

```typescript
{
    LABEL: 'Pommes Bio',
    DESCRIPTION: 'Pommes rouges biologiques',
    QUANTITY: 50,
    MINIMUM_STOCK: 10
}
```

**Item 2 - Bananes (stock faible)** :

```typescript
{
    LABEL: 'Bananes',
    DESCRIPTION: 'Bananes équitables',
    QUANTITY: 5,
    MINIMUM_STOCK: 20  // Délibérément sous le seuil
}
```

**Logs** :

```
✅ First item (Pommes) added successfully
🍎 Item ID 1: 117
✅ Second item (Bananes - low stock) added successfully
🍌 Item ID 2: 118
```

### Test 5 : Visualisation du stock

**API** : `GET /api/v2/stocks/{stockId}/items`

**Vérifications** :

- ✅ Status 200 OK
- ✅ Array de 2 items retourné
- ✅ Pommes : 50 unités
- ✅ Bananes : 5 unités
- ✅ Gestion des champs majuscules/minuscules (V1 vs V2)

**Logs** :

```
✅ Stock visualization successful - Found 2 items
🍎 Pommes Bio: 50 units
🍌 Bananes: 5 units
```

### Test 6 : Mise à jour de quantité

**API** : `PUT /api/v1/stocks/{stockId}/items/{itemId}`

```typescript
await request.put(`${apiV1}/stocks/${stockId}/items/${itemId1}`, {
  headers: { Authorization: authToken },
  data: { QUANTITY: 75 },
});
```

**Vérifications** :

- ✅ Status 200 OK
- ✅ Quantité mise à jour : 50 → 75
- ✅ Vérification via GET

**Logs** :

```
✅ Item quantity updated from 50 to 75
✅ Quantity update verified: 75 units
```

### Test 7 : Détection des items en rupture

**API** : `GET /api/v1/low-stock-items`

**Vérifications** :

- ✅ Status 200 OK
- ✅ Bananes détectées (5 unités < 20 minimum)
- ✅ Pommes non détectées (75 unités > 10 minimum)

**Logs** :

```
✅ Low stock check successful - Found 1 low stock items
🚨 Low stock item: Bananes (5/20)
```

### Nettoyage automatique

**API** : `DELETE /api/v1/stocks/{stockId}`

Exécuté dans `test.afterAll()` pour nettoyer les données de test.

**Logs** :

```
🧹 Cleaning up test data...
✅ Test stock 57 deleted successfully
🏁 E2E Stock Management Tests completed
```

---

## Problèmes rencontrés et solutions

### 1. ⚠️ Serveur backend non démarré

**LE problème le plus courant !**

**Erreur** :

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:3006
```

**Solution** :

```bash
# Terminal 1
npm run start:dev

# Attendez le message "Server started on port 3006"

# Terminal 2
npm run test:e2e
```

### 2. ❌ Impossible de créer un utilisateur de test dédié

**Problème** : Nous voulions créer un utilisateur spécifique `e2e-test@...` pour les tests, mais Azure AD B2C rend cela très difficile.

**Ce qui n'a PAS fonctionné** :

1. **Portail Azure** : Les mots de passe temporaires expirent en quelques minutes
2. **Azure CLI** : Erreurs de tenant, ne fonctionne pas bien avec B2C
3. **Microsoft Graph API** : Configuration complexe du champ `identities`
4. **Azure PowerShell** : Même problématique que CLI

**Solution adoptée** : Utiliser un compte personnel créé via le frontend

**Comment créer l'utilisateur** :

1. Ouvrir l'application frontend StockHub
2. Cliquer sur "Sign up" (inscription)
3. Créer un compte avec email + mot de passe permanent
4. Utiliser ces credentials dans `.env.test`

**Avantages** :

- ✅ Mot de passe permanent (pas temporaire)
- ✅ Pas de changement requis au premier login
- ✅ Compatible ROPC
- ✅ Fonctionne immédiatement

**TODO pour le futur** :

- Trouver comment créer programmatiquement un utilisateur B2C avec mot de passe permanent
- Documentation à consulter :
  - [Microsoft Graph API - B2C User Management](https://learn.microsoft.com/en-us/graph/api/user-post-users)
  - [B2C custom policies](https://learn.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview)

### 3. Tests qui échouent aléatoirement

**Cause** : Exécution en parallèle

**Solution** : Configuration Playwright

```typescript
// playwright.config.ts
export default defineConfig({
  workers: 1, // UN SEUL worker
  fullyParallel: false, // Pas de parallélisme
  // ...
});
```

### 4. Erreur 401 Unauthorized

**Cause** : Le backend n'est pas configuré pour accepter les tokens ROPC

**Solution** : Vérifier `.env`

```bash
AZURE_USE_ROPC_POLICY=true
AZURE_ROPC_CLIENT_ID=a6a645f0-32fe-42cc-b524-6a3d83bbfb43
```

Puis **redémarrer le serveur**.

### 5. Mismatch champs MAJUSCULES/minuscules

**Problème** : API V1 retourne `LABEL`, API V2 retourne `label`

**Solution** : Compatibilité dans les tests

```typescript
const label = item.label || item.LABEL;
const quantity = item.quantity || item.QUANTITY;
```

---

## Documentation technique

### Architecture des tests

Les tests E2E utilisent :

- **Playwright** : Framework de test
- **@azure/msal-node** : Authentification ROPC
- **dotenv** : Chargement des variables d'environnement

### Commandes disponibles

```bash
# Tests E2E standard
npm run test:e2e

# Interface UI de Playwright (recommandé pour debug)
npm run test:e2e:ui

# Mode headed (avec navigateur visible)
npm run test:e2e:headed

# Lancer un test spécifique
npx playwright test tests/e2e/stock-management/stock-manipulation.e2e.test.ts

# Voir le rapport HTML
npx playwright show-report

# Mode debug
npm run test:e2e:debug
```

### Nettoyage des anciennes données

Si vous avez accumulé des données de test dans la base :

```bash
npx playwright test tests/e2e/cleanup-test-data.e2e.test.ts
```

### Logs détaillés

Pour activer les logs détaillés de Playwright :

```bash
DEBUG=pw:api npm run test:e2e
```

Pour les logs MSAL, modifier `tests/e2e/helpers/azureAuth.ts` :

```typescript
logLevel: 3, // Verbose logging
```

---

## Documentation connexe

- **Configuration Azure AD B2C ROPC** : [azure-b2c-setup.md](./azure-b2c-setup.md)
- **Documentation complète des tests** : [azure-ad-setup-detailed.md](./azure-ad-setup-detailed.md)
- **Problèmes rencontrés en détail** : [e2e-azure-ropc-issues.md](../troubleshooting/e2e-azure-ropc-issues.md)

---

## Résumé

✅ **Les tests E2E fonctionnent !**

**Pour lancer les tests** :

1. Démarrer le serveur : `npm run start:dev`
2. Lancer les tests : `npm run test:e2e`

**Résultat attendu** : `7 tests passed (14.4s)`

**Point bloquant résolu** : Utilisation d'un compte personnel créé via le frontend pour contourner les limitations de création d'utilisateur via API.

**TODO futur** : Trouver la bonne méthode pour créer programmatiquement des utilisateurs de test dans Azure AD B2C.
