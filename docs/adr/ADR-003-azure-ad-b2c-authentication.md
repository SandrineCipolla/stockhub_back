# ADR-003: Azure AD B2C pour l'authentification

**Date:** 2025-12-17
**Statut:** ✅ Accepté
**Décideurs:** Sandrine Cipolla, Équipe de développement StockHub

---

## Contexte

Le projet StockHub nécessite un système d'authentification et d'autorisation sécurisé pour gérer les utilisateurs et protéger les ressources. Les exigences incluaient :

- **Sécurité :** Standards OAuth 2.0 / OpenID Connect
- **Simplicité :** Pas besoin de gérer nous-mêmes les mots de passe
- **Coût :** Budget limité (projet étudiant/RNCP)
- **Scalabilité :** Support de croissance future
- **Intégration :** Compatible avec Azure (backend déjà sur Azure)

## Décision

**Azure Active Directory B2C** (Azure AD B2C) a été choisi comme solution d'authentification pour StockHub.

##Raisons

### 1. Tier gratuit généreux

**Azure AD B2C** offre :
- ✅ **50,000 utilisateurs actifs mensuels gratuits**
- ✅ **50,000 authentifications/mois gratuites**

Pour un projet StockHub en phase développement/évaluation, c'est largement suffisant.

**Comparaison coût :**
| Service | Gratuit jusqu'à | Prix après |
|---------|-----------------|------------|
| Azure AD B2C | 50k MAU | $0.00325/MAU |
| Auth0 | 7,000 MAU | $23/mois (Essentials) |
| Firebase Auth | Illimité | Gratuit (mais lock-in Google) |

### 2. Standards OAuth 2.0 / OpenID Connect

Azure AD B2C implémente les **standards ouverts** :
- OAuth 2.0 pour l'autorisation
- OpenID Connect pour l'authentification
- JWT (JSON Web Tokens) pour les tokens

**Avantage :** Pas de protocole propriétaire, portabilité possible.

```typescript
// Middleware Express standard JWT
app.use(passport.authenticate('oauth-bearer', { session: false }));

// Token JWT décodé
{
  "sub": "00000000-0000-0000-0000-000000000000",  // User OID
  "aud": "api://stockhub-api",
  "iss": "https://stockhub.b2clogin.com/...",
  "exp": 1702345678
}
```

### 3. Intégration Microsoft ecosystem

Le backend StockHub utilise déjà Azure :
- Azure MySQL Flexible Server
- Azure Application Insights (monitoring)

**Avantages intégration :**
- Facturation centralisée (un seul portail Azure)
- Logs centralisés (Azure Monitor)
- Réseau privé possible (VNet integration)

### 4. Fonctionnalités avancées incluses

- ✅ Multi-Factor Authentication (MFA)
- ✅ Social logins (Google, Facebook, etc.)
- ✅ Custom policies (personnalisation flows)
- ✅ Password reset self-service
- ✅ Branding personnalisable

### 5. Sécurité enterprise-grade

- Conformité : ISO 27001, SOC 2, GDPR
- Protection contre attaques (brute force, DDoS)
- Rotation automatique des clés de signature

---

## Alternatives considérées

### Alternative 1: Auth0

**Avantages :**
- ✅ Excellent DX (documentation, SDKs)
- ✅ Interface UI intuitive
- ✅ Large communauté

