# Roadmap StockHub Back — v2 → soutenance RNCP7 (mars 2027)

> Dernière mise à jour : avril 2026
> Horizon : ~11 mois

---

## Vue d'ensemble

| Phase                          | Période          | Focus                                      |
| ------------------------------ | ---------------- | ------------------------------------------ |
| **Phase 1** — Finitions V2     | Mai – Juin 2026  | Endpoints manquants, clean code, CI solide |
| **Phase 2** — Features domaine | Juil – Sept 2026 | Nouvelles fonctionnalités métier           |
| **Phase 3** — IA & données     | Oct – Déc 2026   | Bloc IA RNCP, ShoppingList, Recipe         |
| **Phase 4** — Soutenance       | Jan – Mars 2027  | Documentation, polish, démo                |

---

## Phase 1 — Finitions V2 (mai – juin 2026)

### Objectif

Compléter l'API V2 sur les points manquants, fiabiliser la CI, résorber la dette technique accumulée.

| #    | Ticket                                                           | Estimation | Priorité |
| ---- | ---------------------------------------------------------------- | ---------- | -------- |
| #191 | `GET /stocks/:stockId/items/:itemId` — endpoint détail item      | 2-3h       | 🔴       |
| #169 | Remplacer l'enum category par un champ free-text                 | 3-4h       | 🔴       |
| #158 | Ajouter un champ `note` libre sur les items                      | 2-3h       | 🔴       |
| #219 | Validation Zod sur les inputs controllers (ADR + implémentation) | 5-7h       | 🔴       |
| #207 | Extraire les fixtures inline vers `tests/fixtures/`              | 2-3h       | 🟡       |
| #209 | Améliorer la branch coverage (handlers, controllers)             | 3-5h       | 🟡       |
| #214 | Ajouter un job integration tests à la CI (TestContainers)        | 4-6h       | 🟡       |
| #225 | Branch protection rules sur `main` (GitHub Settings)             | 30min      | 🟡       |

**Total estimé : ~3-4 semaines à temps partiel**

---

## Phase 2 — Features domaine (juil – sept 2026)

### Objectif

Enrichir le modèle métier avec des fonctionnalités qui démontrent la maîtrise DDD/CQRS et la profondeur du domain model.

| #    | Ticket                                                                | Estimation | Priorité |
| ---- | --------------------------------------------------------------------- | ---------- | -------- |
| #135 | Cron job — recalcul quotidien des prédictions IA                      | 5-7h       | 🔴       |
| #133 | Suivi péremption avancé (`openedAt`, `ProductType` générique)         | 7-9h       | 🔴       |
| #36  | Refactoring visualization — symétrie CQRS avec manipulation           | 4-5h       | 🟡       |
| #126 | Spike faisabilité scan code-barres (ajout auto d'articles)            | 4-6h       | 🟡       |
| #131 | Audit et réconciliation des ADRs dans le wiki                         | 2-3h       | 🟡       |
| #138 | Registre des traitements RGPD (`docs/rgpd.md`)                        | 3-4h       | 🟡       |
| #224 | Procédure de rollback production (`docs/ci-cd/ROLLBACK-PROCEDURE.md`) | 1-2h       | 🟡       |

**Total estimé : ~4-5 semaines à temps partiel**

---

## Phase 3 — IA & données (oct – déc 2026)

### Objectif

Implémenter le bloc IA complet pour la certification RNCP7 (Bloc 2 — Solutions IA). C'est la partie la plus ambitieuse et la plus valorisante pour la soutenance.

### Ordre impératif (dépendances)

```
#148 Étude prompts IA          ─┐
#149 Modélisation données       ├─→ #152 Prisma Recipe ─→ #153 Prisma ShoppingList ─→ #156 CRUD SavedProject ─→ #170 AI Shopping list
#150 Étude function calling    ─┘
```

