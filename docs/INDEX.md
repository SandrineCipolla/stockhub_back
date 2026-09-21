# 📚 StockHub V2 Backend - Index de Documentation

> **Documentation complète de l'API StockHub V2**
> Architecture DDD/CQRS avec TypeScript, Prisma, Azure AD B2C
> Développé par: Sandrine Cipolla

---

## 📖 Documentation Principale

### Guides Essentiels

| Fichier                                      | Description                                                |
| -------------------------------------------- | ---------------------------------------------------------- |
| [INDEX.md](INDEX.md)                         | 📍 Vous êtes ici - Index principal                         |
| [sessions/INDEX.md](sessions/INDEX.md)       | 📅 Sessions - Index sessions développement                 |
| [../CLAUDE.md](../CLAUDE.md)                 | 🤖 Contexte projet pour sessions IA                        |
| [../CONTRIBUTING.md](../CONTRIBUTING.md)     | 🤝 Process de contribution - branches, commits, PR, issues |
| [../README.md](../README.md)                 | 📖 Présentation du projet                                  |
| [../ETAT_DU_PROJET.md](../ETAT_DU_PROJET.md) | 📊 État courant, version, qualité, point de reprise        |

Architecture, authentification, tests et qualité de code sont documentés dans les guides de [technical/](technical/) ci-dessous plutôt que dans des fichiers numérotés séparés.

### Quick Links

- **🚀 Nouveau sur le projet ?** → [../CLAUDE.md](../CLAUDE.md) + [../ETAT_DU_PROJET.md](../ETAT_DU_PROJET.md)
- **🔐 Authentification ?** → [technical/azure-b2c-setup.md](technical/azure-b2c-setup.md)
- **🧪 Tests ?** → [technical/e2e-testing.md](technical/e2e-testing.md), [technical/testcontainers.md](technical/testcontainers.md)
- **🐛 Problème technique ?** → [troubleshooting/](troubleshooting/)
- **📅 Documenter session ?** → [sessions/INDEX.md](sessions/INDEX.md)

---

## 🏗️ Architecture Decision Records (ADR)

> **Décisions architecturales importantes**
> Localisation : [adr/](adr/)

| #      | Fichier                                                                                                            | Description                                                                | Statut  |
| ------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------- |
| **01** | [ADR-001-migration-ddd-cqrs.md](adr/ADR-001-migration-ddd-cqrs.md)                                                 | Migration architecture DDD/CQRS                                            | Accepté |
| **02** | [ADR-002-choix-prisma-orm.md](adr/ADR-002-choix-prisma-orm.md)                                                     | Choix de Prisma comme ORM                                                  | Accepté |
| **03** | [ADR-003-azure-ad-b2c-authentication.md](adr/ADR-003-azure-ad-b2c-authentication.md)                               | Azure AD B2C pour authentification                                         | Accepté |
| **04** | [ADR-004-tests-value-objects-entities.md](adr/ADR-004-tests-value-objects-entities.md)                             | Tests Value Objects & Entities                                             | Accepté |
| **05** | [ADR-005-api-versioning-v2.md](adr/ADR-005-api-versioning-v2.md)                                                   | Versioning API (V2)                                                        | Accepté |
| **06** | [ADR-006-mysql-azure-cloud.md](adr/ADR-006-mysql-azure-cloud.md)                                                   | MySQL Azure Database                                                       | Accepté |
| **07** | [ADR-007-code-quality-enforcement.md](adr/ADR-007-code-quality-enforcement.md)                                     | Standards qualité de code                                                  | Accepté |
| **08** | [ADR-008-typescript-request-type-aliases.md](adr/ADR-008-typescript-request-type-aliases.md)                       | Type aliases pour requêtes                                                 | Accepté |
| **09** | [ADR-009-resource-based-authorization.md](adr/ADR-009-resource-based-authorization.md)                             | Autorisation Phase 1 (ressources)                                          | Accepté |
| **10** | [ADR-010-ci-cd-pipeline-optimization.md](adr/ADR-010-ci-cd-pipeline-optimization.md)                               | Optimisation pipeline CI/CD                                                | Accepté |
| **11** | [ADR-011-staging-render-aiven.md](adr/ADR-011-staging-render-aiven.md)                                             | Staging Render.com + Aiven MySQL                                           | Accepté |
| **12** | [ADR-012-upgrade-node-22.md](adr/ADR-012-upgrade-node-22.md)                                                       | Migration Node.js 22 LTS                                                   | Accepté |
| **13** | [ADR-013-llm-provider-local-vs-cloud.md](adr/ADR-013-llm-provider-local-vs-cloud.md)                               | Provider LLM — local vs OpenRouter                                         | Accepté |
| **14** | [ADR-014-stock-prediction-deterministic.md](adr/ADR-014-stock-prediction-deterministic.md)                         | Prédictions — algorithmes déterministes                                    | Accepté |
| **15** | [ADR-015-openrouter-mistral-ai-service.md](adr/ADR-015-openrouter-mistral-ai-service.md)                           | OpenRouter + Mistral provider LLM                                          | Accepté |
| **16** | [ADR-016-rest-api-style.md](adr/ADR-016-rest-api-style.md)                                                         | Style d'API (REST)                                                         | Accepté |
| **17** | [ADR-017-express-framework.md](adr/ADR-017-express-framework.md)                                                   | Choix du framework Express                                                 | Accepté |
| **18** | [ADR-018-github-flow.md](adr/ADR-018-github-flow.md)                                                               | Workflow Git (GitHub Flow)                                                 | Accepté |
| **19** | [ADR-019-authorize-middleware-couches-classiques.md](adr/ADR-019-authorize-middleware-couches-classiques.md)       | Middleware d'autorisation en couches classiques (exception hexagonale)     | Accepté |
| **20** | [ADR-020-conversion-hexagonale-authorize-middleware.md](adr/ADR-020-conversion-hexagonale-authorize-middleware.md) | Conversion hexagonale du middleware d'autorisation (alternative à ADR-019) | Proposé |

