# Documentation des Tests E2E avec Azure AD B2C

## Vue d'ensemble

Cette documentation décrit l'implémentation complète des tests End-to-End (E2E) pour l'API de gestion de stock avec authentification Azure AD B2C utilisant le flux ROPC (Resource Owner Password Credentials).

## ✅ État actuel : Tests E2E fonctionnels

**Date de dernière mise à jour** : 3 décembre 2025

Les tests E2E sont **opérationnels et passent avec succès** avec la configuration actuelle :

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

### Configuration actuelle qui fonctionne

- ✅ **Authentification Azure AD B2C** : ROPC flow avec MSAL Node
- ✅ **Politique utilisée** : `B2C_1_ROPC`
- ✅ **Application** : `ROPC_Auth_app` (Client ID: `a6a645f0-32fe-42cc-b524-6a3d83bbfb43`)
- ✅ **Utilisateur de test** : `sandrine.cipolla@gmail.com` (compte personnel)
- ✅ **Scope** : `access_as_user` (défini dans l'application ROPC)
- ✅ **Création automatique d'utilisateurs** : Le backend crée l'utilisateur en base à la première connexion
- ✅ **Nettoyage automatique** : Les données de test sont supprimées après chaque exécution

### Prérequis OBLIGATOIRES pour lancer les tests

1. **Démarrer le serveur backend** :

   ```bash
   npm run start:dev
   ```

2. **Une fois le serveur démarré**, lancer les tests :
   ```bash
   npm run test:e2e
   ```

**⚠️ IMPORTANT** : Si vous lancez les tests sans avoir démarré le serveur, vous obtiendrez l'erreur `ECONNREFUSED ::1:3006`.

## Architecture

### Composants principaux

1. **Tests E2E** : `tests/e2e/stock-management/stock-manipulation.e2e.test.ts`
2. **Helper d'authentification** : `tests/e2e/helpers/azureAuth.ts`
3. **Configuration Playwright** : `playwright.config.ts`
4. **Variables d'environnement** : `.env.test`
5. **Configuration backend** : `src/config/authenticationConfig.ts`

## Configuration Azure AD B2C

### Politiques (Policies)

Le projet utilise deux politiques Azure AD B2C :

1. **B2C_1_signupsignin** : Politique standard pour l'authentification utilisateur via interface web
2. **B2C_1_ROPC** : Politique Resource Owner Password Credentials pour l'authentification programmatique (tests E2E)

### Applications Azure AD

Deux applications sont configurées :

1. **Application principale** (StockHub)
   - Client ID: `dc30ef57-cdc1-4a3e-aac5-9647506a72ef`
   - Utilisée pour l'authentification web normale

2. **Application ROPC** (ROPC_Auth_app)
   - Client ID: `a6a645f0-32fe-42cc-b524-6a3d83bbfb43`
   - Utilisée exclusivement pour les tests E2E
   - Configurée avec "Allow public client flows" activé

## Configuration Backend

### Variables d'environnement (.env)

```bash
# Enable ROPC policy for E2E tests
AZURE_USE_ROPC_POLICY=true

# ROPC-specific client ID (for E2E tests)
AZURE_ROPC_CLIENT_ID=a6a645f0-32fe-42cc-b524-6a3d83bbfb43
```

### Configuration d'authentification (src/config/authenticationConfig.ts)

Le backend a été modifié pour supporter dynamiquement la politique ROPC :

```typescript
// Use ROPC policy if explicitly enabled (for E2E tests)
const useROPC = process.env.AZURE_USE_ROPC_POLICY === 'true';
const activePolicy =
  useROPC && authConfig.policies.ropc ? authConfig.policies.ropc : authConfig.policies.policyName;

// Use ROPC client ID if ROPC is enabled
const activeClientID =
  useROPC && process.env.AZURE_ROPC_CLIENT_ID
    ? process.env.AZURE_ROPC_CLIENT_ID
    : authConfig.credentials.clientID;

export const authConfigoptions: AuthConfigOptions = {
  identityMetadata: `https://${authConfig.metadata.b2cDomain}/${authConfig.credentials.tenantName}/${activePolicy}/${authConfig.metadata.version}/${authConfig.metadata.discovery}`,
  clientID: activeClientID,
  audience: activeClientID,
  policyName: activePolicy,
  // ...
};
```

### Création automatique d'utilisateurs (src/services/userService.ts)

Le service utilisateur crée automatiquement un utilisateur lors de sa première connexion :

```typescript
async convertOIDtoUserID(oid: string): Promise<UserIdentifier> {
    try {
        const userID = await this.readUserRepository.readUserByOID(oid);

        // If user doesn't exist, create it automatically
        if (!userID) {
            console.log(`User with OID ${oid} not found, creating new user...`);
            return await this.addUser(oid);
        }

        return new UserIdentifier(userID);
    } catch (error) {
        const err = error as Error;
        console.error(`Error converting OID to UserID: ${err.message}`);
        throw err;
    }
}
```

## Configuration des Tests

### Variables d'environnement (.env.test)

```bash
DATABASE_URL="mysql://root:root@localhost:3308/stockhub_test"

