> **Archivé.** Ce document décrit la planification arrêtée en janvier 2026. Il est conservé parce que plusieurs comptes rendus de session y font référence. Les chiffres qu'il contient (version, nombre d'ADR, nombre de tests) étaient ceux de l'époque et ne valent plus.
>
> Roadmap courante : [ROADMAP-GLOBAL.md](../ROADMAP-GLOBAL.md). Suivi par milestones : même fichier, section « Suivi d'avancement ».

# 🗺️ StockHub Backend - Roadmap

**Date de création:** 2025-12-09
**Dernière mise à jour:** 2025-12-28
**Version actuelle:** 2.2.0
**Statut:** ✅ Architecture DDD/CQRS complète - Autorisation Phase 1 terminée

---

## 📋 Vue d'ensemble

### ✅ Déjà fait

**Architecture DDD/CQRS complète** (PRs #38, #40, #49)

- Architecture DDD/CQRS avec bounded context `stock-management`
- **Module Manipulation (WRITE SIDE):** ✅ COMPLET
  - Value Objects: `StockLabel`, `StockDescription`, `Quantity`
  - Entity: `Stock` (Aggregate Root) avec logique métier
  - Commands: `CreateStockCommand`, `AddItemToStockCommand`, `UpdateItemQuantityCommand`
  - Command Handlers implémentés
  - `PrismaStockCommandRepository` implémenté
  - Controller `StockControllerManipulation` avec routes POST/PATCH
  - Tests: 53 unitaires domaine + intégration + E2E
- **Module Visualization (READ SIDE):**
  - Service + Repository + Controller
  - Routes GET complètes
  - DTO Mapper (`StockDTO.ts`, `StockMapper.ts`)
- **Documentation:**
  - 10 ADRs complets (docs/adr/) justifiant tous les choix techniques
  - Guide d'implémentation DDD
  - Architecture README
- **Tests E2E:** Playwright avec Azure AD B2C (PR #40)
- **Qualité:** TypeScript strict, ESLint 9, Prettier, Git hooks

### 🎯 Prochaines priorités

1. **Couche d'autorisation** (Issue #44 - feedback encadrant)
2. **Audit npm dans CI/CD** (Issue #45 - feedback encadrant)
3. **Normalisation module visualization** (Issue #36)
4. **Optimisation CI/CD** (Issue #53)

---

## 🎯 Phases de développement

### Phase 1: Déblocage connexion Frontend ⏳ EN COURS (Backend prêt, Frontend à connecter)

**Objectif:** Permettre au Frontend de consommer l'API
**Issues associées:** #37, Tests E2E (PR #40), **Frontend V2 Issue #57**

#### ✅ Issue #37: Module DDD/CQRS Manipulation - COMPLÉTÉ (PR #49)

**Réalisations:**

- ✅ DTOs créés (`StockDTO.ts`, `StockMapper.ts`)
- ✅ Controller `StockControllerManipulation` implémenté
- ✅ Endpoints:
  - `POST /api/v2/stocks` - Créer stock
  - `POST /api/v2/stocks/:stockId/items` - Ajouter item
  - `PATCH /api/v2/stocks/:stockId/items/:itemId` - Modifier quantité
- ✅ Routes configurées dans `StockRoutesV2.ts`
- ✅ Tests: 53 unitaires domaine + intégration + E2E
- ✅ Documentation: ADR-001, guide d'implémentation

#### ✅ Tests E2E - COMPLÉTÉS (PR #40)

**Réalisations:**

- ✅ Infrastructure Playwright configurée
- ✅ Authentification Azure AD B2C intégrée
- ✅ Tests E2E scénario CRUD complet
- ✅ Documentation E2E testing

#### ⏳ Frontend V2 Integration - EN COURS (Issue #57)

**Objectif:** Connecter Frontend V2 au Backend avec Azure AD B2C

**État:**

- ✅ Backend prêt à 100% (API, Auth, Tests)
- ✅ Guide technique complet (`docs/technical/frontend-v2-integration.md`)
- ⏳ Frontend V2 à connecter (actuellement données mockées)

**Issue Frontend:** https://github.com/SandrineCipolla/stockHub_V2_front/issues/57

**Planning (5-6h):**

1. Installation MSAL (`@azure/msal-browser`, `@azure/msal-react`) - 15min
2. Configuration `.env` avec Azure AD B2C - 15min
3. Création `authConfig.ts` (MSAL config) - 30min
4. Création `ConfigManager.ts` (token management) - 30min
5. Création `utils.ts` + `stocksAPI.ts` (API client) - 2h
6. Modification `main.tsx` (MSAL init) - 30min
7. Modification `App.tsx` (token capture) - 30min
8. Tests (login, CRUD, erreurs) - 1h
9. Documentation - 30min

**Timeline:** **Fin Déc 2025 / Début Jan 2026** (avant Issue #44 Autorisation)

**Priorité:** 🔴 HAUTE - Débloque tests visuels et démos encadrant

---

### Phase 2: Qualité & Sécurité RNCP (PRIORITAIRE)

**Objectif:** Adresser feedback encadrant pour validation RNCP
**Issues:** #44, #45, #46

#### Issue #44: Implémenter couche d'autorisation (EPIC - 4 phases)

**Priorité:** HAUTE
**Statut:** ⏳ EN COURS - Phase 1 MERGÉE ✅ (Issue #62, PR #72)
**Description:**

Système d'autorisation hybride basé sur les ressources avec:

- Groupes familiaux
- Rôles par stock (OWNER/EDITOR/VIEWER/VIEWER_CONTRIBUTOR)
- Workflow de suggestions
- Notifications temps réel

**Issues enfants (Timeline ~3-4 mois):**

- [x] ✅ #62 - Phase 1: Fondations (groupes familiaux + rôles) - MERGÉ (27 jan 2026)
  - ✅ Migrations Prisma (Family, FamilyMember, StockCollaborator)
  - ✅ Domain Layer (Value Objects + Entities)
  - ✅ Middleware d'autorisation (authorizeStockAccess)
  - ✅ Application aux routes V2
  - ✅ Tests: 142 unitaires + 9 intégration + 4 E2E
  - ✅ PR #72 avec 23/23 commentaires de review traités
  - ✅ PR #73 (DI improvements) mergée dans PR #72
  - ✅ Constants (HTTP codes, permissions, routes)
  - ✅ Structured logging (rootSecurity)
  - ✅ Documentation: security + DI best practices (722 lignes)
- [ ] #63 - Phase 2: Workflow suggestions - 4-6 sem
- [ ] #64 - Phase 3: Notifications temps réel (SSE) - 2-3 sem
- [ ] #65 - Phase 4: Features avancées (audit log, analytics) - 2-4 sem

**Documentation:**

- ✅ ADR-009: docs/adr/ADR-009-resource-based-authorization.md
- ✅ Session 27 jan 2026: PR #72 final review & merge
- ✅ Session 6 jan 2026: PR #72 code review improvements
- ✅ Cas d'usage familiaux concrets documentés

---

#### Issue #45: Ajouter audit npm à la CI/CD

**Priorité:** MOYENNE
**Description:**

Feedback encadrant: "manque dans la CI/CD : npm audit pour les dépendances"

**Tâches:**

- [ ] Ajouter `npm audit` dans `.github/workflows/ci.yml`
- [ ] Configurer seuils d'alerte (high/critical)
- [ ] Bloquer CI si vulnérabilités critiques
- [ ] Ajouter badge dans README

**Acceptation:**

```yaml
# .github/workflows/ci.yml
- name: Security Audit
  run: |
    npm audit --audit-level=high
```

---

#### ✅ Issue #46: Documenter décisions techniques (ADRs) - COMPLÉTÉ

**Priorité:** HAUTE (pour RNCP)
**Statut:** ✅ COMPLÉTÉ

**Description:**

Feedback encadrant: "Il manque cependant des ADR ou l'équivalent qui **justifient les choix**"

**Réalisations:**

- [x] ✅ ADR-001: Migration DDD/CQRS (2025-11-25)
- [x] ✅ ADR-002: Choix de Prisma ORM (2025-11-28)
- [x] ✅ ADR-003: Azure AD B2C Authentication (2025-11-30)
- [x] ✅ ADR-004: Tests Value Objects et Entities (2025-12-02)
- [x] ✅ ADR-005: API Versioning V2 (2025-12-05)
- [x] ✅ ADR-006: MySQL Azure Cloud (2025-12-08)
- [x] ✅ ADR-007: Code Quality Enforcement (2024-12-19)
- [x] ✅ ADR-008: TypeScript Request Type Aliases (2025-12-26)
- [x] ✅ ADR-009: Système d'autorisation hybride (2025-12-27)
- [x] ✅ ADR-010: Optimisation pipeline CI/CD (2025-12-27)
- [x] ✅ INDEX.md + TEMPLATE.md

**Localisation:** `docs/adr/` (10 ADRs complets)

---

### Phase 3: Features avancées (AVANT RNCP - Mars 2027)

**Objectif:** Compléter features ML et Leisure Mode pour démonstration RNCP

#### Issue #47: Module ML Predictions

**Priorité:** BASSE
**Description:**

Implémenter prédictions de rupture de stock via scikit-learn

**Tâches:**

- [ ] Créer bounded context `predictions`
- [ ] Script Python pour entraînement modèle
- [ ] API endpoint `GET /api/v2/predictions/:stockId`
- [ ] Tests avec données historiques

---

#### Issue #48: Leisure Mode - Unités de mesure

**Priorité:** BASSE
**Description:**

Ajouter support des unités de mesure Leisure (bouteilles, verres)

**Tâches:**

- [ ] Migration Prisma: ajouter champ `unit` à `Item`
- [ ] Modifier Value Object `Quantity` pour inclure unité
- [ ] Mettre à jour DTOs

---

#### Issue #49: Container Management

**Priorité:** BASSE
**Description:**

Gestion des contenants (fûts, bouteilles, caisses)

**Tâches:**

- [ ] Créer bounded context `containers`
- [ ] Endpoints CRUD containers
- [ ] Relation `Item` ↔ `Container`

---

## 📊 Priorisation globale

### ✅ Phase 1 BACKEND - Déblocage connexion Frontend (Backend)

1. ✅ Issue #37 - Module DDD/CQRS Manipulation (PR #49)
2. ✅ Tests E2E - Infrastructure Playwright (PR #40)

### ⏳ Phase 1 FRONTEND - Connexion Frontend V2 (EN COURS)

3. ⏳ **Frontend Issue #57** - Connecter Frontend V2 au Backend (5-6h)
   - Installation MSAL + Configuration Azure AD B2C
   - Création API client + Token management
   - Tests login + CRUD complet

### ✅ Phase 2 COMPLÉTÉE - Documentation RNCP

4. ✅ Issue #46 - ADRs (10 ADRs complets)

### ⏳ Phase 2bis EN COURS - Sécurité & Qualité

5. ✅ Issue #44 Phase 1 - Couche d'autorisation (feedback encadrant) - MERGÉ
6. ⏳ Issue #45 - npm audit dans CI/CD (feedback encadrant)
7. 📋 Issue #36 - Normaliser module visualization
8. ✅ Issue #53 - Optimiser CI/CD (25% amélioration : 7m36s → 5m44s)

### 📋 Phase 3 - Features avancées (Avant RNCP Mars 2027)

8. 📋 Issue #41 - Auth interactive Playwright Frontend
9. 📋 Issue #43 - Extension tests E2E
10. 📋 Features ML & Leisure Mode (#47, #48, #49)

---

## 🔄 Workflow recommandé

### Pour chaque issue

1. **Créer branche:** `git checkout -b feat/issue-42-dto-mapper`
2. **Développer:** TDD (tests → code → refactor)
3. **Vérifier qualité:**
   ```bash
   npm run lint
   npm run type-check
   npm run test:unit
   npm run test:integration
   ```
4. **Commit:** Conventional Commits
   ```bash
   git commit -m "feat(api): add DTO mapper for frontend compatibility"
   ```
5. **Push + PR:** `gh pr create --title "feat: DTO Mapper (Issue #42)"`
6. **Review:** Attendre validation encadrant si possible
7. **Merge:** Squash and merge dans `main`

---

## 📅 Timeline (jusqu'au RNCP - Mars 2027)

| Période                    | Focus                       | Issues                          | Statut       |
| -------------------------- | --------------------------- | ------------------------------- | ------------ |
| ✅ Déc 2025 (S1-4)         | Architecture DDD/CQRS       | #37, Tests E2E                  | COMPLÉTÉ     |
| ✅ Déc 2025 (S5)           | Documentation RNCP          | #46 (10 ADRs), #53 (CI/CD)      | COMPLÉTÉ     |
| ⏳ **Déc 2025 / Jan 2026** | **Frontend V2 Integration** | **Frontend Issue #57 (5-6h)**   | **EN COURS** |
| ⏳ Jan 2026                | Sécurité & Qualité          | #44 (Autorisation), #45 (audit) | PLANIFIÉ     |
| 📋 Fév-Mars 2026           | Refactoring & Optimisation  | #36                             | PLANIFIÉ     |
| 📋 Avr-Déc 2026            | Features avancées           | #41, #43                        | PLANIFIÉ     |
| 📋 Jan-Fév 2027            | ML & Leisure Mode           | #47, #48, #49                   | PLANIFIÉ     |
| 🎯 Mars 2027               | **Présentation RNCP**       | -                               | OBJECTIF     |

---

## ✅ Critères de succès

### MVP Frontend-Backend connecté ✅ ATTEINT

- [x] ✅ DDD Architecture complète (3 couches: Domain, Application, Infrastructure)
- [x] ✅ API CRUD fonctionnelle (POST/PATCH/GET)
- [x] ✅ DTOs compatibles Frontend (StockDTO, StockMapper)
- [x] ✅ Tests E2E passants (Playwright + Azure AD B2C)
- [x] ✅ Documentation technique (10 ADRs complets)

### Production-ready ⏳ EN COURS

- [x] ✅ Couche d'autorisation Phase 1 (Issue #44 - Issue #62 mergée)
- [ ] 📋 npm audit dans CI/CD (Issue #45)
- [x] ✅ Tests coverage > 80% (142 tests domaine + 9 intégration + 4 E2E)
- [x] ✅ TypeScript strict mode (fait en v2.0.0)
- [x] ✅ CI/CD optimisée (Issue #53 - complété)

### Qualité RNCP ⏳ EN COURS

- [x] ✅ 10 ADRs complets (justification tous choix techniques)
- [x] ✅ Tests unitaires domaine (142 tests)
- [x] ✅ Tests intégration (9 tests avec TestContainers)
- [x] ✅ Tests E2E (4 tests Playwright + Azure AD B2C)
- [x] ✅ Documentation architecture
- [x] ✅ Couche d'autorisation Phase 1 (Issue #44 - #62 mergé, ADR-009, 4 phases planifiées #62-65)
- [x] ✅ npm audit CI/CD (Issue #45 - complété)

---

## 📊 Suivi d'avancement (Milestones GitHub)

L'avancement du projet est suivi via des milestones GitHub offrant des KPIs visuels (% completion, progress bars).

**Liens vers les milestones :**

- [Backend](https://github.com/SandrineCipolla/stockhub_back/milestones) - 9 milestones (versions + RNCP)
- [Frontend](https://github.com/SandrineCipolla/stockHub_V2_front/milestones) - 7 milestones
- [Design System](https://github.com/SandrineCipolla/stockhub_design_system/milestones) - 6 milestones

**Guide complet :** [docs/technical/milestones-guide.md](../technical/milestones-guide.md)

---

**Auteur:** Sandrine Cipolla
**Dernière mise à jour:** 2026-01-29
**Version:** 2.3.0 (Authorization Phase 1 release)
**Reviewer:** [Encadrant RNCP]
