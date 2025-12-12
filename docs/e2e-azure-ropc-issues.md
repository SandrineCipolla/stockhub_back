# Azure AD B2C ROPC Authentication Issues for E2E Tests

## ✅ État final : RÉSOLU - Les tests fonctionnent !

**Date de résolution** : 3 décembre 2025

Les tests E2E sont maintenant **complètement fonctionnels** avec authentification Azure AD B2C via le flux ROPC.

### Solution finale qui fonctionne

- ✅ **Authentification ROPC** : Fonctionne avec MSAL Node
- ✅ **Utilisateur** : `sandrine.cipolla@gmail.com` (compte personnel créé via B2C_1_signupsignin)
- ✅ **Scope** : `access_as_user` (custom scope de l'application ROPC)
- ✅ **Tous les tests passent** : 7/7 tests réussis

## Objectif initial
Implémenter des tests E2E automatisés avec authentification Azure AD B2C utilisant le flow ROPC (Resource Owner Password Credentials) pour éviter l'interaction manuelle.

## Configuration effectuée

### Application Azure AD B2C : ROPC_Auth_app
- **Client ID** : `a6a645f0-32fe-42cc-b524-6a3d83bbfb43`
- **Tenant** : `stockhubb2c.onmicrosoft.com`
- **User Flow** : `B2C_1_ROPC`

### Paramètres configurés dans le manifest
```json
{
  "isFallbackPublicClient": true,
  "oauth2AllowImplicitFlow": true,
  "oauth2AllowIdTokenImplicitFlow": true,
  "implicitGrantSettings": {
    "enableAccessTokenIssuance": true,
    "enableIdTokenIssuance": true
  }
}
```

### Redirect URIs configurés
- `msala6a645f0-32fe-42cc-b524-6a3d83bbfb43://auth` (MSAL only)
- `https://stockhubb2c.b2clogin.com/oauth2/nativeclient`
- `https://localhost`

### API Permissions
- Microsoft Graph : `openid`, `offline_access`
- ROPC_Auth_app : `access_as_user` (custom scope)

## Problèmes rencontrés

### 1. Erreur AADB2C90057 (Résolue)
**Erreur** : "The provided application is not configured to allow the 'OAuth' Implicit flow"

**Solution** :
- Activer `oauth2AllowImplicitFlow` dans le manifest
- Cocher les checkboxes "Access tokens" et "ID tokens" dans Implicit Grant settings
- Configurer les redirect URIs pour Mobile/Desktop applications

### 2. Erreur AADB2C90225 - Création d'utilisateur de test (CONTOURNÉE)
**Erreur** : "The username or password provided in the request are invalid"

**Cause** : Les mots de passe temporaires d'Azure AD B2C expirent en quelques minutes seulement et nécessitent un changement interactif.

**Problème principal** : Azure AD B2C ne permet pas facilement de créer des utilisateurs avec des mots de passe permanents via l'interface web pour les comptes locaux (local accounts).

## Tentatives de résolution (toutes échouées)

### Tentative 1 : Reset password avec mot de passe temporaire
- ❌ Les mots de passe temporaires expirent trop rapidement (< 5 minutes)
- ❌ Nécessitent un changement au premier sign-in (incompatible avec ROPC)
- ❌ Pas de moyen de créer un mot de passe permanent via le portail Azure

### Tentative 2 : Création d'utilisateur via Azure CLI
```bash
az ad user create --display-name "E2E Test User" --user-principal-name testuser@stockhubb2c.onmicrosoft.com
```
- ❌ Problème de tenant (connecté au tenant principal au lieu du tenant B2C)
- ❌ Erreur : "The domain portion of the userPrincipalName property is invalid"
- ❌ Les commandes `az ad` ne fonctionnent pas correctement avec B2C

### Tentative 3 : Création d'utilisateur via Microsoft Graph API
- ❌ Nécessite d'être connecté au bon tenant B2C (complexe)
- ❌ Configuration du champ `identities` compliquée pour Azure AD B2C
- ❌ Documentation Microsoft peu claire pour les comptes locaux B2C
- ❌ Nécessite des permissions spéciales et une app avec secret

### Tentative 4 : Création via Azure PowerShell
- ❌ Même problématique que Azure CLI
- ❌ Incompatibilité entre Azure AD et Azure AD B2C

## Solution de contournement adoptée ✅

**Utiliser un compte personnel créé via le flow standard B2C_1_signupsignin**

### Comment créer l'utilisateur qui fonctionne :

1. **Ouvrir l'application frontend StockHub**
2. **Cliquer sur "Sign up"** (inscription)
3. **Remplir le formulaire** avec un email et mot de passe permanent :
   - Email : `sandrine.cipolla@gmail.com`
   - Mot de passe : `Test@2024` (respectant les critères de complexité)
4. **Valider l'inscription** - Le compte est créé avec un mot de passe permanent
5. **Utiliser ces credentials dans `.env.test`**

### Pourquoi cette méthode fonctionne :

- ✅ Le mot de passe est défini de façon permanente (pas temporaire)
- ✅ Pas de changement de mot de passe requis au premier login
- ✅ Compatible avec ROPC (Resource Owner Password Credentials)
- ✅ Le compte est un "local account" dans Azure AD B2C
- ✅ Fonctionne immédiatement avec les tests E2E

### Configuration actuelle dans `.env.test` :

```bash
AZURE_TEST_USERNAME=sandrine.cipolla@gmail.com
AZURE_TEST_PASSWORD=Test@2024
```

## Problème non résolu : Création automatisée d'utilisateurs de test

**Statut** : ❌ Toujours pas de solution pour créer programmatiquement des utilisateurs de test

### Ce qui devrait être recherché :

1. **Documentation Microsoft Graph API pour B2C** :
   - Comment créer un utilisateur avec un mot de passe permanent
   - Format exact du champ `identities` pour les comptes locaux B2C
   - Permissions requises pour l'application

2. **Custom Policies Azure AD B2C** :
   - Possibilité de créer une custom policy pour la création d'utilisateurs
   - Configuration XML du Identity Experience Framework
   - Trop complexe pour ce besoin ?

3. **Scripts PowerShell ou Azure CLI spécifiques à B2C** :
   - Existence de cmdlets spécifiques pour B2C (à vérifier)
   - Différence entre Azure AD standard et B2C

4. **Playwright avec authentification interactive** :
   - Automatiser la création de compte via le frontend
   - Sauvegarder le state d'authentification
   - Voir [Playwright Authentication Guide](https://playwright.dev/docs/auth)

### Liens de documentation à explorer :

- [Create users in Azure AD B2C](https://learn.microsoft.com/en-us/azure/active-directory-b2c/manage-users-portal)
- [Microsoft Graph API - B2C User Management](https://learn.microsoft.com/en-us/graph/api/user-post-users)
- [B2C custom policies](https://learn.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview)
- [Graph API - Create user with password](https://learn.microsoft.com/en-us/graph/api/user-post-users?view=graph-rest-1.0&tabs=http)

## Recommandation actuelle

**Pour l'instant : Utiliser la solution de contournement (compte personnel)**

La création manuelle via le flow d'inscription fonctionne parfaitement et ne bloque pas le développement. Cette limitation devrait être résolue avant la mise en production pour avoir un compte de test dédié, mais ce n'est pas critique pour le moment.

### Si vous devez créer un nouvel utilisateur de test :

1. Utiliser le flow d'inscription du frontend (`B2C_1_signupsignin`)
2. Créer un compte avec un email dédié (ex: `e2e-test@yourdomain.com`)
3. Définir un mot de passe permanent fort
4. Mettre à jour `.env.test` avec les nouveaux credentials

## Documentation Azure AD B2C ROPC

- [Set up ROPC flow in Azure AD B2C](https://learn.microsoft.com/en-us/azure/active-directory-b2c/add-ropc-policy)
- [ROPC limitations](https://learn.microsoft.com/en-us/azure/active-directory-b2c/add-ropc-policy#limitations)
- [Troubleshooting AADB2C90057](https://stackoverflow.com/questions/61554550/azure-ad-b2c-error-aadb2c90057-when-i-am-not-trying-to-use-the-implicit-flow)

## Notes importantes

- **ROPC ne supporte que les comptes locaux** - pas de fédération avec Google, Facebook, etc.
- **Les mots de passe temporaires ne fonctionnent pas avec ROPC**
- **Azure AD B2C sera deprecated le 1er mai 2025** pour les nouveaux clients
- Pour les tests automatisés, préférer l'authentification interactive avec Playwright