# Azure AD Configuration for E2E Tests
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

### Configuration Playwright (playwright.config.ts)

```typescript
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.test for E2E tests
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false, // Important: tests must run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Important: only 1 worker to ensure sequential execution
  reporter: 'html',
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3006',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'API Tests',
      testMatch: /.*\.e2e\.test\.ts/,
    },
  ],
});
```

### Helper d'authentification (tests/e2e/helpers/azureAuth.ts)

```typescript
import * as msal from '@azure/msal-node';

export interface AzureAuthHelper {
  getBearerToken(): Promise<string>;
}

export function createAzureAuthHelper(): AzureAuthHelper {
  const config: msal.Configuration = {
    auth: {
      clientId: process.env.AZURE_CLIENT_ID!,
      authority: `https://${process.env.AZURE_B2C_DOMAIN}/${process.env.AZURE_TENANT}/${process.env.AZURE_B2C_POLICY}`,
      knownAuthorities: [process.env.AZURE_B2C_DOMAIN!],
    },
  };

  const pca = new msal.PublicClientApplication(config);

  return {
    async getBearerToken(): Promise<string> {
      const usernamePasswordRequest: msal.UsernamePasswordRequest = {
        scopes: [`${process.env.AZURE_CLIENT_ID}/.default`],
        username: process.env.AZURE_TEST_USERNAME!,
        password: process.env.AZURE_TEST_PASSWORD!,
      };

      try {
        const response = await pca.acquireTokenByUsernamePassword(usernamePasswordRequest);
        console.log('✅ Successfully obtained Azure AD B2C token');
        return `Bearer ${response.accessToken}`;
      } catch (error: any) {
        console.error('❌ Failed to obtain Azure AD B2C token:', error.message);
        throw error;
      }
    },
  };
}
```

## Structure des Tests E2E

### Workflow complet (tests/e2e/stock-management/stock-manipulation.e2e.test.ts)

Le test E2E couvre le workflow complet de gestion de stock :

```typescript
test.describe('Stock Management E2E Workflow with Azure AD', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3006';
  const apiV1 = `${baseURL}/api/v1`; // POST/PUT operations
  const apiV2 = `${baseURL}/api/v2`; // GET operations
  let stockId: number;
  let itemId1: number;
  let itemId2: number;
  let authToken: string;
  const createdStockIds: number[] = []; // Pour le cleanup

  test.beforeAll(async () => {
    // Authentification Azure AD B2C
    const authHelper = createAzureAuthHelper();
    authToken = await authHelper.getBearerToken();
  });

  test('Step 1: Create a new stock', async ({ request }) => {
    // Création d'un stock
  });

  test('Step 2: Add first item (normal stock)', async ({ request }) => {
    // Ajout d'un item avec stock normal
  });

  test('Step 3: Add second item (low stock)', async ({ request }) => {
    // Ajout d'un item avec stock faible
  });

  test('Step 4: Visualize stock and verify items', async ({ request }) => {
    // Vérification de la visualisation
  });

  test('Step 5: Update item quantity', async ({ request }) => {
    // Mise à jour de quantité
  });

  test('Step 6: Check for low stock items', async ({ request }) => {
    // Vérification des items en stock faible
  });

  test.afterAll(async ({ request }) => {
    // Nettoyage des données de test
    for (const id of createdStockIds) {
      await request.delete(`${apiV1}/stocks/${id}`, {
        headers: { Authorization: authToken },
      });
    }
  });
});
```

### Points importants

1. **Ordre d'exécution** : Les tests doivent s'exécuter séquentiellement (workers: 1, fullyParallel: false)
2. **Versions d'API mixtes** :
   - API v1 : POST/PUT (création/modification) - Retourne des champs en MAJUSCULES
   - API v2 : GET (lecture) - Retourne des champs en minuscules
3. **Compatibilité des champs** : Le test gère les deux formats :
   ```typescript
   const apple = items.find((item: any) => (item.label || item.LABEL) === 'Pommes Bio');
   const appleQty = apple.quantity || apple.QUANTITY;
   ```

## Corrections apportées au Backend

### 1. Support du MINIMUM_STOCK dans addStockItem

**Fichier** : `src/controllers/stockController.ts`

```typescript
async addStockItem(req: Request, res: Response) {
    try {
        const stockID = Number(req.params.stockID);
        const item = {
            label: req.body['LABEL'],
            description: req.body['DESCRIPTION'],
            quantity: req.body['QUANTITY'],
            minimumStock: req.body['MINIMUM_STOCK'] // AJOUTÉ
        };
        await this.stockService.addStockItem(item, stockID);
        res.status(HTTP_CODE_CREATED).json({message: "Stock item added successfully."});
    } catch (err: any) {
        rootException(err)
        sendError(res, err as CustomError);
    }
}
```

### 2. Correction de la valeur hardcodée dans le repository

**Fichier** : `src/repositories/writeStockRepository.ts`

```typescript
async addStockItem(item: Partial<Stock>, stockID: number) {
    // ...
    await connection.query(
        "INSERT INTO items(id, label, description, quantity, minimum_stock, stock_id) VALUES (?, ?, ?, ?, ?, ?)",
        [
            item.id,
            item.label,
            item.description,
            item.quantity,
            item.minimumStock || 1, // MODIFIÉ (était hardcodé à 1)
            stockID,
        ]
    );
    // ...
}
```

### 3. Correction de la requête SQL low-stock

**Fichier** : `src/repositories/readStockRepository.ts`

```typescript
async readLowStockItems(userId: number) {
    let connection = await connectToDatabase();

    try {
        const [items] = (await connection.query(
            // AVANT: WHERE items.QUANTITY <= 1
            // APRÈS: WHERE items.QUANTITY <= items.MINIMUM_STOCK
            "SELECT items.*, stocks.LABEL AS stockLabel FROM items JOIN stocks ON items.STOCK_ID = stocks.id WHERE items.QUANTITY <= items.MINIMUM_STOCK AND stocks.USER_ID = ?",
            [userId]
        )) as [RowDataPacket[], FieldPacket[]];

        return items;
    } finally {
        connection.release();
    }
}
```

### 4. Correction de l'endpoint low-stock

**Route correcte** : `/api/v1/low-stock-items` (et non `/api/v1/stocks/low-stock`)

**Fichier** : `src/routes/stockRoutes.ts`

```typescript
router.get('/low-stock-items', async (req, res) => {
  try {
    await stockController.getLowStockItems(req, res);
  } catch (error) {
    console.error('Error in Get /low-stock-items:', error);
    res.status(HTTP_CODE_INTERNAL_SERVER_ERROR).json({
      error: 'Error while quering the database for low stock items',
    });
  }
});
```

## Utilitaire de nettoyage

Un test de nettoyage a été créé pour supprimer les anciennes données de test :

**Fichier** : `tests/e2e/cleanup-test-data.e2e.test.ts`

```typescript
test('Clean up all E2E test stocks', async ({ request }) => {
  const getAllResponse = await request.get(`${apiV2}/stocks`, {
    headers: { Authorization: authToken },
  });

  const stocks = await getAllResponse.json();

  // Filter test stocks
  const testStocks = stocks.filter(
    (s: any) => s.label === 'E2E Test Stock with Azure AD' || s.description?.includes('E2E test')
  );

  // Delete each test stock
  for (const stock of testStocks) {
    await request.delete(`${apiV1}/stocks/${stock.id}`, {
      headers: { Authorization: authToken },
    });
  }
});
```

**Exécution** :

```bash
npx playwright test tests/e2e/cleanup-test-data.e2e.test.ts
```

## Exécution des Tests

### Prérequis

1. **Base de données de test** : MySQL doit être démarrée
2. **Serveur backend** : Doit être lancé avec les variables ROPC activées dans `.env`
3. **Configuration Azure AD B2C** :
   - Politique B2C_1_ROPC créée et configurée
   - Application ROPC_Auth_app avec "Allow public client flows" activé
   - Utilisateur de test créé dans Azure AD B2C

### Commandes

```bash
# Démarrer le serveur backend
npm run start:dev

