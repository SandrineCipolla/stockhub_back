# État du projet — StockHub Back

> Mis à jour le 13 juin 2026  
> Reprise après ~2 mois de standby (dernier commit actif : mi-avril 2026)

---

## Vue d'ensemble

| Champ            | Valeur                                                 |
| ---------------- | ------------------------------------------------------ |
| **Version**      | v2.11.0                                                |
| **Stack**        | Node.js 22, Express 4, TypeScript 5.8, Prisma 6, MySQL |
| **Architecture** | DDD/CQRS — 18 ADRs documentés                          |
| **Auth**         | Azure AD B2C (Bearer JWT)                              |
| **Tests**        | 201 unitaires · 4 intégration · 4 E2E                  |
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
| GET               | `/api/v2/stocks/:id/items/:itemId` | ❌ manquant (#191)     |

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

## Session du 12 juin 2026 — ce qui a été fait

| Ticket         | Action                                                                                                                                            | PR            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| #227 (nouveau) | Bug : pool de connexions MySQL épuisé après inactivité — `DB_CONNECTION_LIMIT` passé de 3 à 20 dans `compose.yaml`                                | #229 mergé ✅ |
| #230 (nouveau) | Ticket ouvert : 25 vulnérabilités npm dont 1 critical (`protobufjs`) et 7 high (`axios`, `grpc-js`…) — CI Security Audit cassée depuis 3 semaines | à traiter     |

**Cause racine du #227** : chaque repository crée son propre `new PrismaClient()` — 9 pools ouverts simultanément, nodemon accumule les connexions sans les fermer. Workaround : limite relevée à 20. Fix définitif (singleton Prisma) reste à faire.

---

## Prochaine session — par où commencer

**Option A — dette technique urgente** : #230 dépendances vulnérables (`npm audit fix` + vérifier les breaking changes sur `@azure/msal-node`)

**Option B — feature métier** : #191 `GET /stocks/:id/items/:itemId` (2-3h, endpoint manquant, priorité rouge Phase 1)

---

## Où on en est par rapport à la roadmap

La roadmap prévoyait **Phase 1 en mai–juin 2026**. Le projet reprend exactement à cette fenêtre.

### Phase 1 — Finitions V2 (mai–juin 2026) — EN COURS

| #    | Ticket                                                | Estimation | Priorité |
| ---- | ----------------------------------------------------- | ---------- | -------- |
| #191 | `GET /stocks/:id/items/:itemId` — endpoint manquant   | 2-3h       | 🔴       |
| #169 | Remplacer l'enum `category` par champ free-text       | 3-4h       | 🔴       |
| #158 | Champ `note` libre sur les items                      | 2-3h       | 🔴       |
| #219 | Validation Zod sur les inputs controllers             | 5-7h       | 🔴       |
| #207 | Extraire les fixtures inline vers `tests/fixtures/`   | 2-3h       | 🟡       |
| #209 | Améliorer la branch coverage (handlers, controllers)  | 3-5h       | 🟡       |
| #214 | Ajouter le job integration tests dans la CI           | 4-6h       | 🟡       |
| #230 | Mettre à jour les dépendances vulnérables (CI cassée) | 3-7h       | 🔴       |
| #225 | Branch protection rules sur `main`                    | 30min      | 🟡       |

### Phase 2 — Features domaine (juil–sept 2026)

Cron prédictions (#135), suivi péremption (#133), RGPD (#138), rollback prod (#224)

### Phase 3 — IA & données (oct–déc 2026) — RNCP Bloc 2

Chaîne dépendante : études (#148, #149, #150) → Prisma Recipe (#152) → Prisma ShoppingList (#153) → CRUD SavedProject (#156) → AI shopping list (#170)

### Phase 4 — Soutenance (jan–mars 2027)

Compte démo seed (#125), SonarCloud optionnel (#205), polish doc + démo

---

## Tickets ouverts résumés

**Phase 1 (priorité immédiate) :** #230, #191, #169, #158, #219, #207, #209, #214, #225

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

Le prochain ticket à attaquer selon la roadmap : **#191** (`GET /stocks/:id/items/:itemId`).
