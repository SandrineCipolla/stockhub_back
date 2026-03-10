# Architecture Decision Records (ADRs)

Ce dossier contient les **Architecture Decision Records** (ADRs) du projet StockHub Backend.

## 📚 Qu'est-ce qu'un ADR ?

Un ADR (Architecture Decision Record) est un document qui capture une **décision architecturale importante** prise dans le projet, ainsi que son contexte et ses conséquences.

### Objectifs

- 📝 **Documenter le "pourquoi"** derrière les choix techniques
- 🧠 **Préserver la connaissance** pour les nouveaux développeurs
- 🔍 **Justifier les décisions** lors de revues de code ou d'audits
- ⏱️ **Éviter de rediscuter** des décisions déjà prises

## 📋 Liste des ADRs

| #                                                       | Titre                                        | Date       | Statut     |
| ------------------------------------------------------- | -------------------------------------------- | ---------- | ---------- |
| [ADR-001](./ADR-001-migration-ddd-cqrs.md)              | Migration vers DDD/CQRS                      | 2025-11-25 | ✅ Accepté |
| [ADR-002](./ADR-002-choix-prisma-orm.md)                | Choix de Prisma comme ORM                    | 2025-11-28 | ✅ Accepté |
| [ADR-003](./ADR-003-azure-ad-b2c-authentication.md)     | Azure AD B2C pour l'authentification         | 2025-11-30 | ✅ Accepté |
| [ADR-004](./ADR-004-tests-value-objects-entities.md)    | Tests sur Value Objects et Entities          | 2025-12-02 | ✅ Accepté |
| [ADR-005](./ADR-005-api-versioning-v2.md)               | Versioning API (commencer en V2)             | 2025-12-05 | ✅ Accepté |
| [ADR-006](./ADR-006-mysql-azure-cloud.md)               | MySQL sur Azure Cloud                        | 2025-12-08 | ✅ Accepté |
| [ADR-007](./ADR-007-code-quality-enforcement.md)        | Application stricte des standards de qualité | 2024-12-19 | ✅ Accepté |
| [ADR-008](./ADR-008-typescript-request-type-aliases.md) | Type Aliases pour requêtes Express           | 2025-12-26 | ✅ Accepté |
| [ADR-009](./ADR-009-resource-based-authorization.md)    | Système d'autorisation hybride (Phase 1 ✅)  | 2025-12-27 | ✅ Accepté |
| [ADR-010](./ADR-010-ci-cd-pipeline-optimization.md)     | Optimisation pipeline CI/CD GitHub Actions   | 2025-12-27 | ✅ Accepté |
| [ADR-011](./ADR-011-staging-render-aiven.md)            | Staging Render.com + Aiven MySQL             | 2026-01-15 | ✅ Accepté |
| [ADR-012](./ADR-012-upgrade-node-22.md)                 | Migration vers Node.js 22 LTS                | 2026-03-10 | ✅ Accepté |

## 📖 Comment lire un ADR ?

Chaque ADR suit une structure standard :

1. **Contexte** : Quel problème devions-nous résoudre ?
2. **Décision** : Quelle solution avons-nous choisie ?
3. **Raisons** : Pourquoi cette solution ?
4. **Alternatives** : Quelles autres options avons-nous considérées ?
5. **Conséquences** : Quels sont les impacts (positifs et négatifs) ?

## ✍️ Comment créer un nouvel ADR ?

### 1. Utiliser le template

Copier `TEMPLATE.md` (si disponible) ou suivre la structure d'un ADR existant.

### 2. Numérotation

Les ADRs sont numérotés séquentiellement : ADR-001, ADR-002, etc.

### 3. Nom du fichier

Format : `ADR-XXX-titre-en-kebab-case.md`

Exemple : `ADR-009-choix-redis-cache.md`

### 4. Sections obligatoires

- **Date** : Date de la décision
- **Statut** : Proposé | Accepté | Déprécié | Supplanté par ADR-XXX
- **Décideurs** : Qui a pris la décision
- **Contexte** : Situation et problème
- **Décision** : Solution choisie
- **Raisons** : Justification
- **Alternatives** : Options rejetées et pourquoi
- **Conséquences** : Impacts positifs et négatifs

### 5. Workflow

1. Créer l'ADR dans `docs/adr/`
2. Ajouter le lien dans ce README
3. Créer une PR pour review
4. Merger après validation

## 🔄 Modifier un ADR existant

**Les ADRs sont immuables** - une fois acceptés, ils ne doivent pas être modifiés.

Si une décision change :

1. Créer un **nouvel ADR** qui supplante l'ancien
2. Mettre à jour le statut de l'ancien ADR : `Supplanté par ADR-XXX`
3. Ajouter un lien dans le nouvel ADR : `Supplante ADR-YYY`

## 📊 Statuts possibles

| Statut        | Signification                            |
| ------------- | ---------------------------------------- |
| **Proposé**   | En discussion, pas encore validé         |
| **Accepté**   | Décision validée et appliquée            |
| **Déprécié**  | N'est plus d'actualité mais pas remplacé |
| **Supplanté** | Remplacé par un nouvel ADR               |

## 🎯 Bonnes pratiques

### ✅ À faire

- Documenter les **décisions importantes** seulement
- Être **factuel et neutre** (pas de "je pense que...")
- Expliquer le **contexte** et les **contraintes**
- Lister les **alternatives** considérées
- Documenter les **trade-offs** (conséquences négatives)

### ❌ À éviter

- Documenter des décisions triviales
- Être trop verbeux (2-3 pages max)
- Omettre les alternatives
- Ne lister que les avantages

## 📚 Ressources

- [ADR GitHub](https://adr.github.io/) - Référence officielle
- [Markdown ADR Tools](https://github.com/npryce/adr-tools) - Outils CLI
- [Why Write ADRs](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Article fondateur

## 🔗 Liens utiles

- [Documentation principale](../../README.md)
- [Standards de qualité](../code-quality-standards.md)
- [Guide de contribution](../../CONTRIBUTING.md) (si existant)

---

**Dernière mise à jour** : 2026-03-10
**Mainteneur** : Équipe StockHub Backend