**Index complet** : [adr/INDEX.md](adr/INDEX.md) | **Template** : [adr/TEMPLATE.md](adr/TEMPLATE.md) | **Guide de rédaction** : [technical/guide-redaction.md](technical/guide-redaction.md)

Atelier "justifier ses propres choix techniques" (contexte, inventaire, ADR-019/020) : [adr/ATELIER-2026-09-choix-techniques.md](adr/ATELIER-2026-09-choix-techniques.md).

Numérotation locale à ce repo, elle ne correspond pas à celle de `front` ou du wiki. Voir la table de correspondance dans la page wiki `Architecture-Decision-Records`.

---

## 📘 Guides Techniques Approfondis

> **Documentation détaillée sur des sujets spécifiques**
> Localisation : [technical/](technical/) | **Index complet des guides** : [technical/INDEX.md](technical/INDEX.md)

| Catégorie        | Fichier                                                                                              | Description                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Architecture** | [technical/ddd-cqrs-guide.md](technical/ddd-cqrs-guide.md)                                           | Guide DDD/CQRS appliqué au projet                          |
| **Architecture** | [technical/dependency-injection-best-practices.md](technical/dependency-injection-best-practices.md) | Dependency Injection - Best Practices                      |
| **Frontend**     | [technical/frontend-v2-integration.md](technical/frontend-v2-integration.md)                         | Intégration Frontend V2 avec Backend                       |
| **Tests**        | [technical/e2e-testing.md](technical/e2e-testing.md)                                                 | Tests E2E avec Playwright                                  |
| **Tests**        | [technical/testcontainers.md](technical/testcontainers.md)                                           | Tests d'intégration avec TestContainers                    |
| **Auth**         | [technical/azure-b2c-setup.md](technical/azure-b2c-setup.md)                                         | Setup Azure AD B2C (ROPC)                                  |
| **Auth**         | [technical/azure-ad-setup-detailed.md](technical/azure-ad-setup-detailed.md)                         | Setup Azure AD - détail complet                            |
| **Qualité**      | [technical/code-quality-standards.md](technical/code-quality-standards.md)                           | Standards de qualité de code                               |
| **Qualité**      | [technical/code-review-best-practices.md](technical/code-review-best-practices.md)                   | Bonnes pratiques de code review                            |
| **Excellence**   | [technical/ticket-fil-rouge-excellence.md](technical/ticket-fil-rouge-excellence.md)                 | 🧵 Ticket Fil Rouge : Axes d'amélioration et d'excellence  |
| **Logging**      | [technical/logger-guide.md](technical/logger-guide.md)                                               | Système de logging structuré                               |
| **Process**      | [technical/milestones-guide.md](technical/milestones-guide.md)                                       | Gestion des milestones GitHub                              |
| **Nettoyage**    | [technical/guide-nettoyage-multi-repos.md](technical/guide-nettoyage-multi-repos.md)                 | 🧹 Guide & Checklist de nettoyage multi-repos (Front / DS) |
| **Infra**        | [technical/environments-setup.md](technical/environments-setup.md)                                   | Mise en place des environnements (local/staging/prod)      |
| **Rédaction**    | [technical/guide-redaction.md](technical/guide-redaction.md)                                         | Guide de rédaction (ADR et documentation)                  |
| **Database**     | [technical/database-schema.md](technical/database-schema.md)                                         | Schéma ERD : tables, relations, décisions de modélisation  |
| **RGPD**         | [technical/rgpd.md](technical/rgpd.md)                                                               | Conformité RGPD et protection des données                  |