# Exécuter tous les tests E2E
npm run test:e2e
# ou
npx playwright test

# Exécuter un test spécifique
npx playwright test tests/e2e/stock-management/stock-manipulation.e2e.test.ts

# Exécuter le nettoyage
npx playwright test tests/e2e/cleanup-test-data.e2e.test.ts

# Voir le rapport HTML
npx playwright show-report
```

### Scripts package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

## Problèmes connus et Solutions

### 1. ⚠️ Erreur ECONNREFUSED - Serveur backend non démarré

**Symptôme** :

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:3006
```

**Cause** : Le serveur backend n'est pas en cours d'exécution.

**Solution** : **IMPORTANT - Toujours démarrer le serveur avant les tests E2E** :

```bash
# Terminal 1 : Démarrer le serveur backend
npm run start:dev

# Terminal 2 : Une fois le serveur démarré, lancer les tests E2E
npm run test:e2e
```

Les tests E2E nécessitent que le serveur soit déjà en cours d'exécution car ils testent le vrai workflow complet (authentification Azure AD + appels API réels).

### 2. ❌ Impossible de créer un utilisateur de test dédié dans Azure AD B2C

**Problème rencontré** : Nous avons essayé de créer un utilisateur spécifique pour les tests E2E dans Azure AD B2C, mais plusieurs obstacles ont été rencontrés :

