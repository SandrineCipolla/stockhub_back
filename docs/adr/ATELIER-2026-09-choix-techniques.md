# Atelier : justifier ses propres choix techniques — StockHub V2

**Date :** 2026-09-09
**Périmètre :** Backend (`stockhub_back`) + Frontend (`stockHub_V2_front`) — vue de contexte unique, inventaires séparés
**Objectif :** vérifier que les choix techniques de StockHub sont argumentés (contrainte/critère/hypothèse/preuve), et non hérités par réflexe ou tutoriel.

---

## 1. Vue de contexte

```
                    ┌─────────────────────────┐
                    │   Sandrine (famille)     │
                    │   utilisatrice           │
                    └────────────┬─────────────┘
                                 │ HTTPS
                    ┌────────────▼─────────────┐
                    │   StockHub (le système)   │
                    │  gestion de stock + ML     │
                    └───┬───────┬───────┬───────┘
                        │       │       │
             ┌──────────▼──┐ ┌──▼────┐ ┌▼─────────────┐
             │ Azure AD B2C│ │ Azure │ │ OpenRouter /  │
             │ (identité)  │ │ MySQL │ │ Mistral (LLM) │
             └─────────────┘ └───────┘ └───────────────┘
                        │
             ┌──────────▼───────────┐
             │ Render.com + Aiven    │
             │ (staging uniquement)  │
             └───────────────────────┘
```

**Systèmes externes** : Azure AD B2C (authentification), Azure Database for MySQL (prod), Aiven MySQL (staging), OpenRouter/Mistral (prédictions ML), GitHub (CI/CD, Project board).
**Ce qui appartient au projet** : l'app React (front), l'API Express/DDD-CQRS (back) — pas encore les frameworks/BDD à ce stade de la vue.

---

## 2. Inventaire des choix existants

### Backend (`stockhub_back`)

| Niveau                | Choix                                            | Origine         | ADR existant                                                                                               | Parties concernées par un remplacement |
| --------------------- | ------------------------------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| système / déploiement | Azure App Service (prod), Render+Aiven (staging) | décision projet | [ADR-006](./ADR-006-mysql-azure-cloud.md), [ADR-011](./ADR-011-staging-render-aiven.md)                    | CI/CD, DNS, secrets                    |
| organisation interne  | DDD / CQRS (domain → infra → api)                | décision projet | [ADR-001](./ADR-001-migration-ddd-cqrs.md)                                                                 | toute nouvelle feature, onboarding     |
| interfaces            | REST versionné (`/api/v2`)                       | décision projet | [ADR-016](./ADR-016-rest-api-style.md), [ADR-005](./ADR-005-api-versioning-v2.md)                          | client front, doc OpenAPI              |
| accès aux données     | Prisma ORM                                       | décision projet | [ADR-002](./ADR-002-choix-prisma-orm.md)                                                                   | tous les repositories infra            |
| dépendances           | Express                                          | décision projet | [ADR-017](./ADR-017-express-framework.md)                                                                  | routing, middlewares                   |
| dépendances           | Azure AD B2C (Passport Bearer)                   | décision projet | [ADR-003](./ADR-003-azure-ad-b2c-authentication.md)                                                        | auth middleware, front (MSAL)          |
| dépendances           | OpenRouter + Mistral                             | décision projet | [ADR-013](./ADR-013-llm-provider-local-vs-cloud.md), [ADR-015](./ADR-015-openrouter-mistral-ai-service.md) | service prédiction                     |
| système               | Node.js 22 LTS                                   | décision projet | [ADR-012](./ADR-012-upgrade-node-22.md)                                                                    | runtime, CI                            |
| process               | GitHub Flow                                      | décision projet | [ADR-018](./ADR-018-github-flow.md)                                                                        | conventions de branches                |

**Constat** : le backend a **19 ADR** — la couverture est déjà excellente. Le travail de l'atelier ici n'est pas "documenter", c'est "vérifier la forme" (étape 3 ci-dessous).

### Frontend (`stockHub_V2_front`)

