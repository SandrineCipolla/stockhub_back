# État des lieux — Connexion Front V2 ↔ Back

> **Mode d'emploi** : Dépose ce fichier dans le repo `stockHub_V2_front`.
> Dans Claude Code : **"Lis ETAT_CONNEXION_FRONT_BACK.md et exécute le diagnostic"**
> Mode diagnostic uniquement — ne modifie rien.

---

## CONTEXTE

La connexion front V2 ↔ back était en cours lors d'une session précédente.
Symptôme observé : le front appelait `localhost:3006/api/v2/stocks` mais recevait 401
car le token Bearer Azure B2C n'était pas correctement attaché aux headers.

**Stack** :

- Front : React 19 + TypeScript + MSAL Azure B2C + Vite (`localhost:5173`)
- Back : Node.js + Express + Azure B2C JWT (`localhost:3006` / Azure App Service)
- Auth : Azure AD B2C, token Bearer dans header `Authorization`

---

## DIAGNOSTIC 1 — Fichiers de service API

```bash
# Lister les fichiers de services API
find src -name "*api*" -o -name "*Api*" -o -name "*service*" -o -name "*Service*" | grep -v node_modules | grep -v test | grep -v spec

# Afficher le contenu du fichier principal d'appels API
# (probablement src/services/stocksAPI.ts ou src/api/*)
```

**Questions à répondre** :

- Existe-t-il un fichier centralisé pour les appels API (ex: `stocksAPI.ts`, `apiClient.ts`) ?
- Le token Bearer est-il récupéré et attaché au header `Authorization` ?
- Y a-t-il un intercepteur HTTP ou une fonction `getAuthHeader()` ?

---

## DIAGNOSTIC 2 — Gestion du token MSAL

```bash
# Chercher comment le token est acquis et utilisé
grep -rn "acquireToken\|getAccessToken\|Authorization\|Bearer\|authToken\|msalInstance" src/ --include="*.ts" --include="*.tsx" | grep -v test | grep -v spec
```

**Questions à répondre** :

- Où est défini le scope Azure B2C pour l'API ? (ex: `https://stockhubb2c.onmicrosoft.com/...`)
- Le token est-il acquis avec `acquireTokenSilent` avant chaque appel API ?
- Y a-t-il une gestion du cas où `acquireTokenSilent` échoue (fallback `acquireTokenPopup`) ?

---

## DIAGNOSTIC 3 — Variables d'environnement

```bash
# Vérifier les fichiers .env
ls -la .env* 2>/dev/null || echo "Aucun fichier .env trouvé"
cat .env.local 2>/dev/null || cat .env 2>/dev/null || echo "Fichier .env absent"

# Vérifier ce qui est utilisé dans le code
grep -rn "VITE_API\|VITE_BACK\|import.meta.env" src/ --include="*.ts" --include="*.tsx" | grep -v test
```

**Questions à répondre** :

- La variable d'URL du back existe-t-elle ? (ex: `VITE_API_SERVER_URL`, `VITE_API_BASE_URL`)
- Pointe-t-elle vers `http://localhost:3006` en local et vers l'URL Azure en prod ?
- Y a-t-il un `.env.example` avec les variables attendues ?

---

## DIAGNOSTIC 4 — Pages et composants connectés vs mockés

```bash
# Chercher les pages principales
ls src/pages/ 2>/dev/null || ls src/views/ 2>/dev/null

# Identifier ce qui est encore mocké (données statiques)
grep -rn "mockData\|fakeData\|staticData\|\[\].*stocks\|hardcoded" src/ --include="*.ts" --include="*.tsx" | grep -v test | grep -v node_modules

# Identifier ce qui appelle vraiment l'API
grep -rn "fetch\|axios\|useQuery\|apiClient\|stocksAPI" src/ --include="*.ts" --include="*.tsx" | grep -v test | grep -v node_modules
```

**Questions à répondre** :

- Quelles pages/composants appellent déjà le vrai back ?
- Quelles pages utilisent encore des données mockées ?
- Y a-t-il un hook de data fetching centralisé (ex: `useStocks`, `useStockItems`) ?

---

## DIAGNOSTIC 5 — CORS et configuration réseau

```bash
# Vérifier la config Vite (proxy éventuel)
cat vite.config.ts

# Vérifier si un proxy est configuré pour éviter les problèmes CORS en dev
grep -n "proxy\|cors\|3006" vite.config.ts
```

**Questions à répondre** :

- Y a-t-il un proxy Vite vers `localhost:3006` ? (évite les problèmes CORS en dev)
- Ou les appels vont-ils directement vers le back (nécessite CORS configuré côté back) ?

---

## DIAGNOSTIC 6 — État des routes front vs endpoints back

Liste les routes front existantes et pour chacune indique si elle est connectée au back :

| Route front         | Composant/Page | Données mockées ou API réelle ? | Endpoint back correspondant    |
| ------------------- | -------------- | ------------------------------- | ------------------------------ |
| `/` ou `/stocks`    | ?              | ?                               | `GET /api/v2/stocks`           |
| `/stocks/:id`       | ?              | ?                               | `GET /api/v2/stocks/:id`       |
| `/stocks/:id/items` | ?              | ?                               | `GET /api/v2/stocks/:id/items` |
| Création stock      | ?              | ?                               | `POST /api/v2/stocks`          |
| Modification stock  | ?              | ?                               | `PATCH /api/v2/stocks/:id`     |
| Suppression stock   | ?              | ?                               | `DELETE /api/v2/stocks/:id`    |

---

## FORMAT DE SORTIE ATTENDU

Génère un fichier `ETAT_CONNEXION_RESULTS.md` avec :

```markdown
# État de la connexion Front V2 ↔ Back

Date : [date]

## Résumé

- Fichier API centralisé : ✅ / ❌ — [nom du fichier]
- Token Bearer attaché : ✅ / ❌ / ⚠️ Partiel — [détail]
- Variables d'env configurées : ✅ / ❌ — [variables trouvées]
- Proxy Vite configuré : ✅ / ❌

## Pages connectées au back

- [liste]

## Pages encore mockées

- [liste]

## Problème principal identifié

[Description précise du blocage restant, avec extrait de code]

## Actions à faire pour compléter la connexion

1. 🔴 [action bloquante]
2. 🟡 [action importante]
3. 🟢 [amélioration]
```

Dépose ce fichier dans `documentation/` et reviens avec les résultats.