#### Tentatives infructueuses :

1. **Création via le portail Azure**
   - ❌ Les mots de passe temporaires expirent en quelques minutes
   - ❌ Nécessitent un changement de mot de passe au premier login (incompatible avec ROPC)
   - ❌ Pas de moyen simple de définir un mot de passe permanent via l'interface web

2. **Création via Azure CLI**
   - ❌ Problème de tenant (connecté au tenant principal au lieu du tenant B2C)
   - ❌ Erreur : "The domain portion of the userPrincipalName property is invalid"
   - ❌ Les commandes Azure AD standards ne fonctionnent pas bien avec B2C

3. **Création via Microsoft Graph API**
   - ❌ Nécessite une authentification complexe au bon tenant B2C
   - ❌ Configuration des `identities` compliquée pour Azure AD B2C
   - ❌ Documentation peu claire pour les comptes locaux B2C

#### Solution temporaire actuelle : ✅ Utilisation d'un compte personnel

**Compte utilisé** : `sandrine.cipolla@gmail.com`

- ✅ Ce compte a été créé via le flow d'inscription standard B2C (B2C_1_signupsignin)
- ✅ Possède un mot de passe permanent qui fonctionne avec ROPC
- ✅ Fonctionne parfaitement pour les tests

**Configuration dans `.env.test`** :

```bash
AZURE_TEST_USERNAME=sandrine.cipolla@gmail.com
AZURE_TEST_PASSWORD=Test@2024
```

#### TODO : Trouver la bonne méthode pour créer des utilisateurs de test

**Pistes à explorer** :

