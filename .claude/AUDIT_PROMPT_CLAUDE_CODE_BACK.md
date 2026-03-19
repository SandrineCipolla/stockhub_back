# Prompt Claude Code — Audit StockHub V2 Back-end

> **Mode d'emploi** : Copie-colle ce contenu directement dans ton terminal Claude Code
> (`claude` dans le dossier `stockhub_back`). Demande-lui de traiter un audit à la fois.

---

## CONTEXTE

Je suis en certification RNCP Niveau 7 (Expert en Architecture et Développement Logiciel).
Mon back-end StockHub V2 utilise :

- **Node.js 20 + TypeScript strict + Express**
- **Architecture DDD/CQRS** avec entités, Value Objects, repositories, services
- **Prisma ORM** avec MySQL (Azure en prod, Aiven en staging)
- **Authentification Azure AD B2C** avec JWT Bearer sur toutes les routes
- **APIs REST v1 + v2** documentées OpenAPI 3.0 + Swagger UI
- **Jest** pour tests unitaires, intégration et E2E (Playwright)
- **GitHub Actions** pour CI/CD (ci.yml + security-audit.yml)
- **Docker + compose.yaml** pour environnement local
- **Déploiements** : Azure App Service (prod) + Render.com (staging)

La grille d'évaluation RNCP couvre 4 blocs :

- **Ce2.4** : Développement back-end (7 critères)
- **Ce3.1** : Intégration continue (5 critères)
- **Ce3.2** : Tests automatisés (5 critères)
- **Ce3.5** : Opérations DevOps (6 critères)

Je veux un audit SANS modifier le code pour l'instant — diagnostic d'abord.

---

## AUDIT 1 — Architecture DDD et qualité du code ⚡ PRIORITÉ 1

> Critères RNCP : Ce2.4 #1 #2 #3

1. Liste tous les fichiers `.ts` dans `src/` (avec chemin relatif, organisés par dossier)
2. Pour chaque module/dossier, détermine sa catégorie DDD :
   - **DOMAIN** : entités, value objects, interfaces de repository, domain services
   - **APPLICATION** : use cases, command/query handlers, DTOs
   - **INFRASTRUCTURE** : repositories Prisma, adapters, config
   - **PRESENTATION** : controllers, routes, middlewares
   - **HORS DDD** : code qui ne rentre pas dans ces couches (utilitaires, scripts...)
3. Produis un tableau markdown :

| Fichier | Couche DDD | Rôle | Remarque |
| ------- | ---------- | ---- | -------- |
| ...     | ...        | ...  | ...      |

