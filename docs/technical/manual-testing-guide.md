# Procédure de test utilisateur manuel

Valide le fonctionnement complet du module DDD depuis la création de compte jusqu'à la manipulation des stocks, sans dépendre de Playwright. Utile pour une vérification rapide en environnement réel (staging ou prod).

## Prérequis

- Navigateur web avec DevTools
- Adresse email valide pour Azure B2C
- Application frontend : https://brave-field-03611eb03.5.azurestaticapps.net (prod) ou https://stock-hub-v2-front-git-staging-sandrinecipollas-projects.vercel.app (staging)

## Procédure

### 1. Créer un compte via Azure AD B2C

1. Accéder à l'application frontend (voir Prérequis)
2. Cliquer "Se connecter" → portail Azure B2C
3. Créer un compte (email + mot de passe + vérification email)

### 2. Vérifier l'authentification

- DevTools → Application → Local Storage → token JWT présent
- DevTools → Network → header `Authorization: Bearer [token]` sur les requêtes

### 3. Tester l'API V2

**Liste des stocks** :

```bash
GET /api/v2/stocks
Authorization: Bearer [JWT_TOKEN]
# → 200 OK, array de stocks
```

**Créer un stock** :

```bash
POST /api/v2/stocks
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json

{ "label": "Stock Cuisine", "description": "Produits alimentaires", "category": "alimentation" }
# → 201 Created
```

**Vérification Network (DevTools F12 > Network)** :

- `GET /api/v2/stocks` → 200 OK, structure DDD
- `POST /api/v2/stocks` → 201 Created
- `PATCH /api/v2/stocks/:id` → 200 OK
- `DELETE /api/v2/stocks/:id` → 204 No Content

### Script de validation rapide (curl)

Sur Azure F1 (prod), démarrer l'app avant les tests (`npm run azure:start`) et l'arrêter après (`npm run azure:stop`) pour préserver le quota.

```bash
export JWT_TOKEN="eyJ0eXAiOiJKV1Qi..."  # Token récupéré depuis DevTools

# Test sur staging (toujours disponible)
curl -X GET "https://stockhub-back.onrender.com/api/v2/stocks" \
     -H "Authorization: Bearer $JWT_TOKEN"

# Test sans token (doit retourner 401)
curl -X GET "https://stockhub-back.onrender.com/api/v2/stocks"
```

### Checklist de test

- [ ] Création de compte réussie + vérification email
- [ ] Connexion fonctionnelle + token JWT présent
- [ ] `GET /api/v2/stocks` → 200 OK
- [ ] `POST /api/v2/stocks` → 201 Created
- [ ] `PATCH /api/v2/stocks/:id` → 200 OK
- [ ] `DELETE /api/v2/stocks/:id` → 204 No Content
- [ ] Routes sans token → 401 Unauthorized