1. **Documentation Microsoft à consulter** :
   - [Create users in Azure AD B2C](https://learn.microsoft.com/en-us/azure/active-directory-b2c/manage-users-portal)
   - [Microsoft Graph API - B2C User Management](https://learn.microsoft.com/en-us/graph/api/user-post-users)
   - [B2C custom policies for automated user creation](https://learn.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview)

2. **Solutions potentielles** :
   - Utiliser Microsoft Graph API avec les bons paramètres pour B2C
   - Créer une custom policy B2C pour la création d'utilisateurs avec mots de passe permanents
   - Utiliser Azure AD B2C PowerShell cmdlets spécifiques
   - Automatiser la création via l'API REST de B2C

3. **Documentation Playwright pour authentification** :
   - [Playwright Authentication Guide](https://playwright.dev/docs/auth)
   - [Playwright API Testing](https://playwright.dev/docs/api-testing)
   - Possibilité d'utiliser une authentification interactive puis sauvegarder le state

**Note** : Pour l'instant, la solution avec le compte personnel fonctionne parfaitement pour les tests. Cette limitation ne bloque pas le développement, mais devrait être résolue avant la mise en production pour avoir un compte de test dédié.

### 3. Erreur 401 Unauthorized

**Symptôme** : Le backend rejette les tokens ROPC

**Solution** :

- Vérifier que `AZURE_USE_ROPC_POLICY=true` dans `.env`
- Vérifier que `AZURE_ROPC_CLIENT_ID` est correctement configuré
- S'assurer que le serveur a redémarré après modification de `.env`

### 4. Erreur "User not found"

**Symptôme** : L'utilisateur n'existe pas dans la base de données

**Solution** : Le backend crée maintenant automatiquement l'utilisateur lors de sa première connexion (voir `userService.ts`)

### 5. Tests qui échouent de manière aléatoire

**Symptôme** : Les tests passent parfois mais échouent d'autres fois

**Causes possibles** :

- Tests s'exécutant en parallèle (workers > 1)
- Données de test non nettoyées entre les exécutions

**Solution** :

- Configurer `workers: 1` dans `playwright.config.ts`
- Implémenter `afterAll` pour nettoyer les données
- Exécuter le script de nettoyage régulièrement

### 6. Mismatch entre champs MAJUSCULES/minuscules

**Symptôme** : Les tests cherchent `LABEL` mais trouvent `label`

**Solution** : Utiliser une approche compatible avec les deux :

```typescript
const value = item.label || item.LABEL;
const id = item.id || item.ID;
```

### 7. Stock faible non détecté

**Symptôme** : `GET /low-stock-items` retourne un tableau vide

**Causes corrigées** :

- La requête SQL comparait avec 1 au lieu de `MINIMUM_STOCK`
- Le champ `MINIMUM_STOCK` n'était pas stocké lors de la création d'item
- Le contrôleur ne lisait pas `MINIMUM_STOCK` du body de la requête

## Dépendances

### Packages requis

```json
{
  "devDependencies": {
    "@playwright/test": "^1.57.0",
    "@azure/msal-node": "^3.8.3",
    "dotenv": "^16.4.5"
  }
}
```

### Installation

```bash
npm install --save-dev @playwright/test @azure/msal-node
npx playwright install
```

## Sécurité

### ⚠️ IMPORTANT - Ne jamais commit les credentials

Les fichiers suivants contiennent des informations sensibles et sont dans `.gitignore` :

- `.env`
- `.env.test`
- `.env.local`
- `playwright-report/`
- `test-results/`

### Credentials en production

Pour la production, utiliser des variables d'environnement sécurisées :

- Azure Key Vault
- GitHub Secrets (pour CI/CD)
- Variables d'environnement du service d'hébergement

## CI/CD

### GitHub Actions (exemple)

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: stockhub_test
        ports:
          - 3308:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Create .env.test
        run: |
          echo "AZURE_CLIENT_ID=${{ secrets.AZURE_ROPC_CLIENT_ID }}" >> .env.test
          echo "AZURE_TEST_USERNAME=${{ secrets.AZURE_TEST_USERNAME }}" >> .env.test
          echo "AZURE_TEST_PASSWORD=${{ secrets.AZURE_TEST_PASSWORD }}" >> .env.test
          # ... autres variables

      - name: Start backend server
        run: npm run start:dev &
        env:
          AZURE_USE_ROPC_POLICY: true
          AZURE_ROPC_CLIENT_ID: ${{ secrets.AZURE_ROPC_CLIENT_ID }}

      - name: Wait for server
        run: npx wait-on http://localhost:3006/health -t 30000

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Logs de debug

Pour activer les logs détaillés :

```bash
# Playwright
DEBUG=pw:api npx playwright test

# MSAL
# Activer les logs dans azureAuth.ts
```

### Vérifier la configuration

```bash
# Vérifier que les variables d'environnement sont chargées
node -e "require('dotenv').config({path: '.env.test'}); console.log(process.env.AZURE_CLIENT_ID)"

# Tester l'authentification isolément
node -e "
const helper = require('./tests/e2e/helpers/azureAuth');
const auth = helper.createAzureAuthHelper();
auth.getBearerToken().then(token => console.log('Token obtenu:', token.substring(0, 50) + '...'));
"
```

## Améliorations futures

### Court terme

1. **Améliorer la stabilité** : Résoudre le problème de crash du serveur au démarrage
2. **Ajouter plus de tests** : Couvrir les cas d'erreur et edge cases
3. **Parallélisation** : Isoler les tests pour permettre l'exécution parallèle
4. **Harmoniser l'API** : Unifier v1 et v2 pour éviter le mixing

### Long terme

1. **Mock des services externes** : Éviter la dépendance à Azure AD B2C réel
2. **Tests de performance** : Ajouter des tests de charge
3. **Tests de sécurité** : Vérifier les permissions et autorisations
4. **Documentation interactive** : Swagger/OpenAPI avec exemples

## Références

- [Playwright Documentation](https://playwright.dev/)
- [Azure AD B2C ROPC Flow](https://docs.microsoft.com/en-us/azure/active-directory-b2c/add-ropc-policy)
- [MSAL Node Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)

## Contact et Support

Pour toute question ou problème :

- Créer une issue dans le repository
- Consulter cette documentation
- Vérifier les logs du serveur et de Playwright