4. Y a-t-il des violations de la règle de dépendance DDD (couche infra qui importe du domaine, présentation qui importe de l'infra directement...) ?
5. Les Value Objects (`Quantity`) sont-ils immutables ? Les entités ont-elles des invariants protégés ?

Score global : ✅ Conforme / ⚠️ Partiel / ❌ Non conforme

---

## AUDIT 2 — Sécurité et conformité OWASP/RGPD

> Critères RNCP : Ce2.4 #4 #6

1. **Authentification** :
   - Où est défini le middleware d'authentification ? Couvre-t-il bien TOUTES les routes v1 et v2 ?
   - Les tokens JWT sont-ils validés (signature, expiration, issuer) ?
   - Y a-t-il un cas de route non protégée (health check, docs) ? Est-ce documenté et justifié ?

2. **Scan OWASP Top 10** — vérifie dans `src/` :
   - **A01 Broken Access Control** : y a-t-il une vérification que l'utilisateur accède uniquement à ses propres stocks ?
   - **A02 Cryptographic Failures** : des secrets ou données sensibles dans le code ou les logs ?
   - **A03 Injection** : les requêtes Prisma utilisent-elles les paramètres préparés (pas de raw SQL avec interpolation) ?
   - **A05 Security Misconfiguration** : CORS configuré strictement ? Headers de sécurité (Helmet) ?
   - **A09 Logging** : les logs exposent-ils des données sensibles (emails, tokens) ?

3. **RGPD** :
   - Y a-t-il un fichier documentant les données personnelles collectées (email, ID) ?
   - Y a-t-il une politique de rétention des données définie quelque part ?
   - Y a-t-il une route ou procédure pour la suppression de compte (droit à l'effacement) ?

4. **Secrets** :
   - Grep dans tout `src/` pour patterns dangereux : clés hardcodées, tokens, mots de passe
   - Le `.env.example` est-il présent et à jour ?

Score global : ✅ / ⚠️ / ❌ pour chaque point + actions classées 🔴🟡🟢

---

## AUDIT 3 — Base de données et intégrité des données

> Critères RNCP : Ce2.4 #4 #5 #7

1. **Schéma Prisma** (`prisma/schema.prisma`) :
   - Liste toutes les entités, leurs champs, types et contraintes
   - Y a-t-il des clés étrangères avec `onDelete` défini (CASCADE, RESTRICT) ?
   - Y a-t-il des contraintes d'unicité (`@@unique`) ?
   - Y a-t-il des index sur les champs fréquemment utilisés en filtre/join ?

2. **Migrations** :
   - Combien de migrations sont présentes dans `prisma/migrations/` ?
   - Sont-elles nommées de manière lisible ?
   - Y a-t-il des migrations destructives sans sauvegarde documentée ?

3. **Requêtes N+1** :
   - Grep dans `src/` pour les appels Prisma : y a-t-il des `findMany` sans `include` dans des boucles ?
   - Les relations sont-elles chargées avec `include` ou `select` plutôt que des appels séquentiels ?

4. **Éco-conception** :
   - Y a-t-il du caching (Redis, in-memory) pour les requêtes fréquentes ?
   - Les réponses API sont-elles paginées sur les listes ?

Score global : ✅ / ⚠️ / ❌ + actions classées 🔴🟡🟢

---

## AUDIT 4 — Pipeline CI et qualité du code

> Critères RNCP : Ce3.1 #7 #8 #9 #10 #11

1. **Fichiers workflows** :
   - Liste tous les fichiers dans `.github/workflows/`
   - Pour chaque workflow : déclencheurs, jobs, étapes, durée estimée

2. **Pipeline principal** :
   - Y a-t-il un job de lint (ESLint) ?
   - Y a-t-il un job de type-check TypeScript ?
   - Y a-t-il un job de build ?
   - Les tests sont-ils lancés avec `jest.ci.config.js` (config dédiée CI) ?
   - Y a-t-il un upload de rapport de coverage (Codecov ou équivalent) ?

3. **Sécurité pipeline** :
   - TruffleHog est-il configuré (`--only-verified`) ?
   - `npm audit` est-il lancé automatiquement ?
   - Les secrets sont-ils tous référencés via `${{ secrets.NOM }}` (jamais en dur) ?

4. **Conventional commits** :
   - Lance `git log --oneline -20` — les commits respectent-ils le format conventionnel ?
   - `commitlint.config.js` est-il configuré pour bloquer les commits non conformes ?
   - Le CHANGELOG est-il généré automatiquement (release-please) ?

5. **ADR-010** : vérifie le fichier `docs/adr/ADR-010-ci-cd-pipeline-optimization.md`
   - Quelle optimisation a été faite ? Durée avant/après ?

Score global : ✅ / ⚠️ / ❌ + actions classées 🔴🟡🟢

---

## AUDIT 5 — Stratégie de tests

> Critères RNCP : Ce3.2 #12 #13 #14 #15 #16

1. **Structure des tests** :
   - Liste tous les fichiers dans `tests/` et `src/**/*.test.ts` avec leur type (unit/integration/e2e)
   - Y a-t-il une séparation claire unit / integration / e2e ?
   - Les 3 configs Jest sont-elles présentes : `jest.config.js`, `jest.integration.config.js`, `jest.ci.config.js` ?

2. **Coverage** :
   - Lance `npm run test:unit -- --coverage` (ou équivalent dans jest.config.js)
   - Quel est le taux global ? Par fichier ?
   - Y a-t-il un seuil minimum configuré dans jest.config.js (`coverageThreshold`) ?
   - Le coverage est-il uploadé quelque part (Codecov, lcov) ?

3. **Qualité des tests unitaires DDD** :
   - Les tests `Quantity` couvrent-ils : valeur positive, valeur zéro, valeur négative, `equals()`, `add()` ?
   - Les tests `StockItem` couvrent-ils : `isOutOfStock()`, `isLowStock()`, edge cases (qty = minimumStock) ?
   - Les tests `Stock` couvrent-ils : `getTotalItems()`, `getTotalQuantity()`, stock vide ?
   - `StockVisualizationService` : cas nominal, liste vide, stock inexistant (404) ?

4. **Tests E2E Playwright** :
   - Vérifie `playwright.config.ts` : quelle URL de base ? Quel browser ?
   - Les 7 scénarios documentés dans `docs/E2E_TESTS_GUIDE.md` sont-ils tous implémentés ?
   - Les tests E2E utilisent-ils l'authentification Azure B2C réelle (ROPC flow) ?
   - Y a-t-il un nettoyage des données de test après chaque run ?

5. **TDD** :
   - Dans `docs/adr/ADR-004-tests-value-objects-entities.md` : quelle approche TDD est documentée ?
   - Y a-t-il des tests écrits avant le code (commits avec "test:" avant "feat:") dans le git log ?

Score global : ✅ / ⚠️ / ❌ + actions classées 🔴🟡🟢

---

## AUDIT 6 — Infrastructure et environnements DevOps

> Critères RNCP : Ce3.5 #17 #18 #19 #20 #21 #22

1. **Docker** :
   - Vérifie `Dockerfile` : image de base, multi-stage build ? Taille optimisée ?
   - Vérifie `compose.yaml` : quels services sont définis ? Variables d'environnement externalisées ?
   - Le `.dockerignore` est-il complet (node_modules, dist, .env exclus) ?

2. **Environnements distincts** :
   - **Dev local** : Docker + compose.yaml fonctionnel ? Scripts PS1 documentés ?
   - **CI/Test** : les jobs GitHub Actions tournent-ils dans des containers éphémères ?
   - **Staging** : Render.com configuré ? Aiven MySQL connecté ? URL de staging connue ?
   - **Production** : Azure App Service actif ? Variables d'environnement configurées Azure ?

3. **Monitoring et alertes** :
   - Application Insights est-il configuré (`applicationinsights` dans package.json) ?
   - Y a-t-il des warnings de dépréciation à résoudre (mentionnés dans README) ?
   - Y a-t-il des alertes configurées sur Azure (CPU, mémoire, taux d'erreur) ?

4. **Documentation opérationnelle** :
   - Y a-t-il un runbook de déploiement (procédure pas-à-pas) ?
   - Les variables d'environnement requises sont-elles toutes documentées (`.env.example`) ?
   - Y a-t-il une procédure de rollback documentée ?

5. **CD automatique** :
   - Le workflow de déploiement Azure App Service est-il dans `.github/workflows/` ?
   - Se déclenche-t-il sur push `main` ou manuellement ?
   - Y a-t-il des environment protection rules sur le déploiement prod ?

Score global : ✅ / ⚠️ / ❌ + actions classées 🔴🟡🟢

---

## AUDIT 7 — Documentation technique et ADRs

> Critères RNCP : Ce2.4 #1, Ce3.1 #7, RNCP Bloc 2 global

1. **ADRs** (`docs/adr/`) :
   - Liste tous les ADRs présents avec leur titre et date
   - Chaque ADR contient-il : Contexte, Décision, Alternatives considérées, Conséquences ?
   - Y a-t-il des décisions importantes non documentées (ex: choix Render vs Railway, Aiven vs PlanetScale) ?

2. **OpenAPI** (`docs/openapi.yaml`) :
   - Tous les endpoints v1 et v2 sont-ils documentés ?
   - Les schémas de requête/réponse sont-ils complets avec exemples ?
   - L'authentification Bearer est-elle documentée dans le spec ?
   - Le fichier est-il à jour avec le code actuel (pas de drift) ?

3. **README** :
   - Y a-t-il une section "Getting Started" complète (prérequis, installation, démarrage) ?
   - Les variables d'environnement requises sont-elles listées ?
   - Le taux de coverage des tests est-il affiché (badge ou section) ?
   - Y a-t-il des badges CI/CD et leur statut actuel ?

4. **CHANGELOG** :
   - Le CHANGELOG est-il généré automatiquement (release-please) ?
   - Les releases sont-elles taguées (v2.0.0, v2.1.0...) ?
   - Les breaking changes sont-ils identifiés ?

Score global : ✅ / ⚠️ / ❌ + actions classées 🔴🟡🟢

---

## FORMAT DE SORTIE ATTENDU

Pour chaque audit :

- Titre + critère RNCP associé
- Résultats concrets (chemins de fichiers, extraits de code, métriques chiffrées)
- Score global : ✅ Conforme / ⚠️ Partiel / ❌ Non conforme
- Actions recommandées classées :
  - 🔴 Bloquant (impact jury / note RNCP)
  - 🟡 Important (bonne pratique RNCP 7)
  - 🟢 Bonus (nice to have)

**⛔ NE PAS MODIFIER LE CODE** — diagnostic uniquement.
Commence par AUDIT 1, attends ma validation avant de passer aux suivants.

---

## CONTEXTE GRILLE D'ÉVALUATION (pour référence)

Les critères exacts de la grille officielle que tu dois couvrir :

**Ce2.4** : (1) back-end répond au CDC, (2) liaison front↔back par API, (3) langage back utilisé,
(4) sécurité serveur/BDD, (5) contraintes d'intégrité référentielles, (6) OWASP+RGPD,
(7) impact environnemental minimisé

**Ce3.1** : (7) dépôt partagé + branches + historique lisible, (8) pipeline CI déclenché auto,
(9) pipeline fiable et rapide, (10) sécurité dans le pipeline, (11) commits conventionnels + .gitignore propre

**Ce3.2** : (12) plan de tests unit+intégration documenté, (13) TDD parallèle au dev + intégré CI,
(14) tests tracent et localisent les bugs, (15) coverage mesuré et documenté avec seuil,
(16) cas nominaux ET edge cases couverts

**Ce3.5** : (17) Docker/docker-compose environnement unifié, (18) alertes anomalies/échecs pipeline,
(19) chaîne d'outils automatisée qualité, (20) collaboration facilitée (PRs, reviews, protection branches),
(21) stabilité staging/prod + cycles courts, (22) 3 environnements distincts (dev/test/prod)
