# Roadmap Globale StockHub — RNCP7 (mars 2027)

> Dernière mise à jour : avril 2026
> Couvre les 3 repositories : `stockhub_back`, `stockHub_V2_front`, `stockhub_design_system`

---

## Planning macro

```
Mai – Juin 2026     │ Phase 1 — Finitions V2 (bugs, clean code, CI)
Juil – Sept 2026    │ Phase 2 — Features domaine + documentation RNCP
Octobre 2026        │ Phase 3 — Bloc IA (études + premières implémentations)
Novembre 2026       │ ✅ CHECKPOINT — "Est-ce démontrable ?"
Nov – Déc 2026      │ Phase 3 suite — Finalisation IA + polish
Janvier 2027        │ ⚡ SOUTENANCE BLANCHE
Fév – Mars 2027     │ Phase 4 — Corrections post-blanche + démo finale
Mars 2027           │ 🎓 SOUTENANCE
```

---

## Phase 1 — Finitions V2 (mai – juin 2026)

### Objectif

Corriger les bugs visibles, solidifier la CI, finir les endpoints manquants. Rien qui puisse faire douter un jury.

### Back — `stockhub_back`

| #    | Ticket                                                                                                                 | Estimation |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ---------- |
| #191 | `GET /stocks/:id/items/:itemId` — endpoint détail item                                                                 | 2-3h       |
| #169 | Category enum → free-text                                                                                              | 3-4h       |
| #158 | Champ `note` libre sur les items                                                                                       | 2-3h       |
| #219 | Validation Zod sur les inputs controllers                                                                              | 5-7h       |
| #207 | Extraire fixtures inline → `tests/fixtures/`                                                                           | 2-3h       |
| #209 | Améliorer branch coverage (handlers)                                                                                   | 3-5h       |
| #214 | Integration tests job en CI (TestContainers)                                                                           | 4-6h       |
| #225 | Branch protection rules sur `main`                                                                                     | 30min      |
| —    | Spike: stratégie cron sur Azure F1 (Azure Function vs endpoint protégé + GH Actions schedule) — trancher avant Phase 2 | 1h         |
| —    | Badge coverage dans README back (Codecov déjà branché)                                                                 | 15min      |

### Front — `stockHub_V2_front`

| #    | Ticket                                                                                                   | Estimation      |
| ---- | -------------------------------------------------------------------------------------------------------- | --------------- |
| #30  | fix: Vercel optionalDependencies (P1 bug) — **à diagnostiquer** (~30min-1h une fois la cause identifiée) | à diagnostiquer |
| #138 | fix: landing — cloche notif + copyright (bug visible)                                                    | 1h              |
| #51  | fix(a11y): score 86 → 95+ (4 issues critiques)                                                           | 4-6h            |
| #23  | tech-debt: type safety post-merge conflicts                                                              | 3-4h            |
| #38  | tech-debt: type assertions restantes (stockId)                                                           | 2-3h            |

### Design System — `stockhub_design_system`

| #   | Ticket                                           | Estimation |
| --- | ------------------------------------------------ | ---------- |
| #27 | fix: contraste bouton ghost light mode (WCAG AA) | 1-2h       |
| #33 | fix: label-content-name-mismatch sur sh-header   | 1h         |
| #34 | fix: button-name sur sh-button Shadow DOM        | 1h         |
| #24 | Upgrade Node 22 + Storybook v10                  | 3-5h       |

**Total phase 1 : ~4-5 semaines**

---

## Phase 2 — Features domaine + documentation RNCP (juil – sept 2026)

### Objectif

Ajouter des fonctionnalités métier démontrables et constituer la documentation RNCP (veille techno, ADRs, RGPD). Ce que
le jury lira avant même de voir le code.

### Back — `stockhub_back`

| #    | Ticket                                                  | Estimation | Notes                                                                                                                                                       |
| ---- | ------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #135 | Recalcul quotidien prédictions                          | 5-7h       | Stratégie tranchée en Phase 1 (spike) — Azure Function ou endpoint `/admin/predictions/recalculate` + GH Actions schedule. Documenter le choix dans un ADR. |
| #133 | Suivi péremption (`openedAt`, `ProductType`)            | 7-9h       | —                                                                                                                                                           |
| #36  | Refactoring visualization — symétrie CQRS               | 4-5h       | —                                                                                                                                                           |
| #138 | Registre RGPD (`docs/rgpd.md`)                          | 3-4h       | —                                                                                                                                                           |
| #224 | Procédure rollback (`docs/ci-cd/ROLLBACK-PROCEDURE.md`) | 1-2h       | —                                                                                                                                                           |
| #131 | Audit et réconciliation ADRs wiki                       | 2-3h       | —                                                                                                                                                           |

