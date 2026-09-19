# État du projet StockHub Back

> Mis à jour le 19 septembre 2026

Tableau de bord de l'état courant du backend et point de reprise. La planification vit dans [docs/ROADMAP-GLOBAL.md](docs/ROADMAP-GLOBAL.md), les endpoints dans [docs/openapi.yaml](docs/openapi.yaml), le suivi des tickets sur le [GitHub Project](https://github.com/users/SandrineCipolla/projects/3).

---

## Vue d'ensemble

| Champ            | Valeur                                                 |
| ---------------- | ------------------------------------------------------ |
| **Version**      | v2.14.0                                                |
| **Stack**        | Node.js 22, Express 4, TypeScript 5.8, Prisma 6, MySQL |
| **Architecture** | DDD/CQRS, 20 ADR documentés                            |
| **Auth**         | Azure AD B2C (Bearer JWT)                              |
| **Tests**        | 318 unitaires, 4 intégration, 4 E2E                    |
| **Prod**         | Azure App Service (West Europe)                        |
| **Staging**      | Render.com et Aiven MySQL                              |
| **Soutenance**   | RNCP7, mars 2027                                       |

Les environnements et leurs URL sont décrits dans le [README](README.md#environnements).

---

## Ce qui est livré et fonctionnel

La liste des endpoints est dans [docs/openapi.yaml](docs/openapi.yaml), consultable sur `/api-docs` d'un environnement démarré.

- **Authentification** : Azure AD B2C, tokens ROPC et PKCE
- **Autorisation** : rôles OWNER, EDITOR, VIEWER, VIEWER_CONTRIBUTOR par stock
- **Prédictions** : algorithme déterministe (`avgDailyConsumption`, `trend`, `daysUntilEmpty`)
- **Suggestions IA** : OpenRouter et Mistral Small, avec cache en base
- **Collaboration** : ajout, modification de rôle et suppression de collaborateurs
- **Workflow contributions** : un VIEWER_CONTRIBUTOR soumet, un OWNER approuve
- **Agrégat stock** : statut calculé dynamiquement (critical, low, optimal, overstocked)
- **Historique** : traçabilité des changements de quantité (CONSUMPTION, RESTOCK, ADJUSTMENT)

---

## Qualité et outillage

- TypeScript strict, 0 erreur, 0 `any` en production
- ESLint 0 warning (`--max-warnings 0`)
- Git hooks : pre-commit (lint et tsc), pre-push (tests et knip)
- Conventional commits vérifiés par commitlint
- CI/CD GitHub Actions : build, tests unitaires, audit de sécurité, déploiement staging et prod
- Badge de couverture Codecov

---

## Sessions récentes

### 24 juillet 2026

Six migrations Prisma jamais appliquées en production, `GET` et `POST /api/v2/stocks` cassés pour tous les utilisateurs. Diagnostic, correctif et gap de process encore ouvert : [docs/troubleshooting/prod-migration-drift.md](docs/troubleshooting/prod-migration-drift.md).

### 23 juillet 2026

| Ticket | Action                                                        | PR   |
| ------ | ------------------------------------------------------------- | ---- |
| #158   | Champ `note` libre sur les items (texte, 1000 caractères max) | #246 |
| #247   | Correction de 5 vulnérabilités HIGH `@opentelemetry/*`        | #249 |
| #250   | Rédaction de `technical/testcontainers.md` (lien mort comblé) | #251 |

Le champ `note` traverse toutes les couches : migration Prisma écrite à la main, `StockItem`, les deux repositories, les DTO et l'OpenAPI. 8 nouveaux tests unitaires.

Pour #247, `applicationinsights` était déjà à jour mais sa dépendance transitive `@azure/monitor-opentelemetry` épingle `@opentelemetry/sdk-node@0.219.0`, qui tire des sous-paquets non patchés. Correction par un bloc `overrides` npm, sans breaking change.

TestContainers était indisponible en local (image `ryuk` inaccessible), la vérification bout en bout a été faite par script contre la base Docker locale.

Nettoyage annexe : 77 branches locales déjà mergées supprimées, branches de spike jamais proposées en PR sécurisées sur `origin`.

### 21 juillet 2026

| Ticket | Action                                                               | PR   |
| ------ | -------------------------------------------------------------------- | ---- |
| #237   | Dependabot `undici` 7.24.6 vers 7.28.0                               | #237 |
|        | `npm audit` cassé sur toutes les PR (41 vulnérabilités), ramené à 19 | #243 |
| #169   | Enum `category` remplacé par `VARCHAR(50)` libre, rétrocompatible    | #242 |

Migration #169 testée sur la base Docker locale avec les données de mars 2026 préservées. Restent 19 vulnérabilités moderate dans la chaîne `uuid` vers `@azure/msal-node`, qui demandent un breaking change.

Docker Desktop a eu un problème réseau IPv6 bloquant tout `docker pull`, résolu en passant le mode réseau sur IPv4 only.

### 18 juin 2026

Authentification en 401 inexpliqués après une nuit de container allumé, dû au cache JWKS `passport-azure-ad` devenu obsolète. Workaround : `docker compose restart api`. Le middleware `authenticateMiddleware` logue désormais la raison du rejet passport, pour raccourcir le prochain diagnostic.

### 16 juin 2026

| Ticket | Action                                                                                 | PR   |
| ------ | -------------------------------------------------------------------------------------- | ---- |
| #191   | `GET /stocks/:stockId/items/:itemId` sur toutes les couches DDD/CQRS, 304 tests        | #233 |
|        | Vulnérabilités high : `@babel/core` 7.29.7, `form-data` 4.0.6, `knip` en devDependency | #234 |
|        | Activation de Dependabot, 2 PR ouvertes automatiquement (#235, #236)                   |      |

Staging remis en route : instance Aiven MySQL relancée, migrations et seed exécutés, `.env.aiven` mis à jour avec `sslaccept=accept_invalid_certs` pour Windows.

### 15 juin 2026

| Ticket | Action                                                                      | PR   |
| ------ | --------------------------------------------------------------------------- | ---- |
| #230   | `npm audit fix`, 73 paquets mis à jour, toutes les high et critical parties | #231 |

### 12 juin 2026

| Ticket | Action                                                                    | PR   |
| ------ | ------------------------------------------------------------------------- | ---- |
| #227   | Pool de connexions MySQL épuisé, `DB_CONNECTION_LIMIT` passé de 3 à 20    | #229 |
| #230   | 25 vulnérabilités npm dont 1 critical et 7 high, CI Security Audit cassée |      |

Cause racine du #227 : chaque repository crée son propre `new PrismaClient()`, soit 9 pools ouverts, et nodemon accumule les connexions sans les fermer. La limite relevée est un workaround, le singleton Prisma reste à faire.

---

## Où on en est

Le projet est dans la **phase 1** de [docs/ROADMAP-GLOBAL.md](docs/ROADMAP-GLOBAL.md), les finitions V2. L'état réel de chaque ticket est sur le [GitHub Project](https://github.com/users/SandrineCipolla/projects/3) et dans les [issues ouvertes](https://github.com/SandrineCipolla/stockhub_back/issues), qui font foi.

Prochain ticket selon la roadmap : **#219**, validation Zod sur les inputs des controllers.

---

## Pour reprendre rapidement

```bash
docker compose up -d
docker compose ps
curl http://localhost:3006/api/v2/stocks  # 401 attendu, l'API répond
npm run test:unit
```

Mise en place complète de l'environnement local : [docs/technical/environments-setup.md](docs/technical/environments-setup.md).

> La prod tourne sur le plan F1 Azure (quota 60 min CPU par jour). Lancer `npm run azure:stop` après les sessions de test.
