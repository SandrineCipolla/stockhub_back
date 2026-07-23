# État du projet — StockHub Back

> Mis à jour le 23 juillet 2026

---

## Vue d'ensemble

| Champ            | Valeur                                                 |
| ---------------- | ------------------------------------------------------ |
| **Version**      | v2.13.0 (release 2.14.0 en attente via release-please) |
| **Stack**        | Node.js 22, Express 4, TypeScript 5.8, Prisma 6, MySQL |
| **Architecture** | DDD/CQRS — 18 ADRs documentés                          |
| **Auth**         | Azure AD B2C (Bearer JWT)                              |
| **Tests**        | 318 unitaires · 4 intégration · 4 E2E                  |
| **Prod**         | Azure App Service (West Europe)                        |
| **Staging**      | Render.com + Aiven MySQL                               |
| **Soutenance**   | RNCP7 — mars 2027 (~9 mois)                            |

---

## Ce qui est livré et fonctionnel

### API v2 — endpoints disponibles

| Méthode           | Route                              | Statut                 |
| ----------------- | ---------------------------------- | ---------------------- |
| GET               | `/api/v2/stocks`                   | ✅                     |
| POST              | `/api/v2/stocks`                   | ✅                     |
| GET               | `/api/v2/stocks/:id`               | ✅                     |
| GET               | `/api/v2/stocks/:id/items`         | ✅                     |
| POST              | `/api/v2/stocks/:id/items`         | ✅                     |
| PATCH             | `/api/v2/stocks/:id/items/:itemId` | ✅                     |
| GET               | `/api/v2/stocks/:id/collaborators` | ✅                     |
| POST/PATCH/DELETE | `/api/v2/stocks/:id/collaborators` | ✅                     |
| GET/POST          | `/api/v2/stocks/:id/contributions` | ✅                     |
| GET               | `/api/v2/stocks/:id/history`       | ✅                     |
| GET               | `/api/v2/stocks/:id/predictions`   | ✅                     |
| GET               | `/api/v2/stocks/:id/suggestions`   | ✅ (IA + déterministe) |
| GET               | `/api/v2/stocks/:id/items/:itemId` | ✅                     |

### Fonctionnalités implémentées

- **Authentification** : Azure AD B2C, tokens ROPC + PKCE
- **Autorisation** : Rôles OWNER / EDITOR / VIEWER / VIEWER_CONTRIBUTOR par stock
- **Prédictions** : Algorithme déterministe (avgDailyConsumption, trend, daysUntilEmpty)
- **Suggestions IA** : OpenRouter + Mistral Small (avec cache en base)
- **Collaboration** : Ajout / modification de rôle / suppression de collaborateurs
- **Workflow contributions** : VIEWER_CONTRIBUTOR soumet, OWNER approuve
- **Agrégat stock** : statut calculé dynamiquement (critical, low, optimal, overstocked)
- **Historique** : Traçabilité des changements de quantité (CONSUMPTION / RESTOCK / ADJUSTMENT)

---

## Qualité & outillage

- TypeScript strict — 0 erreur, 0 `any` en production
- ESLint 0 warning (max-warnings 0)
- Git hooks : pre-commit (lint + tsc), pre-push (tests + knip)
- Conventional commits enforced par commitlint
- CI/CD GitHub Actions : build, unit tests, security audit, deploy staging/prod
- Codecov badge dynamique

---

## Session du 23 juillet 2026 — ce qui a été fait

| Ticket | Action                                                             | PR      |
| ------ | ------------------------------------------------------------------ | ------- |
| #158   | Champ `note` libre sur les items (texte, 1000 car. max, optionnel) | #246 ✅ |

### #158 — Champ `note` libre sur les items (PR #246)

