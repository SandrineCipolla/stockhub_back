# 📚 StockHub V2 Backend - Index de Documentation

> **Documentation complète de l'API StockHub V2**
> Architecture DDD/CQRS avec TypeScript, Prisma, Azure AD B2C
> Développé par: Sandrine Cipolla

---

## 📖 Documentation Principale (Ordre Recommandé)

### Guides Essentiels

| #     | Fichier                                                | Description                                          |
| ----- | ------------------------------------------------------ | ---------------------------------------------------- |
| **0** | [0-INDEX.md](0-INDEX.md)                               | 📍 Vous êtes ici - Index principal                   |
| **1** | [1-ARCHITECTURE.md](1-ARCHITECTURE.md)                 | 🏗️ **Architecture DDD/CQRS** - Principes & structure |
| **2** | [2-AUTHENTICATION.md](2-AUTHENTICATION.md)             | 🔐 **Azure AD B2C** - Configuration & utilisation    |
| **3** | [3-TESTING.md](3-TESTING.md)                           | 🧪 **Tests** - Unit, Integration, E2E                |
| **4** | [4-CODE-QUALITY.md](4-CODE-QUALITY.md)                 | ✨ **Qualité** - ESLint, Prettier, TypeScript        |
| **5** | [5-DEVELOPMENT-WORKFLOW.md](5-DEVELOPMENT-WORKFLOW.md) | 🔄 **Workflow** - Git, Commits, PRs                  |
| **6** | [6-API-DOCUMENTATION.md](6-API-DOCUMENTATION.md)       | 📡 **API** - Endpoints, DTOs, Swagger                |
| **7** | [7-SESSIONS.md](7-SESSIONS.md)                         | 📅 **Sessions** - Index sessions développement       |

### Quick Links

- **🚀 Nouveau sur le projet ?** → [1-ARCHITECTURE.md](1-ARCHITECTURE.md) + [../CLAUDE.md](../CLAUDE.md)
- **🔐 Authentification ?** → [2-AUTHENTICATION.md](2-AUTHENTICATION.md)
- **🧪 Tests ?** → [3-TESTING.md](3-TESTING.md)
- **🐛 Problème technique ?** → [troubleshooting/](troubleshooting/)
- **📅 Documenter session ?** → [7-SESSIONS.md](7-SESSIONS.md)

---

## 🏗️ Architecture Decision Records (ADR)

> **Décisions architecturales importantes**
> Localisation : [adr/](adr/)

| #      | Fichier                                                                                      | Description                        | Statut  |
| ------ | -------------------------------------------------------------------------------------------- | ---------------------------------- | ------- |
| **01** | [ADR-001-migration-ddd-cqrs.md](adr/ADR-001-migration-ddd-cqrs.md)                           | Migration architecture DDD/CQRS    | Accepté |
| **02** | [ADR-002-choix-prisma-orm.md](adr/ADR-002-choix-prisma-orm.md)                               | Choix de Prisma comme ORM          | Accepté |
| **03** | [ADR-003-azure-ad-b2c-authentication.md](adr/ADR-003-azure-ad-b2c-authentication.md)         | Azure AD B2C pour authentification | Accepté |
| **04** | [ADR-004-tests-value-objects-entities.md](adr/ADR-004-tests-value-objects-entities.md)       | Tests Value Objects & Entities     | Accepté |
| **05** | [ADR-005-api-versioning-v2.md](adr/ADR-005-api-versioning-v2.md)                             | Versioning API (V2)                | Accepté |
| **06** | [ADR-006-mysql-azure-cloud.md](adr/ADR-006-mysql-azure-cloud.md)                             | MySQL Azure Database               | Accepté |
| **07** | [ADR-007-code-quality-enforcement.md](adr/ADR-007-code-quality-enforcement.md)               | Standards qualité de code          | Accepté |
| **08** | [ADR-008-typescript-request-type-aliases.md](adr/ADR-008-typescript-request-type-aliases.md) | Type aliases pour requêtes         | Accepté |
| **09** | [ADR-009-resource-based-authorization.md](adr/ADR-009-resource-based-authorization.md)       | Autorisation Phase 1 (ressources)  | Accepté |
| **10** | [ADR-010-ci-cd-pipeline-optimization.md](adr/ADR-010-ci-cd-pipeline-optimization.md)         | Optimisation pipeline CI/CD        | Accepté |

**Index complet** : [adr/INDEX.md](adr/INDEX.md) | **Template** : [adr/TEMPLATE.md](adr/TEMPLATE.md)

---

## 📘 Guides Techniques Approfondis

