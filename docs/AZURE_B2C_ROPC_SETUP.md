# Configuration Azure AD B2C pour les Tests E2E avec ROPC

Ce guide explique comment configurer Azure AD B2C pour permettre le flux ROPC (Resource Owner Password Credentials)
nécessaire pour vos tests E2E automatisés.

## ⚠️ Important

Le flux ROPC ne doit être utilisé QUE pour les tests automatisés. En production, utilisez toujours les flux
interactifs (authorization code flow).

## 📋 Étapes de configuration

### 1. Configuration de l'Application Azure AD B2C

1. **Accédez au portail Azure** : https://portal.azure.com
2. Naviguez vers votre **tenant Azure AD B2C**
3. Allez dans **App registrations**
4. Sélectionnez votre application (celle avec le `AZURE_CLIENT_ID`)

### 2. Activation des flux publics

1. Dans votre application, allez dans **Authentication**
2. Descendez vers la section **Advanced settings**
3. **Activez** "Allow public client flows"
    - Mettez cette option sur **Yes**
4. Cliquez sur **Save**

### 3. Configuration des permissions API ⭐ DÉTAILLÉ

1. Allez dans **API permissions**
2. Vous devez avoir **EXACTEMENT** ces permissions :

   **a) Microsoft Graph (permissions déléguées):**
    - ✅ `openid` - Sign in and read user profile
    - ✅ `offline_access` - Maintain access to data you have given it access to

   **b) Votre propre API (si vous en avez exposé une):**
    - ✅ Votre scope personnalisé (généralement votre `AZURE_CLIENT_ID`)

   **c) Permissions minimales pour ROPC:**
   ```
   Microsoft Graph:
   - openid (Delegated)
   - offline_access (Delegated)
   
   Votre API B2C (optionnel):
   - [Votre-Client-ID] (Delegated)
   ```

3. **IMPORTANT**: Cliquez sur **Grant admin consent for [votre-tenant]**
4. Vérifiez que toutes les permissions montrent **"Granted"** en vert

### 4. Configuration spécifique pour ROPC dans B2C

1. **Dans votre User Flow (B2C_1_signinsignup):**
    - Allez dans **Properties**
    - **Activez** "Username" comme Local account sign-in page
    - **Application claims** doivent inclure :
        - ✅ `Object ID` (obligatoire pour votre backend)
        - ✅ `Display Name`
        - ✅ `Given Name` et `Surname` (optionnel)

2. **Permissions API exactes requises:**
   ```
   API / Permissions name                          Type        Status
   Microsoft Graph
   ├── openid                                      Delegated   ✅ Granted
   └── offline_access                              Delegated   ✅ Granted
   
   [Votre API B2C] (si applicable)
   └── [Votre-Client-ID]                          Delegated   ✅ Granted
   ```

### 5. Vérification des scopes dans votre code

Votre helper d'auth utilise automatiquement le bon scope :

```typescript
// Pour Azure AD B2C, utilise le client ID comme scope
const scopes = [process.env.AZURE_CLIENT_ID!]
```

### 6. Test de la configuration

Une fois la configuration terminée, testez avec :

```bash
node test-azure-auth.js
```

Si tout est correctement configuré, vous devriez voir :

```
🔐 Testing Azure AD authentication...
📋 Checking environment variables: ✅ All present
🔑 Attempting to get token...
✅ Token obtained successfully!
👤 Getting user OID...
✅ User OID: [votre-user-oid]
🎯 Azure AD authentication test successful!
```

## 🔄 Solution temporaire (en attendant la configuration)

En attendant que vous configuriez ROPC, vous pouvez utiliser un token pré-généré :

1. **Obtenez un token temporaire** depuis votre application frontend ou via un test interactif
2. **Ajoutez-le à votre `.env.test`** :
   ```
   AZURE_TEST_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6...
   ```
3. **Lancez vos tests** - le helper utilisera automatiquement ce token

## 🚀 Lancement des tests E2E

Une fois l'authentification configurée (ROPC ou token temporaire) :

```bash
# Testez l'authentification d'abord
node test-azure-auth.js

# Puis lancez les tests E2E complets
npm run test:e2e
```

## 🔍 Dépannage

### Erreur "invalid_request" avec scopes

- Vérifiez que vous utilisez le bon scope (client ID pour B2C)
- Assurez-vous que la politique B2C est correcte

### Erreur "unauthorized_client"

- Activez "Allow public client flows" dans Authentication
- Vérifiez les permissions API

### Erreur "invalid_grant"

- Vérifiez que l'utilisateur existe dans le tenant B2C
- Vérifiez que le mot de passe est correct
- Assurez-vous que l'utilisateur peut se connecter via la politique configurée

## 📝 Variables d'environnement requises

Votre `.env.test` doit contenir :

```bash
# Azure AD B2C Configuration
AZURE_CLIENT_ID=your-client-id
AZURE_TENANT_ID=your-tenant-name.onmicrosoft.com
AZURE_B2C_DOMAIN=your-tenant-name.b2clogin.com
AZURE_B2C_POLICY=B2C_1_signinsignup

# Test User Credentials
AZURE_TEST_USERNAME=testuser@yourdomain.com
AZURE_TEST_PASSWORD=YourTestPassword123!

# Optional: Pre-generated token (temporary solution)
# AZURE_TEST_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...

# API Configuration
API_BASE_URL=http://localhost:3006
```

Une fois configuré, vos tests E2E utiliseront l'authentification Azure AD réelle ! 🎉
