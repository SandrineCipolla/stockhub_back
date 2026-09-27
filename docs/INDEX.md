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
| [../AGENTS.md](../AGENTS.md)                 | 🤖 Contexte projet pour les agents IA                      |
| [../CONTRIBUTING.md](../CONTRIBUTING.md)     | 🤝 Process de contribution - branches, commits, PR, issues |
| [../README.md](../README.md)                 | 📖 Présentation du projet                                  |
| [../ETAT_DU_PROJET.md](../ETAT_DU_PROJET.md) | 📊 État courant, version, qualité, point de reprise        |

Architecture, authentification, tests et qualité de code sont documentés dans les guides de [technical/](technical/) ci-dessous plutôt que dans des fichiers numérotés séparés.

### Quick Links

- **🚀 Nouveau sur le projet ?** → [../AGENTS.md](../AGENTS.md) + [../ETAT_DU_PROJET.md](../ETAT_DU_PROJET.md)
- **🔐 Authentification ?** → [technical/azure-b2c-setup.md](technical/azure-b2c-setup.md)
- **🧪 Tests ?** → [technical/e2e-testing.md](technical/e2e-testing.md), [technical/testcontainers.md](technical/testcontainers.md)
- **🐛 Problème technique ?** → [troubleshooting/](troubleshooting/)
- **📅 Documenter session ?** → [sessions/INDEX.md](sessions/INDEX.md)

---

## 🏗️ Architecture Decision Records (ADR)

> **Décisions architecturales importantes**
> Localisation : [adr/](adr/)

Liste, statuts et règle de numérotation : [adr/INDEX.md](adr/INDEX.md), seule source de la liste des ADR.

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
| Prompts | [archive/prompts/INDEX.md](archive/prompts/INDEX.md)                               | Prompts Claude Code archivés, trace de la démarche assistée                                   |
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