### Front — `stockHub_V2_front`

| #    | Ticket                                              | Estimation | Dépend de |
| ---- | --------------------------------------------------- | ---------- | --------- |
| #142 | Afficher et éditer la note libre d'un article       | 3-4h       | Back #158 |
| #144 | Custom category input + autocomplete                | 3-4h       | Back #169 |
| #165 | Items en cards sur mobile                           | 3-4h       | Back #191 |
| #61  | Confirmation modal avant suppression stock          | 2-3h       | —         |
| #90  | Veille techno — sources et pratiques (RNCP Ce2.3.1) | 4-6h       | —         |
| #4   | RNCP Checklist suivi — mise à jour                  | 2-3h       | —         |
| #59  | Tests: fix useStocks après intégration backend      | 2-3h       | —         |
| #35  | Tests: couverture utils + composants IA             | 3-5h       | —         |

### Design System — `stockhub_design_system`

| #   | Ticket                                        | Estimation |
| --- | --------------------------------------------- | ---------- |
| #13 | Audit responsive général tous composants      | 4-6h       |
| #15 | Setup infrastructure tests (@open-wc/testing) | 3-4h       |
| #16 | Tests unitaires sh-button, sh-stock-card      | 3-5h       |
| #20 | Audit et nettoyage design tokens hardcodés    | 3-4h       |

**Total phase 2 : ~5-6 semaines**

---

## Phase 3 — Bloc IA (oct – déc 2026)

### Objectif

Implémenter le bloc IA pour la certification RNCP7. C'est la pièce maîtresse de la soutenance.

### MVP IA minimal garanti pour le checkpoint novembre

> **Seul #139 (Page Suggestions) doit être déployé au checkpoint.**
> Il s'appuie sur le service LLM OpenRouter/Mistral déjà en place (N2) — pas besoin d'attendre #152–#156.
> #170 (shopping list AI) est un bonus de décembre si la Phase 3 avance bien.

### Clarification sur #139

`#139 Page Suggestions 'Que faire avec ce que j'ai ?'` s'appuie sur le **service LLM N2 existant** (OpenRouter/Mistral
via `OpenRouterAIService` + `getCachedAISuggestions`). Ce backend est déjà en prod. Pas de nouveau ticket back requis
pour débloquer #139.

### Ordre impératif (dépendances entre repos)

```
Back: études (#148, #149, #150)
        ↓
Back: Prisma Recipe (#152) + ShoppingList (#153)
        ↓
Back: CRUD SavedProject (#156)
        ↓
Back: AI Shopping list generation (#170) → Front: Shopping list UI (#140) + Bibliothèque projets (#141)

En parallèle dès octobre :
Front: Page Suggestions IA (#139) ← back LLM N2 déjà disponible  ← MVP checkpoint novembre
```

### Back — `stockhub_back`

| #    | Ticket                                            | Estimation | Ordre         |
| ---- | ------------------------------------------------- | ---------- | ------------- |
| #148 | Étude prompts IA par catégorie                    | 3-4h       | 1             |
| #149 | Modélisation Recipe / ShoppingList / SavedProject | 3-4h       | 1             |
| #150 | Étude function calling vs JSON mode               | 2-3h       | 1             |
| #152 | Migration + modèle Prisma `Recipe`                | 3-5h       | 2             |
| #153 | Migration + modèle Prisma `ShoppingList`          | 3-5h       | 3             |
| #156 | CRUD SavedProject DDD/CQRS                        | 9-12h      | 4             |
| #170 | AI shopping list generation                       | 9-12h      | 5 — bonus déc |

### Front — `stockHub_V2_front`

| #    | Ticket                                              | Estimation | Dépend de              | Priorité         |
| ---- | --------------------------------------------------- | ---------- | ---------------------- | ---------------- |
| #139 | Page Suggestions 'Que faire avec ce que j'ai ?'     | 6-8h       | Back LLM N2 (dispo)    | **MVP novembre** |
| #140 | Page liste d'approvisionnement (générée + éditable) | 7-9h       | Back #170              | Bonus déc        |
| #141 | Bibliothèque projets sauvegardés                    | 6-8h       | Back #156              | Bonus déc        |
| #145 | Shopping list UI — générer, afficher, exporter      | 5-7h       | Back #153              | Bonus déc        |
| #143 | Gestion et filtrage tags libres                     | 4-5h       | Back #159 (hors scope) | Hors scope       |