> **Documentation détaillée sur des sujets spécifiques**
> Localisation : [technical/](technical/)

| Catégorie        | Fichier                                                                | Description                             |
| ---------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| **Architecture** | [technical/dependency-injection.md](technical/dependency-injection.md) | Dependency Injection - Best Practices   |
| **Tests**        | [technical/e2e-testing.md](technical/e2e-testing.md)                   | Tests E2E avec Playwright               |
| **Tests**        | [technical/testcontainers.md](technical/testcontainers.md)             | Tests d'intégration avec TestContainers |
| **Auth**         | [technical/azure-b2c-setup.md](technical/azure-b2c-setup.md)           | Setup Azure AD B2C (ROPC)               |
| **Database**     | [technical/prisma-mapping.md](technical/prisma-mapping.md)             | Prisma - Mapping TypeScript ↔ MySQL     |

---

## 🐛 Troubleshooting

> **Résolution de problèmes techniques**
> Localisation : [troubleshooting/](troubleshooting/)

| Problème                      | Fichier                                                                                              | Description                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------- |
| TypeScript module declaration | [troubleshooting/typescript-module-declaration.md](troubleshooting/typescript-module-declaration.md) | Erreurs de déclaration modules  |
| Tests E2E Azure ROPC          | [troubleshooting/e2e-azure-ropc-issues.md](troubleshooting/e2e-azure-ropc-issues.md)                 | Problèmes Azure ROPC dans tests |

---

## 📅 Sessions de Développement

> **Historique chronologique des sessions de développement**
> **Comment documenter** : Voir [7-SESSIONS.md](7-SESSIONS.md)
> Localisation : [sessions/](sessions/)

### Sessions Récentes

| Date       | Fichier                                                                                    | Description                                   |
| ---------- | ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| 2025-12-28 | [sessions/2025-12-28-authorization-phase1.md](sessions/2025-12-28-authorization-phase1.md) | Authorization Phase 1 - Tests & Documentation |
| 2025-12-29 | [sessions/2025-12-29-doc-reorganization.md](sessions/2025-12-29-doc-reorganization.md)     | Réorganisation documentation                  |

**Index complet** : [7-SESSIONS.md](7-SESSIONS.md)

---

## 📦 Archive

> **Ancienne documentation et références**
> Localisation : [archive/](archive/)

| Type  | Fichier                                                                        | Description               |
| ----- | ------------------------------------------------------------------------------ | ------------------------- |
| Issue | [archive/issues/issue-42-dto-mapper.md](archive/issues/issue-42-dto-mapper.md) | Issue #42 - DTO Mapper    |
| PR    | [archive/issues/pr-40-review-fixes.md](archive/issues/pr-40-review-fixes.md)   | PR #40 - Review Fixes     |
| Impl  | [archive/ddd-manipulation-routes.md](archive/ddd-manipulation-routes.md)       | Implémentation routes DDD |

---

## 🔗 Liens Externes

### Repositories du Projet

- **Backend (ce repo)** : https://github.com/SandrineCipolla/stockhub_back
- **Frontend** : https://github.com/SandrineCipolla/stockHub_V2_front
- **Design System** : https://github.com/SandrineCipolla/stockhub_design_system

### Outils & Services

- **Démo API** : https://stockhub-back.azurewebsites.net/
- **GitHub Project** : https://github.com/users/SandrineCipolla/projects/3
- **Storybook Design System** : https://68f5fbe10f495706cb168751-nufqfdjaoc.chromatic.com/

### Documentation Technique

- **Prisma Docs** : https://www.prisma.io/docs
- **Azure AD B2C** : https://learn.microsoft.com/en-us/azure/active-directory-b2c/
- **TestContainers** : https://node.testcontainers.org/
- **Playwright** : https://playwright.dev/
- **DDD Patterns** : https://martinfowler.com/tags/domain%20driven%20design.html

---

## 📝 Fichiers Racine Importants

| Fichier                            | Description                                  |
| ---------------------------------- | -------------------------------------------- |
| [../CLAUDE.md](../CLAUDE.md)       | 🤖 Guide pour sessions IA (contexte complet) |
| [../README.md](../README.md)       | 📖 README principal du projet                |
| [../ROADMAP.md](../ROADMAP.md)     | 🗺️ Feuille de route & issues                 |
| [../CHANGELOG.md](../CHANGELOG.md) | 📋 Journal des changements (auto-généré)     |

---

**🎯 Dernière mise à jour** : 29 décembre 2025
**📊 Total documents** : 30+ fichiers organisés
