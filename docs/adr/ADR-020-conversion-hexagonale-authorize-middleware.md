# ADR-020: Convertir le middleware d'autorisation vers un port/adapter hexagonal (alternative à ADR-019)

**Date:** 2026-09-09
**Statut:** Proposé
**Décideurs:** Sandrine Cipolla

---

## Contexte

[ADR-019](./ADR-019-authorize-middleware-couches-classiques.md) documente une exception assumée : `src/authorization/authorizeMiddleware.ts` et son `AuthorizationRepository` importent `PrismaClient` directement, sans port ni interface, contrairement au reste du domaine métier (stock-management, prediction, user, ai) qui suit une architecture hexagonale stricte (ports dans `domain/`, adaptateurs Prisma dans `infrastructure/`, injection depuis la composition root).

ADR-019 accepte cette exception pour l'instant, mais documente déjà la conversion comme faisable à faible effort. Cet ADR reprend cette piste et l'instruit formellement, comme le demande l'atelier : proposer une alternative à un choix existant, avec sa migration décomposée et ses conditions d'abandon.

Ce n'est pas un détail de conception : le middleware est utilisé par toutes les routes protégées (`authorizeStockRead`, `authorizeStockWrite`, `authorizeStockContribute`), donc une interface partagée au sens du cours "Comment faire des choix".

## Contraintes et critères

**Contraintes :**

- Aucune migration de base de données possible/nécessaire (le changement est uniquement structurel, pas de schéma Prisma modifié)
- Doit rester compatible avec le pattern déjà utilisé pour `ICollaboratorRepository`/`PrismaCollaboratorRepository` (cohérence architecturale)
- Ne doit pas bloquer la préparation de la soutenance RNCP (mars 2027) — effort à caler hors période critique

**Critères :**

- Cohérence architecturale (règle domain → infrastructure → api du projet)
- Testabilité (injection de dépendance vs `new PrismaClient()` en dur)
- Effort de migration vs bénéfice réel
- Risque de régression sur un chemin de code critique (autorisation = sécurité)

## Hypothèses et preuves

| Affirmation                                                                  | Type      | Vérification                                                                                                                                       |
| ---------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| La conversion est faisable en quelques heures                                | Hypothèse | estimée dans ADR-019 sur inspection du code, jamais chronométrée sur un essai réel                                                                 |
| Les trois middlewares créent chacun leur propre `new PrismaClient()`         | Preuve    | confirmé par lecture du code (`authorizeStockRead`, `authorizeStockWrite`, `authorizeStockContribute`), déjà noté comme effet de bord dans ADR-019 |
| Le pattern `ICollaboratorRepository` est un précédent direct et transposable | Preuve    | code existant dans `domain/authorization/` et `infrastructure/` à réutiliser comme référence                                                       |

## Décision (proposée)

Définir un port `IAuthorizationRepository` dans `domain/authorization/`, déplacer l'implémentation Prisma actuelle vers `infrastructure/authorization/PrismaAuthorizationRepository`, et injecter l'instance via la composition root des routes — supprimant au passage les trois instanciations `new PrismaClient()` dupliquées.

**Cette proposition n'est pas encore acceptée.** Elle documente la migration pour permettre une décision éclairée, conformément à l'étape 6 de l'atelier.

## Raisons

- Élimine la seule exception hexagonale du projet — cohérence totale de l'architecture domain → infrastructure → api
- Corrige un effet de bord déjà identifié (trois `PrismaClient` non partagés, faute de composition root)
- Réutilise un pattern déjà éprouvé dans le projet (`ICollaboratorRepository`), donc risque de conception faible

## Décomposition de la migration

| Étape                  | Contenu                                                                                                                                                                         | Effort estimé                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Conversion des données | Aucune — pas de changement de schéma                                                                                                                                            | 0                                   |
| Adaptation du code     | Créer `IAuthorizationRepository` (domain), déplacer `AuthorizationRepository` → `infrastructure/authorization/`, ajouter l'injection dans la composition root des 3 middlewares | ~2-3h (hypothèse, non chronométrée) |
| Tests                  | Adapter les tests existants du middleware pour injecter un mock du port au lieu de mocker `PrismaClient` directement                                                            | ~1h                                 |
| Déploiement            | Aucun impact infra — changement de code uniquement                                                                                                                              | 0                                   |
| Retour arrière         | Trivial — revert du commit, aucune donnée concernée                                                                                                                             | quasi nul                           |

## Alternatives considérées

### Alternative 1: Statu quo (ADR-019 actuel)

- **Avantages :** aucun effort, aucun risque de régression sur un chemin de sécurité
- **Inconvénients :** incohérence architecturale persistante, trois `PrismaClient` non partagés
- **Pourquoi non retenue comme seule option :** le coût de la conversion semble faible au vu de l'estimation, ce qui justifie de la documenter formellement plutôt que de la laisser en dette non instruite

### Alternative 2: Conversion partielle (partager un seul `PrismaClient` sans créer de port)

- **Avantages :** corrige l'effet de bord (instanciations multiples) sans le chantier complet du port hexagonal
- **Inconvénients :** ne résout pas l'incohérence architecturale de fond, deux correctifs à faire plus tard si la conversion complète arrive quand même
- **Pourquoi rejetée pour cette proposition :** corrige le symptôme, pas la cause ; autant faire la conversion complète vu l'effort comparable

## Conséquences

### Positives

- Architecture 100% hexagonale sur l'ensemble du domaine métier
- Testabilité améliorée (mock du port plutôt que mock de `PrismaClient`)
- Suppression du bug latent des `PrismaClient` non partagés

### Négatives

- Effort de développement et de relecture sur un chemin de code sensible (autorisation) — toute régression ici a un impact sécurité direct
- Complexité légèrement accrue pour un middleware qui reste un cross-cutting concern Express générique (argument déjà soulevé dans ADR-019 pour justifier l'exception)

## Conditions d'abandon ou de réexamen de cette proposition

- Abandonner si un essai chronométré dépasse largement l'estimation de 2-3h (signe que la frontière domain/infrastructure est en réalité moins nette qu'anticipé pour ce middleware)
- Abandonner si la conversion introduit une régression détectée en tests d'intégration sur l'autorisation (le risque sécurité prime sur la cohérence architecturale)
- Réexaminer après la soutenance RNCP (mars 2027) si non traitée avant, pour ne pas risquer une régression en période critique

## Liens

- ADR lié : [ADR-019 (Middleware d'autorisation en couches classiques)](./ADR-019-authorize-middleware-couches-classiques.md) — cet ADR propose de le supplanter si accepté
- Pattern de référence : `domain/authorization/ICollaboratorRepository`, `infrastructure/.../PrismaCollaboratorRepository`
- Code concerné : `src/authorization/authorizeMiddleware.ts`, `src/authorization/repositories/AuthorizationRepository.ts`

---

**Note:** Statut "Proposé" — si accepté, mettre à jour ADR-019 en `Supplanté par ADR-020` et ce document en `Accepté`. Si rejeté, marquer `Rejeté` avec la raison.