### Design System — `stockhub_design_system`

| #   | Ticket                    | Estimation |
| --- | ------------------------- | ---------- |
| #17 | Ajuster padding bouton md | 1h         |

> #26 (`sh-feature-card`) déplacé en hors scope — la landing page n'est pas une priorité soutenance.

**Total phase 3 : ~8-10 semaines**

---

## ✅ Checkpoint novembre 2026 — "Est-ce démontrable ?"

**Date cible : début novembre 2026**

Ce checkpoint existe pour éviter de découvrir en janvier qu'il manque un livrable. C'est une mini-soutenance à blanc
entre soi.

### Liste de vérification

#### Fonctionnel

- [ ] Flow complet authentification → CRUD stocks/items fonctionne en prod
- [ ] **#139 Page Suggestions IA déployée** (MVP IA minimal garanti)
- [ ] Prédictions ML visibles et correctes
- [ ] Rôles collaborateurs fonctionnels (OWNER / EDITOR / VIEWER)

#### Qualité

- [ ] Score a11y ≥ 95 (Lighthouse)
- [ ] Couverture tests back ≥ 85% statements
- [ ] E2E stables sur le flow principal
- [ ] 0 CVE high/critical (`npm audit --audit-level=high`)

#### Documentation

- [ ] Tous les ADRs à jour dans le wiki
- [ ] Veille techno rédigée (front #90)
- [ ] RGPD documenté (back #138)
- [ ] OpenAPI à jour

#### Infrastructure

- [ ] Staging déployé et stable
- [ ] Prod déployée et stable
- [ ] Rollback procedure documentée (back #224)
- [ ] Branch protection active (back #225)

### Si le checkpoint révèle des manques

- **Fonctionnel manquant** → reprioriser immédiatement, décaler Phase 3 bonus si nécessaire
- **Documentation manquante** → sprint dédié docs en novembre
- **Qualité insuffisante** → ne pas démarrer de nouvelles features avant d'avoir corrigé

---

## ⚡ Soutenance blanche — janvier 2027

**Date cible : mi-janvier 2027**

Simulation complète de la soutenance devant un pair ou un mentor.

### Préparer avant la blanche

- [ ] Back #205 — SonarCloud (si temps disponible)
- [ ] Back #125 — compte démo dédié avec données réalistes
- [ ] Front #43 — RNCP checklist synchronisée
- [ ] Wiki complet (Backend-Guide, Architecture, ADRs, CICD)
- [ ] Support de démonstration préparé

### Après la blanche

Utiliser le retour pour corriger les points soulevés pendant les 6 semaines restantes (fév – mars 2027).

---

## Phase 4 — Corrections + démo finale (fév – mars 2027)

**Pas de nouvelles features.** Uniquement :

- Corrections identifiées à la blanche
- Polish UX si critique
- Répétition de la démonstration
- Vérification déploiement prod la veille

---

## Corrélations entre repos

| Feature             | Back              | Front             | DS               |
| ------------------- | ----------------- | ----------------- | ---------------- |
| Note sur items      | #158              | #142              | —                |
| Category free-text  | #169              | #144              | —                |
| Tags libres         | #159 (hors scope) | #143 (hors scope) | —                |
| Item détail         | #191              | #165              | —                |
| Suggestions IA      | LLM N2 existant   | #139              | —                |
| Shopping list       | #153 + #170       | #140 + #145       | —                |
| Projets sauvegardés | #156              | #141              | —                |
| Notification panel  | #64 (hors scope)  | #163 (hors scope) | —                |
| Landing visuelle    | —                 | #121 (hors scope) | #26 (hors scope) |
| A11y                | —                 | #51               | #27 #33 #34      |

---

## Hors scope (post-soutenance)

| Repo  | #    | Titre                                     |
| ----- | ---- | ----------------------------------------- |
| Back  | #64  | Notifications SSE/WebSockets              |
| Back  | #65  | Audit log, analytics avancés              |
| Back  | #159 | Tags libres many-to-many                  |
| Front | #143 | Gestion tags libres (dépend de back #159) |
| Front | #163 | Notification panel                        |
| Front | #121 | Aperçus visuels landing                   |
| Front | #28  | Setup E2E Playwright complet              |
| Front | #66  | E2E complets front + back                 |
| Front | #101 | Playwright auth interactive               |
| DS    | #26  | sh-feature-card                           |

---

> Revoir ce document à chaque début de phase et après la soutenance blanche.