---

## 🐛 Troubleshooting

> **Résolution de problèmes techniques**
> Localisation : [troubleshooting/](troubleshooting/) | **Index des fiches** : [troubleshooting/INDEX.md](troubleshooting/INDEX.md)

| Problème                      | Fichier                                                                                              | Description                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------ |
| TypeScript module declaration | [troubleshooting/typescript-module-declaration.md](troubleshooting/typescript-module-declaration.md) | Erreurs de déclaration modules       |
| Tests E2E Azure ROPC          | [troubleshooting/e2e-azure-ropc-issues.md](troubleshooting/e2e-azure-ropc-issues.md)                 | Problèmes Azure ROPC dans tests      |
| Docker / Postman / Azure      | [troubleshooting/docker-postman-azure-issues.md](troubleshooting/docker-postman-azure-issues.md)     | Problèmes en environnement local     |
| Migrations Prisma en prod     | [troubleshooting/prod-migration-drift.md](troubleshooting/prod-migration-drift.md)                   | Migrations jamais appliquées en prod |
| Staging Render.com            | [troubleshooting/staging-render-issues.md](troubleshooting/staging-render-issues.md)                 | Problèmes rencontrés sur le staging  |

---

## 📅 Sessions de Développement

> **Historique chronologique des sessions de développement**
> **Comment documenter** : Voir [sessions/INDEX.md](sessions/INDEX.md)
> Localisation : [sessions/](sessions/)

### Sessions Récentes

Voir [sessions/INDEX.md](sessions/INDEX.md) pour la liste complète et à jour, non dupliquée ici.

---

## 📦 Archive

> **Ancienne documentation et références**
> Localisation : [archive/](archive/) | **Index des archives** : [archive/INDEX.md](archive/INDEX.md)

| Type    | Fichier                                                                            | Description                                                                                   |
| ------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Issue   | [archive/issues/issue-42-dto-mapper.md](archive/issues/issue-42-dto-mapper.md)     | Issue #42 - DTO Mapper                                                                        |
| PR      | [archive/issues/pr-40-review-fixes.md](archive/issues/pr-40-review-fixes.md)       | PR #40 - Review Fixes                                                                         |
| Impl    | [archive/ddd-manipulation-routes.md](archive/ddd-manipulation-routes.md)           | Implémentation routes DDD                                                                     |
| Résumé  | [archive/authorization-phase1-summary.md](archive/authorization-phase1-summary.md) | Résumé autorisation Phase 1 (voir ADR-009 et sessions/2025-12-28)                             |
| Audit   | [archive/ARCHITECTURE_AUDIT.md](archive/ARCHITECTURE_AUDIT.md)                     | Audit architecture DDD/CQRS - 10 avril 2026                                                   |
| Audit   | [archive/REPO_AUDIT.md](archive/REPO_AUDIT.md)                                     | Audit organisation du repo - 10 avril 2026                                                    |
| Audits  | [archive/audits/INDEX.md](archive/audits/INDEX.md)                                 | Résultats d'audits Q1 2026 (audit back, vérification, avancement)                             |
| Prompts | [archive/prompts/INDEX.md](archive/prompts/INDEX.md)                               | Prompts Claude Code archivés — trace de la démarche assistée                                  |
| Roadmap | [archive/ROADMAP-2026-01.md](archive/ROADMAP-2026-01.md)                           | Roadmap backend arrêtée en janvier 2026, remplacée par [ROADMAP-GLOBAL.md](ROADMAP-GLOBAL.md) |

---

## 🔗 Liens Externes

### Repositories du Projet

- **Backend (ce repo)** : https://github.com/SandrineCipolla/stockhub_back
- **Frontend** : https://github.com/SandrineCipolla/stockHub_V2_front
- **Design System** : https://github.com/SandrineCipolla/stockhub_design_system

### Outils & Services

- **Démo API** : https://stockhub-back-bqf8e6fbf6dzd6gs.westeurope-01.azurewebsites.net/
- **GitHub Project** : https://github.com/users/SandrineCipolla/projects/3
- **Storybook Design System** : https://68f5fbe10f495706cb168751-nufqfdjaoc.chromatic.com/

### Documentation Technique

- **Prisma Docs** : https://www.prisma.io/docs
- **Azure AD B2C** : https://learn.microsoft.com/en-us/azure/active-directory-b2c/
- **TestContainers** : https://node.testcontainers.org/
- **Playwright** : https://playwright.dev/
- **DDD Patterns** : https://martinfowler.com/tags/domain%20driven%20design.html

Fichiers racine : voir la table en tête de cet index. Roadmap : [ROADMAP-GLOBAL.md](ROADMAP-GLOBAL.md) (transversale aux 3 repos).
