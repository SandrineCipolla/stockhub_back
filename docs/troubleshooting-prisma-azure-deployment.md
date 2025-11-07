# Résolution : Erreur 500 - Prisma Query Engine manquant sur Azure

**Date :** 7 novembre 2025
**Environnement :** Azure App Service (stockhub-back)
**Statut :** ✅ Résolu

---

## 🔴 Symptômes

### Erreur côté client (Frontend)
```
GET https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net/api/v2/stocks 500 (Internal Server Error)

TypeError: t.map is not a function
```

### Erreur côté serveur (Backend - Application Insights)
```
PrismaClientInitializationError: Invalid `prisma.stocks.findMany()` invocation

Prisma Client could not locate the Query Engine for runtime "debian-openssl-3.0.x".

This is likely caused by a bundler that has not copied "libquery_engine-debian-openssl-3.0.x.so.node"
next to the resulting bundle.

The following locations have been searched:
  /home/site/wwwroot/node_modules/.prisma/client
  /home/site/wwwroot
  /home/runner/work/stockhub_back/stockhub_back/node_modules/@prisma/client
  /home/.prisma/client
  /tmp/prisma-engines
  /home/site/wwwroot/prisma
```

---

## 🔍 Diagnostic

### Configuration vérifiée
- ✅ Base de données : `stockhub-database-mysql-restored` existe et contient les données
- ✅ Variables d'environnement Azure :
  - `DB_HOST` = `stockhub-database-mysql-restored.mysql.database.azure.com`
  - `DATABASE_URL` = `mysql://stockhubdbuser:ProjetDev@2024@stockhub-database-mysql-restored.mysql.database.azure.com:3306/stockhub`
- ✅ Authentification : Fonctionne correctement (utilisateur trouvé en base)
- ✅ Règles de firewall MySQL : Autorisent l'accès depuis Azure
- ❌ **Binaires Prisma manquants** sur Azure App Service

### Flux d'authentification
1. Utilisateur se connecte avec Azure AD B2C
2. Token JWT contient l'email (`sandrine.cipolla@gmail.com`)
3. Backend vérifie l'utilisateur en base → OK (ID=2)
4. Controller appelle `prisma.stocks.findMany()` → **CRASH**

---

## 🐛 Cause racine

Le workflow GitHub Actions `.github/workflows/main_stockhub-back.yml` suivait ce processus :

```yaml
- name: Build project
  run: npm run build

- name: Remove node_modules          # ⚠️ PROBLÈME ICI
  run: rm -rf node_modules

- name: Zip artifact for deployment
  run: zip release.zip ./* -r
```

**Problème :**
1. Le build webpack copie les binaires Prisma dans `dist/node_modules/.prisma/client/`
2. La ligne `rm -rf node_modules` **supprime tous les binaires Prisma**
3. Le déploiement zippe et envoie le code sans les binaires
4. Azure réinstalle les dépendances avec `npm install`, mais :
   - Les binaires ne sont pas régénérés correctement
   - Prisma cherche dans des chemins qui n'existent pas (`/home/runner/work/...`)

---

## ✅ Solution appliquée

### 1. Ajout du script `postinstall` dans `package.json`
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```
**But :** Régénérer automatiquement les binaires Prisma après chaque `npm install` sur Azure.

### 2. Modification du workflow GitHub Actions
**Fichier :** `.github/workflows/main_stockhub-back.yml`

**Avant :**
```yaml
- name: Build project
  run: npm run build

- name: Remove node_modules
  run: rm -rf node_modules

- name: Zip artifact for deployment
  run: zip release.zip ./* -r
```

**Après :**
```yaml
- name: Build project
  run: npm run build

- name: Zip artifact for deployment
  run: zip release.zip ./dist ./node_modules ./package.json ./package-lock.json ./prisma -r
```

**Changements :**
- ❌ Supprimé l'étape `Remove node_modules`
- ✅ Inclusion explicite de `node_modules` (avec binaires Prisma) dans le zip de déploiement
- ✅ Inclusion de `dist`, `package.json`, `package-lock.json`, et `prisma/`

---

## 📝 Commits appliqués

1. **Commit 1 :** Ajout du script postinstall
   ```
   fix: add postinstall script to generate Prisma binaries on Azure
   ```

2. **Commit 2 :** Modification du workflow
   ```
   fix: ensure Prisma binaries are deployed to Azure App Service
   - Remove the step that deletes node_modules before deployment
   - Include node_modules with Prisma binaries in deployment package
   ```

---

## 🧪 Vérification

### Test en production
1. Vidage du cache navigateur (Ctrl + Shift + R)
2. Connexion sur https://brave-field-03611eb03.5.azurestaticapps.net
3. Résultat : ✅ Les stocks s'affichent correctement, pas d'erreur 500

### Logs Azure (Stream)
```
2025-11-07 12:19:40 INFO  [security#authenticationMiddleware] Authenticating user ...
2025-11-07 12:19:40 INFO  [main] Token is valid, proceeding with authentication
2025-11-07 12:19:40 INFO  [database#readUserRepository] User ID found: 2 for OID: sandrine.cipolla@gmail.com
2025-11-07 12:19:40 INFO  [security#authenticationMiddleware] Authentication successful
```

Aucune erreur `PrismaClientInitializationError` après le déploiement.

---

## 📚 Ressources

- **Prisma Documentation :** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-azure
- **Issue similaire :** https://github.com/prisma/prisma/issues/12484
- **Binary targets Prisma :** https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options

---

## 💡 Leçons apprises

1. **Ne jamais supprimer `node_modules`** avant un déploiement qui utilise des dépendances natives (Prisma, sharp, etc.)
2. Toujours vérifier que les **binaires natifs** sont inclus dans le package de déploiement
3. Utiliser le script `postinstall` comme filet de sécurité pour régénérer les binaires si nécessaire
4. Tester le déploiement dans un environnement similaire à la production

---

## 🔗 Liens utiles

- **Backend Azure :** https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net
- **Frontend Azure :** https://brave-field-03611eb03.5.azurestaticapps.net
- **Application Insights :** ID `0e096e53-e790-4380-9c35-a69166473c16`
- **GitHub Actions :** https://github.com/SandrineCipolla/stockhub_back/actions