**Inconvénients :**
- ❌ Tier gratuit limité : **7,000 MAU** (vs 50,000 Azure)
- ❌ Prix élevé après : **$23/mois minimum**
- ❌ Vendor lock-in (plus difficile de migrer qu'avec OAuth standard)

**Pourquoi rejeté :** Tier gratuit trop limité pour scalabilité future. Coût prohibitif pour projet étudiant si dépassement.

---

### Alternative 2: Firebase Authentication

**Avantages :**
- ✅ Gratuit illimité (pas de limite MAU)
- ✅ Setup très rapide
- ✅ Bonne intégration avec Firebase (Firestore, etc.)

**Inconvénients :**
- ❌ **Lock-in Google** (écosystème Firebase propriétaire)
- ❌ Moins de fonctionnalités enterprise (MFA basique)
- ❌ Pas d'intégration native avec Azure backend
- ❌ Custom claims limités

**Pourquoi rejeté :** Vendor lock-in Google trop fort. Backend déjà sur Azure, mixer les providers complexifie l'architecture.

---

### Alternative 3: JWT custom (backend maison)

**Avantages :**
- ✅ Contrôle total
- ✅ Pas de coût externe
- ✅ Pas de dépendance tierce

**Inconvénients :**
- ❌ **Sécurité à charge** : gestion mots de passe, hashing, salt
- ❌ Pas de MFA natif
- ❌ Pas de social logins
- ❌ Maintenance complexe (rotation clés, password reset, etc.)
- ❌ Risque de vulnérabilités (OWASP top 10)

**Pourquoi rejeté :** Trop risqué pour projet évalué. Réinventer la roue pour l'authentification est une mauvaise pratique. Focus sur la valeur métier (gestion stocks), pas sur l'auth.

---

### Alternative 4: AWS Cognito

**Avantages :**
- ✅ Tier gratuit : 50,000 MAU (équivalent Azure)
- ✅ Intégration AWS native
- ✅ OAuth 2.0 / OpenID Connect

**Inconvénients :**
- ❌ Backend déjà sur Azure (mixer Azure + AWS = complexité)
- ❌ DX moins bonne qu'Auth0/Azure (configuration complexe)
- ❌ Custom UI moins flexible

**Pourquoi rejeté :** Cohérence cloud provider. Éviter de mixer Azure et AWS pour simplifier architecture.

---

## Conséquences

### Positives ✅

1. **Coût maîtrisé**
   - Gratuit pour toute la phase développement/évaluation
   - Coût prévisible si scaling future

2. **Sécurité garantie**
   - Pas de gestion de mots de passe côté backend
   - Standards OAuth 2.0 / OIDC
   - Conformité GDPR native

3. **Focus métier**
   - Équipe se concentre sur gestion stocks (valeur ajoutée)
   - Pas de temps perdu sur implémentation auth

4. **Évolutivité**
   - MFA activable facilement
   - Social logins ajoutables sans refactoring
   - Custom policies pour flows complexes

---

### Négatives ⚠️

1. **Vendor lock-in Microsoft**
   - Migration vers autre provider nécessiterait refactoring
   - Dépendance à la disponibilité Azure AD B2C
   - **Mitigation :** Utilisation de standards OAuth/OIDC (portabilité possible vers Auth0, Cognito)

2. **Configuration initiale complexe**
   - Création tenant B2C
   - Configuration User Flows
   - Enregistrement applications (Web, API)
   - **Mitigation :** Documentation interne créée, onboarding simplifié

3. **Custom UI limitée**
   - Personnalisation des pages de login limitée (CSS custom seulement)
   - **Mitigation :** Acceptable pour projet de cette taille (branding basique suffisant)

---

### Risques

**Risque 1 : Changement de pricing Azure**
- **Impact :** Coût pourrait augmenter si Microsoft change tier gratuit
- **Probabilité :** Faible (pricing stable depuis 3+ ans)
- **Mitigation :** Standards OAuth permettent migration vers Auth0/Cognito si nécessaire

**Risque 2 : Disponibilité service**
- **Impact :** Si Azure AD B2C down, authentification impossible
- **Probabilité :** Très faible (SLA 99.9%)
- **Mitigation :** Acceptable pour projet étudiant (pas de SLA contractuel)

---

## Validation

### Métriques de succès

✅ **Fonctionnel :**
- Authentification JWT fonctionnelle : ✅ Vérifié
- Middleware Express intégré : ✅ passport-azure-ad
- Tokens validés côté backend : ✅ Tests E2E passent

✅ **Sécurité :**
- Pas de mots de passe stockés côté backend : ✅ Vérifié
- Tokens JWT avec expiration : ✅ exp: 1h (configurable)
- Middleware rejette tokens invalides : ✅ Tests unitaires

✅ **Coût :**
- Coût actuel : **$0.00/mois** (tier gratuit)
- Utilisateurs actifs : < 50 (largement sous la limite)

---

## Liens

- **Documentation Azure AD B2C :** https://learn.microsoft.com/en-us/azure/active-directory-b2c/
- **Code concerné :**
  - `src/middleware/authMiddleware.ts` (validation JWT)
  - `src/services/userService.ts` (conversion OID → UserID)
- **Configuration :** Variables d'environnement `.env`:
  - `AZURE_AD_B2C_TENANT_NAME`
  - `AZURE_AD_B2C_CLIENT_ID`
  - `AZURE_AD_B2C_POLICY_NAME`
- **Issue GitHub :** Setup authentification (projet initial)

---

**Note :** Cette décision a été validée au début du projet et reste pertinente. Aucun problème de sécurité ou de coût n'a été rencontré.