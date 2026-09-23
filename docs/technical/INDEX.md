# 📘 Index des Guides Techniques

> **Documentation technique et choix d'architecture de l'API StockHub V2**

---

## 🏗️ Architecture & Conception

| Fichier                                                                          | Description                                                                                                                             |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [ddd-cqrs-guide.md](ddd-cqrs-guide.md)                                           | Guide d'implémentation DDD/CQRS appliqué au projet (Command/Query, Value Objects, Entités)                                              |
| [dependency-injection-best-practices.md](dependency-injection-best-practices.md) | Bonnes pratiques d'injection de dépendances (prismaClient ?? new PrismaClient())                                                        |
| [database-schema.md](database-schema.md)                                         | Schéma de base de données MySQL : ERD, tables, relations et choix de modélisation                                                       |
| [ticket-fil-rouge-excellence.md](ticket-fil-rouge-excellence.md)                 | Axes d'amélioration back-end en réserve (validation Zod, dette technique) — optionnel, à traiter si le temps le permet avant soutenance |

---

## 🔐 Authentification & Sécurité

| Fichier                                                  | Description                                                                   |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [azure-b2c-setup.md](azure-b2c-setup.md)                 | Configuration Azure AD B2C (flux ROPC) et middleware Passport Bearer          |
| [azure-ad-setup-detailed.md](azure-ad-setup-detailed.md) | Guide détaillé de configuration de l'annuaire Azure AD B2C                    |
| [rgpd.md](rgpd.md)                                       | Conformité RGPD, gestion des données personnelles et registre des traitements |

---

## 🧪 Tests & Qualité de Code

| Fichier                                                        | Description                                                                 |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [e2e-testing.md](e2e-testing.md)                               | Guide des tests E2E avec Playwright et authentification Azure AD B2C réelle |
| [testcontainers.md](testcontainers.md)                         | Guide des tests d'intégration avec TestContainers et MySQL isolé            |
| [manual-testing-guide.md](manual-testing-guide.md)             | Procédure de test manuel sans exécuter la suite Playwright                  |
| [code-quality-standards.md](code-quality-standards.md)         | Standards de qualité de code (TypeScript strict, ESLint, Prettier, Knip)    |
| [code-review-best-practices.md](code-review-best-practices.md) | Bonnes pratiques de code review et checklist de validation des PRs          |

---

## ⚙️ Infrastructure & Environnements

| Fichier                                                  | Description                                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [environments-setup.md](environments-setup.md)           | Configuration des 4 environnements (Local Docker, Staging Render/Aiven, Prod Azure) |
| [frontend-v2-integration.md](frontend-v2-integration.md) | Guide d'intégration entre le Frontend V2 et l'API Backend                           |
| [logger-guide.md](logger-guide.md)                       | Système de logging structuré ( ypescript-logging, cloudLogger)                      |
| [milestones-guide.md](milestones-guide.md)               | Organisation des jalons et milestones GitHub pour le suivi du projet                |

---

## ✍️ Méthodologie & Rédaction

| Fichier                                                          | Description                                                                                                                             |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [guide-redaction.md](guide-redaction.md)                         | Directives de rédaction de la documentation technique et des ADRs                                                                       |
| [guide-nettoyage-multi-repos.md](guide-nettoyage-multi-repos.md) | Checklist de nettoyage documentaire éprouvée sur ce repo, à répliquer à l'identique sur `stockHub_V2_front` et `stockhub_design_system` |
