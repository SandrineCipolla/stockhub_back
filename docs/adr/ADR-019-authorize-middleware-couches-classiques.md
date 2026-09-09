# ADR-019: Middleware d'autorisation HTTP en couches classiques (exception à l'architecture hexagonale)

**Date:** 2026-08-31
**Statut:** Accepté
**Décideurs:** Sandrine Cipolla

---

## Contexte

Une analyse de l'architecture backend (routes → controllers → domain → infrastructure) a confirmé que la majorité des modules métier suivent une véritable architecture hexagonale (ports & adapters) avec inversion de dépendance :

- Les interfaces (ports) sont définies côté `domain/` : `IStockCommandRepository`, `IStockVisualizationRepository`, `IItemHistoryRepository`, `IPredictionRepository`, `IReadUserRepository`/`IWriteUserRepository`, `ICollaboratorRepository`, `IAIService`
- Les adaptateurs Prisma/HTTP vivent exclusivement dans `infrastructure/` : `PrismaStockCommandRepository`, `PrismaStockVisualizationRepository`, `PrismaCollaboratorRepository`, `OpenRouterAIService`, etc.
- La composition (injection des adaptateurs dans les use cases) se fait dans les fichiers de routes (`src/api/routes/StockRoutesV2.ts`), qui jouent le rôle de composition root
- Aucun fichier sous `src/domain/` n'importe `@prisma/client`, `axios` ou `fetch` directement (vérifié par recherche exhaustive)

**Exception identifiée** : `src/authorization/authorizeMiddleware.ts` et `src/authorization/repositories/AuthorizationRepository.ts` ne suivent pas ce pattern.

- `AuthorizationRepository` importe et utilise `PrismaClient` directement (`src/authorization/repositories/AuthorizationRepository.ts:1,20`), sans interface intermédiaire définie côté métier
- `authorizeMiddleware.ts` ne vit ni dans `domain/` ni dans `infrastructure/`, mais dans `src/authorization/` — un troisième emplacement hors de la séparation hexagonale du reste du projet
- Les middlewares exportés (`authorizeStockRead`, `authorizeStockWrite`, `authorizeStockContribute`) sont instanciés **au chargement du module** via `authorizeStockAccess(PERMISSIONS.READ)` sans `prismaClient` injecté, créant chacun leur propre `new PrismaClient()` — contrairement aux handlers CQRS qui reçoivent leurs dépendances construites explicitement dans la composition root de `StockRoutesV2.ts`

Un module `ICollaboratorRepository`/`PrismaCollaboratorRepository` existe déjà dans `domain/authorization/collaboration/` et `infrastructure/authorization/repositories/` pour la gestion des collaborateurs — mais il ne couvre pas les besoins du middleware (`findUserByEmail`, `findStockById`, `findCollaboratorByUserAndStock`), qui reste donc sur son propre repository non abstrait.

## Décision

**Nous acceptons cette exception comme un compromis pragmatique** : le contrôle d'accès HTTP (middleware Express, cross-cutting concern) reste en architecture par couches classique (middleware → repository → Prisma direct), plutôt que d'être converti en port/adapter hexagonal comme le reste du domaine métier.

## Raisons

1. **Nature du composant** : `authorizeMiddleware` est un middleware Express générique (cross-cutting concern d'infrastructure HTTP), pas un cas d'usage métier au sens CQRS — la frontière domain/infrastructure y est intrinsèquement moins nette que pour un command/query handler
2. **Risque limité** : les requêtes exécutées (`findUnique` simples) sont déjà isolées dans une classe dédiée (`AuthorizationRepository`), testable par injection du `PrismaClient` en paramètre — la duplication de logique SQL est évitée même sans interface formelle
3. **Contrainte de temps RNCP** : l'effort de conversion (voir section Alternatives) n'apporte pas de valeur de démonstration supplémentaire par rapport aux autres priorités du planning avant soutenance (mars 2027)
4. **Historique** : ce repository a été introduit pour résoudre l'issue #71 (tests d'intégration), sans que la cohérence architecturale globale avec le reste du domaine ait été un objectif à ce moment-là