**Correction** : contrairement à ce qu'indiquait la première version de ce document, le front a bien des ADR d'architecture — ils vivent sur le **wiki** (`stockHub_V2_front.wiki` → page `Architecture-Decision-Records.md`), pas dans `stockHub_V2_front/docs/adr/`.

| Niveau       | Choix                                                         | Origine             | ADR existant                                                                    | Parties concernées par un remplacement |
| ------------ | ------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------- | -------------------------------------- |
| rendu web    | React 19 + Vite (CSR, pas de SSR)                             | décision argumentée | Wiki ADR-008 (React), ADR-009 (Vite)                                            | tout le front                          |
| organisation | Design System séparé (repo indépendant, Web Components Lit)   | décision argumentée | Wiki ADR-001, ADR-002                                                           | tous les composants UI                 |
| déploiement  | Vercel (front) / Azure (back)                                 | décision argumentée | Wiki ADR-006                                                                    | CI/CD, DNS                             |
| interfaces   | Coexistence API v1/v2 côté consommation                       | décision argumentée | Wiki ADR-007                                                                    | appels API du front                    |
| interne      | Types centralisés `src/types/`, fixtures centralisées         | décision argumentée | Wiki ADR-004, ADR-005                                                           | composants, tests                      |
| CSS          | Container Queries + `:has()` plutôt que Tailwind seul         | décision argumentée | Wiki ADR-010                                                                    | composants responsives                 |
| tests        | Vitest + Playwright avec auth interactive réelle (pas mockée) | décision argumentée | Wiki ADR-012                                                                    | CI E2E                                 |
| détail UI    | Dual-view responsive items (mobile cards / desktop table)     | décision argumentée | Wiki ADR-011 **et** repo front `docs/adr/ADR-001-items-responsive-dual-view.md` | `StockDetailPage`                      |

**Constat révisé** : le front n'a pas de gap de fond — les décisions structurantes (framework, build tool, déploiement, design system, tests E2E) sont déjà argumentées, avec alternatives et compromis, au même niveau de qualité que le back. Le vrai problème est ailleurs (voir ci-dessous).

### Fiche de stack — Backend

_(format demandé par la fiche "Comprendre une stack technique" du cours : couche, techno + version, rôle, raison/preuve, condition de réexamen)_

| Couche                    | Technologie et version                                                 | Rôle dans le projet                                  | Raison ou preuve                                                                                           | Condition de réexamen                                                                     |
| ------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| interface (API)           | REST versionné `/api/v2`                                               | contrat d'échange avec le front                      | [ADR-016](./ADR-016-rest-api-style.md) : un seul client, ressources hiérarchiques                          | si un second client (mobile) apparaît avec des besoins de sur-fetching différents         |
| backend                   | Express 4.20.0                                                         | routes, middlewares, transport HTTP                  | [ADR-017](./ADR-017-express-framework.md) : minimal, sépare transport et domaine                           | si le besoin de DI/modules structurés dépasse ce qu'Express permet simplement             |
| organisation interne      | DDD/CQRS (`domain/`→`infrastructure/`→`api/`)                          | séparation logique métier / persistance / transport  | [ADR-001](./ADR-001-migration-ddd-cqrs.md)                                                                 | — (cf. ADR-020 pour l'exception middleware d'autorisation)                                |
| environnement d'exécution | Node.js 22 LTS                                                         | exécution du code applicatif                         | [ADR-012](./ADR-012-upgrade-node-22.md)                                                                    | à la fin du support LTS de Node 22                                                        |
| données                   | Prisma 6.16.0 + MySQL (Azure Database, Flexible Server Burstable B1ms) | persistance, migrations, requêtes typées             | [ADR-002](./ADR-002-choix-prisma-orm.md), [ADR-006](./ADR-006-mysql-azure-cloud.md)                        | si `$queryRaw` dépasse 10% des requêtes domaine, ou si le trafic dépasse la capacité B1ms |
| identité                  | Azure AD B2C (Passport Bearer)                                         | authentification, gestion des tokens                 | [ADR-003](./ADR-003-azure-ad-b2c-authentication.md)                                                        | —                                                                                         |
| IA / prédiction           | OpenRouter + Mistral Small 3.1 (fetch natif)                           | suggestions textuelles sur prédictions déterministes | [ADR-013](./ADR-013-llm-provider-local-vs-cloud.md), [ADR-015](./ADR-015-openrouter-mistral-ai-service.md) | si le budget ou la latence (>3s p95) deviennent problématiques                            |
| système et hébergement    | Azure App Service (prod), Render.com + Aiven MySQL (staging)           | exécution et livraison                               | [ADR-011](./ADR-011-staging-render-aiven.md)                                                               | —                                                                                         |
| process                   | GitHub Flow                                                            | branches, releases (Release Please)                  | [ADR-018](./ADR-018-github-flow.md)                                                                        | si le solo devient une équipe à releases planifiées                                       |

