# StockHub Backend (API V2)

![CI/CD Pipeline](https://github.com/sandrineCipolla/stockhub_back/actions/workflows/main_stockhub-back.yml/badge.svg)
![Security Audit](https://github.com/SandrineCipolla/stockhub_back/actions/workflows/security-audit.yml/badge.svg)
![Version](https://img.shields.io/github/package-json/v/SandrineCipolla/stockhub_back)
[![Coverage](https://codecov.io/gh/SandrineCipolla/stockhub_back/branch/main/graph/badge.svg)](https://codecov.io/gh/SandrineCipolla/stockhub_back)

StockHub aide les familles à gérer leurs stocks de produits (alimentaires, artistiques...). L'application visualise l'état des stocks et permet de les mettre à jour facilement, pour éviter les ruptures et les doublons d'achat.

**Stack** : Node.js, Express, TypeScript, Prisma, MySQL, Azure AD B2C (versions exactes dans `package.json`).

**Architecture** : DDD/CQRS, séparation stricte des couches (`domain → infrastructure → api`, jamais l'inverse). Détail et justification : [ADR-001](docs/adr/ADR-001-migration-ddd-cqrs.md).

Arborescence des dossiers et rôle de chaque couche : [CLAUDE.md](CLAUDE.md#architecture-dddcqrs).

---

## Démarrage rapide (Docker)

```bash
git clone https://github.com/SandrineCipolla/stockhub_back.git
cd stockhub_back
npm install

# Créer .env.docker avec les variables Azure B2C (voir docs/technical/environments-setup.md)

docker compose up -d
docker compose exec api sh -c "SEED_OWNER_EMAIL=ton.email@b2c.com npm run db:seed"
```

API disponible sur **http://localhost:3006**. Guide complet multi-environnements : [docs/technical/environments-setup.md](docs/technical/environments-setup.md).

## Environnements

| Environnement | URL                                                                    | Swagger UI  |
| ------------- | ---------------------------------------------------------------------- | ----------- |
| Local         | `http://localhost:3006`                                                | `/api-docs` |
| Staging       | https://stockhub-back.onrender.com                                     | `/api-docs` |
| Production    | https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net | `/api-docs` |

## API

Documentation complète des endpoints : [Swagger Editor](https://editor.swagger.io/?url=https://raw.githubusercontent.com/SandrineCipolla/stockhub_back/main/docs/openapi.yaml) ou `/api-docs` sur un environnement démarré. Source : [docs/openapi.yaml](docs/openapi.yaml).

Tester avec Postman : `Stockhub_V2.postman_collection.json` (racine) + un environnement dans `postman/` (local/staging/prod). Sélectionner l'environnement, renseigner `username`/`password`, lancer `🔑 Get Token`.

## Sécurité

- **Authentification** : Azure AD B2C, JWT Bearer sur toutes les routes `/api/v2`
- **Autorisation** : système hybride basé sur les ressources ([ADR-009](docs/adr/ADR-009-resource-based-authorization.md))
- **RGPD** : [docs/rgpd.md](docs/rgpd.md)

## Base de données

MySQL via Prisma ORM. Schéma complet, relations et décisions de modélisation : [docs/database-schema.md](docs/database-schema.md).

## Tests

Trois niveaux : unitaires (Jest, domaine + controllers), intégration (TestContainers, MySQL réel), E2E (Playwright, authentification Azure AD B2C réelle). Détail : [docs/technical/e2e-testing.md](docs/technical/e2e-testing.md) et [docs/technical/testcontainers.md](docs/technical/testcontainers.md). Procédure de test manuel sans Playwright : [docs/technical/manual-testing-guide.md](docs/technical/manual-testing-guide.md).

Couverture à jour : badge en haut de ce fichier.

## CI/CD et déploiement

| Job                      | Déclencheur         | Cible             |
| ------------------------ | ------------------- | ----------------- |
| `continuous-integration` | Tous les push / PR  | n/a               |
| `e2e-tests`              | PR vers `main`      | n/a               |
| `deploy-to-staging`      | `workflow_dispatch` | Render.com        |
| `build-and-deploy`       | Push sur `main`     | Azure App Service |

> Azure tourne sur le plan F1 (quota 60 min CPU/jour) : `npm run azure:start` avant de tester en prod, `npm run azure:stop` après.

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) : process de contribution (branches, commits, PR, issues)
- [CLAUDE.md](CLAUDE.md) : contexte projet pour sessions IA
- [docs/0-INDEX.md](docs/0-INDEX.md) : index complet de la documentation
- [docs/adr/INDEX.md](docs/adr/INDEX.md) : Architecture Decision Records
- [CHANGELOG.md](CHANGELOG.md) : journal des changements (généré automatiquement)
- [Wiki du projet](https://github.com/SandrineCipolla/stockHub_V2_front/wiki) : documentation transversale aux 3 repos StockHub

## License

Propriétaire, tous droits réservés. Voir [LICENSE](LICENSE).