## Alternative considérée : conversion hexagonale complète

**Faisabilité : confirmée, effort faible (quelques heures), aucun changement de schéma DB requis.** Le chemin de conversion, cohérent avec le pattern déjà utilisé pour `ICollaboratorRepository`/`PrismaCollaboratorRepository`, serait :

1. Définir un port `IAuthorizationRepository` dans `src/domain/authorization/common/repositories/` (ou fusionner ses méthodes dans `ICollaboratorRepository` si le périmètre se recoupe), avec `findUserByEmail`, `findStockById`, `findCollaboratorByUserAndStock`
2. Déplacer `AuthorizationRepository` vers `src/infrastructure/authorization/repositories/PrismaAuthorizationRepository.ts`, implémentant ce port
3. Faire dépendre `authorizeStockAccess` du port (interface) plutôt que de `PrismaClient`/de la classe concrète
4. Construire l'instance dans la composition root (`StockRoutesV2.ts`), comme les autres handlers, au lieu de l'auto-instanciation au chargement du module — corrige au passage la création de trois `PrismaClient` distincts au démarrage

- **Avantages** : cohérence totale avec le reste de l'architecture, testabilité accrue (mock du port au lieu d'un `PrismaClient` de test), un seul `PrismaClient` partagé au lieu de trois
- **Inconvénients** : effort de refactoring (déplacement de fichiers, mise à jour des imports dans les 18+ routes utilisant `authorizeStockRead`/`Write`/`Contribute`), risque de régression sur un composant sécurité critique sans gain fonctionnel immédiat
- **Pourquoi non retenue pour l'instant** : le rapport effort/valeur ne justifie pas de le prioriser maintenant ; conservée comme piste d'amélioration technique documentée plutôt qu'exécutée immédiatement

## Conséquences

### Positives

- Le compromis est explicite et documenté, plutôt qu'une incohérence non justifiée découverte lors d'un audit
- Le composant reste correctement isolé et testable (via injection du `PrismaClient`), même sans interface formelle
- Aucune urgence à corriger : le risque (bypass d'autorisation) est mitigé par les tests E2E existants (cf. ADR-009)

### Négatives

- Incohérence architecturale visible : un lecteur du code trouve un pattern différent entre `src/domain`/`src/infrastructure` et `src/authorization`
- Trois instances `PrismaClient` créées indépendamment (`authorizeStockRead`, `authorizeStockWrite`, `authorizeStockContribute`) au lieu d'une seule partagée via la composition root
- Testabilité en isolation légèrement inférieure à celle obtenue avec un vrai port (mock d'interface) plutôt qu'un `PrismaClient` de test

### Risques

- Si le module `src/authorization/` grossit (nouvelles règles d'autorisation, nouvelles ressources au-delà des stocks), l'absence de port rendra la dette plus coûteuse à rattraper — réévaluer la conversion hexagonale si ce périmètre s'étend

## Validation

- Revue de code : toute nouvelle logique d'autorisation HTTP doit rester dans `src/authorization/`, sans mélanger repository Prisma direct et repository via interface dans le même module
- Si la conversion hexagonale décrite ci-dessus est réalisée plus tard, créer un nouvel ADR qui supplante celui-ci (statut `Supplanté par ADR-XXX`)

## Liens

- Architecture de référence : [ADR-001](./ADR-001-migration-ddd-cqrs.md) (Migration DDD/CQRS)
- Module concerné : [ADR-009](./ADR-009-resource-based-authorization.md) (Système d'autorisation basé sur les ressources)
- Code concerné :
  - `src/authorization/authorizeMiddleware.ts`
  - `src/authorization/repositories/AuthorizationRepository.ts`
  - `src/domain/authorization/collaboration/repositories/ICollaboratorRepository.ts` (pattern hexagonal de référence à suivre en cas de conversion)
  - `src/infrastructure/authorization/repositories/PrismaCollaboratorRepository.ts` (pattern hexagonal de référence à suivre en cas de conversion)

---

**Note:** Les ADRs sont immuables. Si cette décision change, créer une nouvelle ADR qui supplante celle-ci.