| #    | Ticket                                                         | Estimation | Notes        |
| ---- | -------------------------------------------------------------- | ---------- | ------------ |
| #148 | Étude prompts système pour suggestions IA par catégorie        | 3-4h       | Avant tout   |
| #149 | Modélisation données Recipe / SavedProject / ShoppingList      | 3-4h       | Avant tout   |
| #150 | Étude function calling vs JSON mode pour AIService             | 2-3h       | Avant tout   |
| #152 | Migration + modèle Prisma `Recipe` + `RecipeIngredient`        | 3-5h       | Après études |
| #153 | Migration + modèle Prisma `ShoppingList` + `ShoppingListItem`  | 3-5h       | Après #152   |
| #156 | CRUD `SavedProject` — domain + infrastructure + api (DDD/CQRS) | 9-12h      | Après #153   |
| #170 | AI shopping list generation avec sélection contextuelle        | 9-12h      | Après #156   |

**Total estimé : ~6-8 semaines à temps partiel**

---

## Phase 4 — Soutenance (jan – mars 2027)

### Objectif

Préparer la démonstration, finaliser la documentation, s'assurer que tout est propre et déployé.

| #    | Ticket                                                        | Estimation   | Notes                 |
| ---- | ------------------------------------------------------------- | ------------ | --------------------- |
| #205 | Étude SonarCloud — qualité de code                            | 3-4h         | Optionnel selon temps |
| #125 | Compte démo dédié pour le seed de démonstration               | 3-5h         | Avant démo            |
| —    | Mise à jour wiki complète (Backend-Guide, ADRs, Architecture) | 2-3h         | Avant soutenance      |
| —    | Vérification déploiement prod + staging                       | 1h           | Avant soutenance      |
| —    | Préparation support de démonstration                          | selon besoin | —                     |

**Tickets hors scope soutenance (à traiter après ou jamais)**

| #    | Ticket                       | Raison                              |
| ---- | ---------------------------- | ----------------------------------- |
| #64  | Notifications SSE/WebSockets | P4, pas de frontend consommateur    |
| #65  | Audit log, analytics avancés | P4, scope trop large                |
| #159 | Tags libres many-to-many     | Complexité élevée, valeur marginale |

---

## Résumé par ticket

| #    | Titre court                      | Phase | Estimation |
| ---- | -------------------------------- | ----- | ---------- |
| #36  | Refactoring visualization CQRS   | 2     | 4-5h       |
| #125 | Compte démo dédié                | 4     | 3-5h       |
| #126 | Spike scan code-barres           | 2     | 4-6h       |
| #131 | Audit ADRs wiki                  | 2     | 2-3h       |
| #133 | Suivi péremption avancé          | 2     | 7-9h       |
| #135 | Cron recalcul prédictions        | 2     | 5-7h       |
| #138 | RGPD registre traitements        | 2     | 3-4h       |
| #148 | Étude prompts IA                 | 3     | 3-4h       |
| #149 | Modélisation Recipe/ShoppingList | 3     | 3-4h       |
| #150 | Étude function calling vs JSON   | 3     | 2-3h       |
| #152 | Prisma Recipe                    | 3     | 3-5h       |
| #153 | Prisma ShoppingList              | 3     | 3-5h       |
| #156 | CRUD SavedProject                | 3     | 9-12h      |
| #158 | Champ note sur items             | 1     | 2-3h       |
| #159 | Tags libres (hors scope)         | —     | —          |
| #169 | Category free-text               | 1     | 3-4h       |
| #170 | AI shopping list                 | 3     | 9-12h      |
| #191 | GET item individuel              | 1     | 2-3h       |
| #205 | Étude SonarCloud                 | 4     | 3-4h       |
| #207 | Extraire fixtures inline         | 1     | 2-3h       |
| #209 | Branch coverage                  | 1     | 3-5h       |
| #214 | Integration tests CI             | 1     | 4-6h       |
| #219 | Zod validation                   | 1     | 5-7h       |
| #224 | Rollback procedure               | 2     | 1-2h       |
| #225 | Branch protection                | 1     | 30min      |
| #64  | SSE/WebSockets (hors scope)      | —     | —          |
| #65  | Audit log (hors scope)           | —     | —          |

---

> Ce planning est indicatif. Les estimations supposent des sessions de travail focalisées sans interruption.
> Revoir les priorités à chaque début de phase selon l'avancement du frontend et les retours de la soutenance blanche.