- Prisma : colonne `note VARCHAR(1000) NULL` sur `items`, migration écrite à la main (pattern suivi depuis #169), testée en conditions réelles sur MySQL Docker local (pas seulement build/lint)
- Domain : `StockItem.note`, `Stock.addItem()`, `AddItemToStockCommand`/`UpdateItemCommand`
- Infrastructure : `PrismaStockCommandRepository` (create/update) + `PrismaStockVisualizationRepository` (4 méthodes de lecture)
- API : DTOs, `StockVisualizationService`, `StockRequestTypes`, `StockControllerManipulation` (POST/PATCH), OpenAPI
- 8 nouveaux tests unitaires (318 total)

**Diagnostic outillage** : TestContainers indisponible dans l'environnement de dev (image `ryuk` inaccessible) → vérification end-to-end faite manuellement via script contre la base Docker locale à la place des tests d'intégration automatisés.

### Tickets créés

| #    | Titre                                                                                            | Priorité |
| ---- | ------------------------------------------------------------------------------------------------ | -------- |
| #247 | 5 vulnérabilités HIGH (`applicationinsights`/`@opentelemetry`) — Security Audit rouge sur `main` | P1       |

**#247** : sans rapport avec #158 — nouvelles CVE publiées entre le 21 et le 23 juillet sur des dépendances déjà présentes (`applicationinsights` tire des versions vulnérables de `@opentelemetry/*`). Seul fix disponible = upgrade breaking vers `applicationinsights@>=3.0.0-beta.0`, touche tout le logging applicatif (`cloudLogger`/`rootMain`) — reporté à une session dédiée plutôt que traité à la volée.

---

## Session du 18 juin 2026 — ce qui a été fait

| Ticket | Action                                                                                                                                   | PR            |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| —      | Debug auth 401 : container Docker actif depuis la veille → cache JWKS `passport-azure-ad` stale → fix : `docker compose restart api`     | —             |
| —      | Amélioration logging `authenticateMiddleware` : raison du rejet passport loggée (`reason: {info}`) pour faciliter les diagnostics futurs | commit direct |

**Workaround documenté** : 401 inexpliqués après une nuit de container allumé → `docker compose restart api` (re-fetch des clés JWKS B2C).

---

## Session du 16 juin 2026 — ce qui a été fait

| Ticket | Action                                                                                                                                       | PR            |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| #191   | Implémentation `GET /stocks/:stockId/items/:itemId` sur toutes les couches DDD/CQRS — 304 tests, OpenAPI mis à jour, couverture CI maintenue | #233 mergé ✅ |
| —      | Fix vulnérabilités high : `@babel/core` → 7.29.7, `form-data` → 4.0.6 ; `knip` ajouté en devDependency explicite ; `knip.json` nettoyé       | #234 mergé ✅ |
| —      | Activation Dependabot sur le repo backend — 2 PRs auto-ouvertes (#235 form-data, #236 js-yaml), en cours de merge                            | —             |

**En cours** : intégration côté front (appel de l'endpoint depuis l'UI) + merge des PRs Dependabot + release v2.12.0.

**Remise en route staging** : Aiven MySQL relancée (instance existante), migrations + seed exécutés. `.env.aiven` mis à jour (`sslaccept=accept_invalid_certs` pour Windows). Render pointe sur `main`.

---

## Session du 15 juin 2026 — ce qui a été fait

| Ticket | Action                                                                                                     | PR            |
| ------ | ---------------------------------------------------------------------------------------------------------- | ------------- |
| #230   | Fix dépendances vulnérables — `npm audit fix` : 73 packages mis à jour, toutes les high/critical éliminées | #231 mergé ✅ |

**Restant #230** : 9 vulnérabilités moderate dans `uuid` via `@azure/msal-node` / `passport-azure-ad` / `testcontainers` — non fixables sans `--force` (breaking change). Non bloquantes pour le CI (`--audit-level=high`).

---

## Session du 12 juin 2026 — ce qui a été fait

| Ticket         | Action                                                                                                                                            | PR            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| #227 (nouveau) | Bug : pool de connexions MySQL épuisé après inactivité — `DB_CONNECTION_LIMIT` passé de 3 à 20 dans `compose.yaml`                                | #229 mergé ✅ |
| #230 (nouveau) | Ticket ouvert : 25 vulnérabilités npm dont 1 critical (`protobufjs`) et 7 high (`axios`, `grpc-js`…) — CI Security Audit cassée depuis 3 semaines | à traiter     |

**Cause racine du #227** : chaque repository crée son propre `new PrismaClient()` — 9 pools ouverts simultanément, nodemon accumule les connexions sans les fermer. Workaround : limite relevée à 20. Fix définitif (singleton Prisma) reste à faire.

---

## Session du 21 juillet 2026 — ce qui a été fait

| Ticket | Action                                                                                                                                                                                                                                                                       | PR   |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| #237   | Dependabot `undici` 7.24.6→7.28.0 mergé                                                                                                                                                                                                                                      | #237 |
| —      | `npm audit` cassé sur toutes les PR (41 vulnérabilités, nouvelle vague d'advisories GitHub) — corrigé via `npm audit fix` (41→19, sans breaking change)                                                                                                                      | #243 |
| #169   | ✅ Enum `category` remplacé par `VARCHAR(50)` libre. Rétrocompatible (les 3 valeurs historiques restent valides). Migration testée en conditions réelles sur la DB locale (volume Docker existant, données de mars 2026 préservées, insertion d'une catégorie libre validée) | #242 |

**Reste 19 vulnérabilités moderate** (chaîne `uuid` → `@azure/msal-node`, nécessite un breaking change) — non traité, à évaluer séparément si besoin.

**Note technique** : Docker Desktop a eu un problème réseau IPv6 (connexions coupées vers le CDN CloudFront de Docker Hub) qui bloquait tout `docker pull`. Résolu en passant "Default networking mode" sur "IPv4 only" dans Docker Desktop Settings → Resources → Network.

---

## Prochaine session — par où commencer

**#158** Champ `note` libre sur les items — priorité rouge Phase 1 (2-3h)

---

## Où on en est par rapport à la roadmap

La roadmap prévoyait **Phase 1 en mai–juin 2026**. Le projet reprend exactement à cette fenêtre.

### Phase 1 — Finitions V2 (mai–juin 2026) — EN COURS

| #    | Ticket                                               | Estimation | Priorité |
| ---- | ---------------------------------------------------- | ---------- | -------- |
| #191 | ~~`GET /stocks/:id/items/:itemId`~~                  | ✅ done    | —        |
| #169 | ~~Remplacer l'enum `category` par champ free-text~~  | ✅ done    | —        |
| #158 | Champ `note` libre sur les items                     | 2-3h       | 🔴       |
| #219 | Validation Zod sur les inputs controllers            | 5-7h       | 🔴       |
| #207 | Extraire les fixtures inline vers `tests/fixtures/`  | 2-3h       | 🟡       |
| #209 | Améliorer la branch coverage (handlers, controllers) | 3-5h       | 🟡       |
| #214 | Ajouter le job integration tests dans la CI          | 4-6h       | 🟡       |
| #230 | ~~Mettre à jour les dépendances vulnérables~~        | ✅ done    | —        |
| #225 | Branch protection rules sur `main`                   | 30min      | 🟡       |

### Phase 2 — Features domaine (juil–sept 2026)

Cron prédictions (#135), suivi péremption (#133), RGPD (#138), rollback prod (#224)

### Phase 3 — IA & données (oct–déc 2026) — RNCP Bloc 2

Chaîne dépendante : études (#148, #149, #150) → Prisma Recipe (#152) → Prisma ShoppingList (#153) → CRUD SavedProject (#156) → AI shopping list (#170)

### Phase 4 — Soutenance (jan–mars 2027)

Compte démo seed (#125), SonarCloud optionnel (#205), polish doc + démo

---

## Tickets ouverts résumés

**Phase 1 (priorité immédiate) :** #158, #219, #207, #209, #214, #225 _(#191 ✅ done, #230 ✅ done, #169 ✅ done)_

**Phase 2 :** #135, #133, #138, #224, #36, #126, #131

**Phase 3 (IA) :** #148, #149, #150, #152, #153, #156, #170

**Hors scope soutenance :** #159 (tags many-to-many), #64 (SSE/WebSockets), #65 (audit log)

---

## Environnements

| Env         | URL                                                                     | Déployé depuis          |
| ----------- | ----------------------------------------------------------------------- | ----------------------- |
| **Prod**    | https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net/ | `main` (Release Please) |
| **Staging** | Render.com                                                              | branche `staging`       |
| **Local**   | http://localhost:3006                                                   | `docker compose up`     |

> ⚠️ La prod tourne sur le plan F1 Azure (quota 60min CPU/jour). Faire `npm run azure:stop` après les sessions de test pour préserver le quota.

---

## Pour reprendre rapidement

```bash
# 1. Démarrer l'environnement local
docker compose up -d

# 2. Vérifier que tout est vert
docker compose ps
curl http://localhost:3006/api/v2/stocks  # 401 attendu = API vivante

# 3. Lancer les tests
npm run test:unit

# 4. Choisir un ticket Phase 1 et créer la branche
git checkout -b feat/191-get-item-detail   # exemple
```

Le prochain ticket à attaquer selon la roadmap : **#158** (champ `note` libre sur les items).
