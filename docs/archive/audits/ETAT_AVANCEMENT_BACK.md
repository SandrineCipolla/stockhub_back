# État d'avancement — StockHub Backend

> Mis à jour le : 8 avril 2026 — Version : **2.10.0** — Branche : `main`

---

## Retours encadrant — Actions à mener

Issues directement liées aux retours de l'encadrant (Octobre 2025).

- [x] **`npm outdated` absent de la CI** → ajouté (#163)
- [x] **Couche autorisation manquante** → Phases 1 & 2 livrées — rôles OWNER/EDITOR/VIEWER/VIEWER_CONTRIBUTOR, gestion
      collaborateurs, middleware par stock
- [x] **ADRs sans argumentaire métier** → ADRs enrichis avec contexte et justification (#160, #161, #162)
- [ ] **Stratégie de versioning V2 sans V1** → à documenter dans un ADR ou README : justifier que c'est un refacto (pas
      un vrai versioning consommateur), ou supprimer le préfixe `/v2` si pas de V1 maintenue
- [ ] **Tests entités/value-objects** → questionner leur pertinence si le domaine évolue encore ; envisager de les
      supprimer ou de les réorienter vers des tests comportementaux
- [ ] **Argumentation des choix techniques** → pour chaque choix standard (REST, Repositories, Prisma, Express, GitHub
      Flow), documenter "pourquoi ici" et pas juste "c'est le standard" — critique pour la soutenance RNCP
- [ ] **Problème F5 / routage frontend** → côté Vercel/React Router, pas back — à signaler ou traiter côté front

---

## Backlog — P2 (priorité haute)

- [ ] **#44** — Couche d'autorisation complète : Phase 3 (notifications temps réel SSE/WebSockets) et Phase 4 (audit
      log, analytics)
- [ ] **#36** — Refactoring module `visualization` pour symétrie CQRS

---

## Backlog — Fonctionnalités IA

### Modèles & données

- [ ] **#152** — Modèle Prisma Recipe + RecipeIngredient (migration)
- [ ] **#153** — Modèle Prisma ShoppingList + ShoppingListItem (migration)
- [ ] **#156** — CRUD SavedProject — domain + infrastructure + api (DDD/CQRS)

### Enrichissement des items

- [ ] **#158** — Champ `note` libre sur les items de stock
- [ ] **#159** — Tags libres many-to-many avec bibliothèque utilisateur
- [ ] **#169** — Remplacer l'enum catégorie par un champ texte libre

### Features IA

- [ ] **#135** — Cron job recalcul quotidien des prédictions IA
- [ ] **#133** — Suivi péremption avancé (`openedAt`, `ProductType` générique)
- [ ] **#170** — Génération liste de courses IA avec sélection contextuelle des stocks

---

## Backlog — Études / Spikes

- [ ] **#147 / #136** — Évaluation et choix du modèle LLM via OpenRouter
- [ ] **#148** — Conception et test des prompts système par catégorie
- [ ] **#149** — Modélisation données Recipe / SavedProject / ShoppingList
- [ ] **#150** — Évaluation function calling vs JSON mode pour AIService
- [ ] **#151** — Spike Ollama + Mistral 7B local (faisabilité prod)
- [ ] **#126** — Spike scan code-barres pour ajout automatique d'articles

---

## Backlog — Infra / Qualité / Docs

- [ ] **#125** — Compte démo dédié pour le seed de démonstration (staging)
- [ ] **#131** — Audit et réconciliation des ADRs dans le wiki
- [ ] **#138** — Registre des traitements RGPD

---

## Fonctionnalités livrées (historique)

| Version     | Contenu                                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| **v2.10.0** | `updatedAt` exposé sur les stock items (#157) ; `GET /contributions/pending-count` (#155)                                   |
| **v2.9.0**  | Gestion collaborateurs ; workflow VIEWER_CONTRIBUTOR ; stocks collaboratifs dans `GET /stocks` ; fix accès collaborateurs   |
| **v2.8.1**  | Upgrade Prisma 6.19.3 ; `npm outdated` en CI ; scénarios E2E status lifecycle                                               |
| **v2.8.0**  | Service IA OpenRouter/Mistral, cache DB 24h ; ItemHistory + StockPredictionService ; seed 90j ; statut agrégé `GET /stocks` |
| **v2.7.x**  | Fix suggestions IA (label, prédictions pre-cache) ; ADR-013 LLM provider                                                    |
| **v2.6.0**  | PATCH UpdateItem command complet ; fix logger dev                                                                           |

---

## Check soutenance RNCP

Points à consolider avant la soutenance :

- [ ] Rédiger ou compléter un ADR sur la **stratégie de versioning API** (V2, absence de V1, cas d'usage)
- [ ] Pour chaque techno clé, avoir une réponse courte à "pourquoi ce choix dans ce contexte" :
  - [ ] REST vs GraphQL / gRPC
  - [ ] Repositories vs accès direct Prisma
  - [ ] Express vs Fastify / NestJS
  - [ ] GitHub Flow vs GitFlow
  - [ ] MySQL/Prisma vs autre ORM ou base
  - [ ] Azure AD B2C vs autre provider auth
- [ ] Savoir expliquer les limites de la stratégie de tests (entités vs routes vs BDD)
- [ ] Connaître les points non couverts (V1 rétro-compat, tests entités discutables, RGPD)

---

Priorité 1 — Argumentation des choix techniques

C'est le point qui a le plus pesé sur la note ("je n'ai pas pu constater ta décision en pleine conscience"). C'est du
travail de documentation, pas de code.

Concrètement : enrichir les ADRs existants (ou en créer de nouveaux) pour chaque techno clé avec le raisonnement "
pourquoi ici, dans ce contexte précis" — pas
"parce que c'est le standard".

Techos à couvrir : REST, Repositories, Express, GitHub Flow, MySQL/Prisma, Azure AD B2C.

---

Priorité 2 — Stratégie de versioning V2 sans V1

Critique explicite : "la V1 a disparu le jour même de la V2". Deux options :

- Option A : rédiger un ADR qui justifie que c'était un refacto (pas un vrai versioning consommateur) et que /v2
  documente la rupture
- Option B : retirer le préfixe /v2 si on assume que c'est la seule version

  ***

Priorité 3 — Tests entités/value-objects

Travail de code plus léger : passer en revue les tests sur les entités et value objects, décider si on les garde,
supprime ou réoriente vers des tests
comportementaux. L'encadrant est "partagé" dessus, donc l'important c'est d'avoir une position argumentée.

---

Ce qu'on ne touche pas côté back

- Le problème F5 → c'est frontend (Vercel/React Router, \_redirects ou vercel.json)
- Les issues IA et P2 → nouvelles features, pas des corrections de feedback