**Couches que la stack laisse ouvertes** : pas de cache dédié (Redis) — le cache actuel est en base ([ADR-015](./ADR-015-openrouter-mistral-ai-service.md)) ; pas de message queue ; pas de CDN dédié (Azure App Service sert directement).

### Fiche de stack — Frontend

| Couche                 | Technologie et version                                                   | Rôle dans le projet                                | Raison ou preuve                                                                                                         | Condition de réexamen                                                                        |
| ---------------------- | ------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| interface              | React 19.1.0 + TypeScript 5.8.3                                          | composants, état, rendu                            | Wiki ADR-008 : employabilité, cross-platform futur                                                                       | si React perd sa position dominante sur le marché de l'emploi front en France                |
| rendu web              | CSR (pas de SSR), Vite 6.3.5 comme build tool                            | build, dev server, bundling                        | Wiki ADR-009 : CRA déprécié, HMR rapide                                                                                  | si StockHub expose des pages publiques nécessitant du SEO                                    |
| design system          | `@stockhub/design-system` 1.3.1 (Lit / Web Components), repo indépendant | composants UI réutilisables, framework-agnostiques | Wiki ADR-001, ADR-002                                                                                                    | si le coût de maintenance des wrappers React dépasse le bénéfice de portabilité              |
| style                  | TailwindCSS + Container Queries/`:has()` natifs                          | mise en forme, responsive                          | Wiki ADR-010                                                                                                             | si le support navigateur cible descend sous la couverture actuelle                           |
| accès API              | `fetch` natif, pas de client HTTP dédié                                  | appels REST vers `/api/v1` et `/api/v2`            | [ADR-020](https://github.com/SandrineCipolla/stockHub_V2_front/blob/main/docs/adr/ADR-020-fetch-natif-plutot-quaxios.md) | si le nombre de call sites dépasse ~15-20 fichiers, ou besoin d'intercepteur (refresh token) |
| identité               | MSAL (Azure AD B2C côté client)                                          | authentification interactive                       | lié à Wiki ADR-012 (E2E auth réelle)                                                                                     | —                                                                                            |
| tests                  | Vitest (unitaire), Playwright (E2E, auth interactive réelle)             | qualité, non-régression                            | Wiki ADR-012                                                                                                             | si un compte de test B2C dédié devient provisionnable de façon fiable                        |
| système et hébergement | Vercel (plan gratuit)                                                    | build, preview URLs par PR, hosting statique       | Wiki ADR-006                                                                                                             | si le projet unifie son infra sous un seul cloud provider                                    |

**Couches que la stack laisse ouvertes** : pas de state manager global (Redux/Zustand) identifié — à vérifier si React 19 + hooks suffisent durablement ; pas de SSR/edge runtime (cohérent avec le choix CSR).

### Fiche de stack — Design System (`stockhub_design_system`)

| Couche                 | Technologie et version                                 | Rôle dans le projet                                | Raison ou preuve                                                              | Condition de réexamen                                                |
| ---------------------- | ------------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| composants UI          | Lit 3.x (Web Components) + TypeScript                  | composants réutilisables, agnostiques du framework | Wiki ADR-001, ADR-002 : portabilité inter-framework, isolation CSS Shadow DOM | si la surcharge des wrappers React dépasse le bénéfice d'agnosticité |
| wrappers               | `@lit/react`                                           | génération de composants React natifs              | Wiki ADR-002 : intégration transparente avec le JSX React                     | —                                                                    |
| documentation & visuel | Storybook 8.x + Chromatic                              | catalogue interactif, revue visuelle automatisée   | Wiki ADR-003 : documentation vivante des composants UI                        | —                                                                    |
| accessibilité (a11y)   | Norme WCAG AA (labels, contrastes, navigation clavier) | conformité d'accessibilité numérique               | Issues DS #27, #33, #34                                                       | si le score Lighthouse A11y descend sous 95                          |

### Matrice de Parité Tri-Repos (Backend ↔ Frontend ↔ Design System)

| Fonctionnalité / Choix | Backend (`stockhub_back`)               | Frontend (`stockHub_V2_front`)      | Design System (`stockhub_design_system`) | Statut d'alignement ISO |
| ---------------------- | --------------------------------------- | ----------------------------------- | ---------------------------------------- | ----------------------- |
| **Champ `note` libre** | PR #246 (Prisma, DTOs, OpenAPI)         | Ticket #142 (Saisie UI & affichage) | Composants Form / Textarea               | ✅ Alignment ISO        |
| **Category free-text** | PR #242 (`VARCHAR(50)`)                 | Ticket #144 (Autocomplete input)    | Composants Input / Dropdown              | ✅ Alignment ISO        |
| **Détail item**        | PR #233 (`GET /stocks/:sId/items/:iId`) | Ticket #165 (Vue cartes & détail)   | Dual-view responsive (ADR-011)           | ✅ Alignment ISO        |
| **IA & Suggestions**   | OpenRouter + Mistral (Cache DB)         | Ticket #139 (Page Suggestions IA)   | Cards & Badges IA                        | ✅ Alignment ISO        |
| **Auth & Sécurité**    | Passport Bearer JWT (Azure B2C)         | MSAL (Auth interactive B2C)         | Wrappers UI sécurisés                    | ✅ Alignment ISO        |
| **Qualité & Tests**    | Jest + TestContainers (MySQL réel)      | Vitest + Playwright (E2E)           | Storybook + Chromatic + @open-wc         | ✅ Alignment ISO        |

---

### Le vrai problème découvert : deux sources de vérité qui divergent déjà

1. **Numérotation incohérente entre wiki et repo.** La décision "dual-view responsive" est `ADR-011` sur le wiki mais `ADR-001` dans `stockHub_V2_front/docs/adr/`. Le back, lui, garde la même numérotation des deux côtés (le wiki résume ADR-013 à ADR-019 avec les mêmes numéros que `stockhub_back/docs/adr/`). Le pattern "un seul numéro par décision, le wiki ne fait que résumer" existe déjà côté back — il n'a simplement pas été appliqué aux ADR front nées avant que cette convention soit prise.
2. **Deux formats différents.** Les ADR du wiki (front) n'ont pas les sections Statut/Décideurs/Validation des ADR back, et sont plus narratives. Ce n'est pas un problème en soi (le cours accepte un format court), mais ça complique la comparaison et la relecture croisée (étape 7 de l'atelier).
3. **Risque de drift** : si une décision front est mise à jour dans le wiki mais pas dans le repo (ou l'inverse), laquelle fait foi ? Le repo backend a déjà tranché cette question pour lui-même (fichiers `docs/adr/*.md` = source, wiki = résumé + lien — cf. `CLAUDE.md`, section "Après le merge"). Le front n'applique pas encore cette règle à ses propres ADR.

---

## 3. Classer les arguments (étape 3 du cours)

Sur les ADR backend déjà écrits, le test à faire pour chacun :

| ADR                   | Décision argumentée ?                                             | Ce qui manque pour le format du cours                                                                                                                        |
| --------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ADR-002 (Prisma)      | ✅ oui — contexte, alternatives, conséquences négatives présentes | contraintes et critères mélangés dans "Besoin métier" ; pas de seuil de réexamen explicite                                                                   |
| ADR-006 (MySQL Azure) | ✅ oui — très détaillé                                            | idem : bonne séparation informelle contrainte/critère, mais pas de tableau explicite ; le "Risque 1/2/3" fait déjà office de réexamen mais sans mesure-seuil |
| ADR-016 (REST)        | ✅ oui                                                            | pas d'hypothèses marquées comme telles (ex : "le seul client est React" est une hypothèse qui peut changer si une appli mobile arrive)                       |

**Verdict global** : tes ADR ne sont **pas de simples préférences** — ils contiennent déjà contexte + alternatives + conséquences négatives, ce qui est le cœur du format Nygard. Ce qui manque systématiquement, ce sont les 3 sections que le cours ajoute au-delà de Nygard : **contraintes/critères séparés explicitement**, **hypothèses marquées + preuve/vérification**, **seuil de réexamen mesurable**. C'est un problème de forme, pas de fond — voir template enrichi ci-dessous.

---

## 4. Exemple de scénario de qualité

Pris sur un point réel non encore documenté : la latence des prédictions LLM.

| Champ             | Valeur                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Source            | Sandrine consultant la page stock                                                                                                       |
| Stimulus          | demande de prédiction de rupture pour un item                                                                                           |
| Environnement     | usage normal, hors pic                                                                                                                  |
| Partie du système | service prédiction → OpenRouter/Mistral                                                                                                 |
| Réponse attendue  | prédiction affichée ou message de fallback                                                                                              |
| Mesure            | **hypothèse à vérifier** : p95 < 3s ; pas encore mesuré en prod → à instrumenter via Application Insights avant de le figer dans un ADR |

---

## 5. Exemple de comparaison d'options

Reprise a posteriori d'ADR-006 (MySQL Azure) sous forme de grille pondérée, pour montrer la méthode — les notes viennent du contenu déjà écrit dans l'ADR, pas d'une nouvelle évaluation :

| Critère                                       | Poids | Azure MySQL, note | résultat | Supabase, note | résultat |
| --------------------------------------------- | ----- | ----------------- | -------- | -------------- | -------- |
| Coût (12 premiers mois)                       | 2     | 5                 | 10       | 5              | 10       |
| Cohérence écosystème (déjà sur Azure)         | 3     | 5                 | 15       | 1              | 3        |
| Storage / marge de croissance                 | 2     | 4                 | 8        | 1              | 2        |
| Portabilité (pas de lock-in API propriétaire) | 2     | 4                 | 8        | 2              | 4        |
| **Total**                                     |       |                   | **41**   |                | **19**   |

Ce tableau n'est pas dans ADR-006 aujourd'hui — c'est le genre d'ajout qui rendrait la comparaison vérifiable plutôt que narrative.

---

## 6. Deux ADR (étape 6 de l'atelier)

L'atelier demande explicitement deux ADR : un qui **confirme** un choix existant, un qui **propose une alternative** à un choix existant. Fait, chacun avec migration décomposée / conditions d'abandon là où l'étape le demande :

1. **Confirmer un choix existant** → [ADR-020 (front) — fetch natif plutôt qu'axios](https://github.com/SandrineCipolla/stockHub_V2_front/blob/main/docs/adr/ADR-020-fetch-natif-plutot-quaxios.md). Décision jamais documentée nulle part (ni repo, ni wiki) avant ce travail. Contraintes/critères séparés, hypothèses et preuves, grille de comparaison pondérée (fetch vs Axios vs ky), scénario de qualité, seuil de réexamen mesurable. Publié : [PR #263](https://github.com/SandrineCipolla/stockHub_V2_front/pull/263), résumé sur le [wiki](https://github.com/SandrineCipolla/stockHub_V2_front/wiki/Architecture-Decision-Records).
2. **Proposer une alternative à un choix existant** → [ADR-020 (back) — conversion hexagonale du middleware d'autorisation](./ADR-020-conversion-hexagonale-authorize-middleware.md), alternative à [ADR-019](./ADR-019-authorize-middleware-couches-classiques.md). Statut `Proposé` (pas encore accepté, conformément à l'atelier). Contient la migration décomposée (conversion des données / adaptation du code / tests / déploiement / retour arrière) et les conditions explicites d'abandon ou de réexamen de la proposition. Numéro local au repo back, sans lien avec l'ADR-020 du front (voir décision de numérotation locale par repo ci-dessous).

**Résolu au passage** : la divergence de numérotation entre wiki (`ADR-011`) et repo front (`ADR-001`) pour la décision dual-view — fusionnée sous `ADR-011` partout, cf. [PR #263](https://github.com/SandrineCipolla/stockHub_V2_front/pull/263).

**Décision prise après cet atelier** : abandon de la numérotation globale front+back envisagée plus haut. Chaque repo garde sa propre séquence locale (back : ADR-001 à ADR-020, sans trou ; front : sa propre séquence, y compris son propre ADR-020, sans rapport avec celui de back). Le wiki tient la table de correspondance entre les deux séquences plutôt qu'une numérotation unique. Voir `docs/adr/INDEX.md` pour la règle actuelle.

---

## 7. Grille de relecture (à réutiliser telle quelle)

| Point de contrôle                                                    | Validé         | À revoir                                                                                                                                                             |
| -------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Le périmètre, les personnes et les systèmes externes sont identifiés | ✅ (section 1) |                                                                                                                                                                      |
| Contraintes séparées des critères                                    | ⚠️             | à ajouter dans le template                                                                                                                                           |
| Hypothèses nommées + vérification prévue                             | ⚠️             | ex. latence LLM non mesurée                                                                                                                                          |
| Preuves sourcées                                                     | ✅ partiel     | benchmarks internes présents dans ADR-002/006                                                                                                                        |
| Au moins deux options comparées sur les mêmes critères               | ✅             | déjà fait dans la plupart des ADR back                                                                                                                               |
| Conséquences positives ET négatives                                  | ✅             | déjà systématique côté back                                                                                                                                          |
| Seuil de réexamen observable                                         | ✅             | présent sur ADR-020 front et ADR-020 back ; à généraliser aux ADR back plus anciens (ADR-006 s'en approche le plus)                                                  |
| Front : décisions structurantes documentées                          | ✅             | présentes, désormais aussi dans `stockHub_V2_front/docs/adr/` (PR #263), pas seulement sur le wiki                                                                   |
| Une seule source de vérité par décision                              | ✅             | dual-view fusionnée sous ADR-011 partout ; numérotation locale par repo, table de correspondance sur le wiki (décision prise après cet atelier, voir note plus haut) |
| Fiche de stack (back + front)                                        | ✅             | voir section 2 ci-dessus                                                                                                                                             |
| Deux ADR (confirmer + proposer alternative)                          | ✅             | ADR-020 front (confirme) et ADR-020 back (propose) — mêmes numéros, repos différents, numérotation locale                                                            |
| Relecture croisée par une autre personne (étape 7)                   | ❌             | nécessite une deuxième personne réelle — pas quelque chose qu'un outil peut simuler de façon crédible                                                                |

---

## État d'avancement

| Livrable de l'atelier                           | Statut                                              |
| ----------------------------------------------- | --------------------------------------------------- |
| Vue de contexte                                 | ✅ section 1                                        |
| Inventaire des choix existants                  | ✅ section 2                                        |
| Fiche de stack (rôle de chaque techno)          | ✅ section 2                                        |
| Contraintes/critères/hypothèses/preuves séparés | ✅ section 3, ADR-020 front, ADR-020 back           |
| Scénario de qualité mesurable                   | ✅ section 4 (+ un second dans ADR-020 front)       |
| Comparaison d'au moins deux options             | ✅ section 5 (+ grille pondérée dans ADR-020 front) |
| Deux ADR (confirmer + proposer une alternative) | ✅ section 6 (ADR-020 front, ADR-020 back)          |
| Relecture croisée (étape 7)                     | ❌ demande une deuxième personne                    |

**Reste à faire par Sandrine** : relire et merger la [PR #263](https://github.com/SandrineCipolla/stockHub_V2_front/pull/263) (déjà poussée), relire/pousser ADR-020 côté back (encore en local à ce stade), et faire relire les deux ADR-020 (front et back) par une autre personne pour l'étape 7 — c'est la seule partie de l'atelier qu'un outil ne peut pas exécuter à ta place.
