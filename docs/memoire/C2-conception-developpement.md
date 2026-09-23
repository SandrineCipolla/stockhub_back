# Bloc 2 : Concevoir et développer des solutions logicielles

Voir `INDEX.md` de ce dossier pour le principe de ce fichier.

## C2.1 Élaborer l'architecture

**Cas** : migration du backend vers une architecture DDD/CQRS, décidée face à un domaine métier volontairement restreint (gestion de stock familiale).

**Source** : [ADR-001](../adr/ADR-001-migration-ddd-cqrs.md).

**Angle pour le mémoire** : l'ADR justifie le choix malgré un domaine simple (l'encadrant RNCP l'avait relevé), avec 3 arguments distincts : les invariants métier existent même sur un périmètre restreint (label non vide, quantité non négative, unicité par stock), la complexité augmente avec les features suivantes (autorisation, IA), et 2 alternatives explicitement écartées (Transaction Script, Active Record) avec leurs inconvénients détaillés. Les métriques de succès (53 tests domaine, temps d'ajout d'une règle métier réduit de 2h à 10min) donnent des chiffres concrets à citer.

**Point de vigilance si cité tel quel** : l'ADR décrit une structure de dossiers (`domain/entities/`, `application/commands/`, `application/queries/`) différente de la structure réelle actuelle (`domain/stock-management/manipulation/`, `domain/stock-management/visualization/`). L'architecture a évolué depuis la rédaction de l'ADR (novembre 2024) sans qu'un nouvel ADR documente ce changement de structure. Décrire la structure réelle (voir `CLAUDE.md` ou le code) plutôt que celle de l'ADR si le jury demande le détail des dossiers.

## C2.1 Élaborer l'architecture (traitement d'une exception à la règle)

**Cas** : une exception à l'architecture hexagonale du projet (le middleware d'autorisation HTTP accède à Prisma directement, sans port), documentée et assumée plutôt que corrigée silencieusement ou laissée non expliquée, avec une alternative de conversion chiffrée et évaluée.

**Source** : [ADR-019](../adr/ADR-019-authorize-middleware-couches-classiques.md) (exception acceptée) et [ADR-020](../adr/ADR-020-conversion-hexagonale-authorize-middleware.md) (conversion proposée, statut `Proposé`).

**Angle pour le mémoire** : montre une démarche d'audit architectural (vérification par recherche exhaustive qu'aucun fichier du domaine n'importe Prisma, sauf ce module), la décision de documenter une entorse plutôt que de la cacher, et une migration chiffrée avec conditions d'abandon explicites (ADR-020 : abandon si un essai chronométré dépasse largement l'estimation, ou si une régression apparaît sur un chemin de code sécurité). Bon exemple du critère RNCP « comparer au moins deux options sur les mêmes critères », appliqué ici à une décision d'architecture complète, un niveau au-dessus d'un simple choix de bibliothèque.

**Point de vigilance si cité tel quel** : ADR-020 est encore au statut `Proposé`, non implémenté. Vérifier son statut avant de le présenter comme acquis.

## C2.4 Piloter le back-end (OWASP, autorisation)

**Cas** : système d'autorisation basé sur les ressources (rôles OWNER/EDITOR/VIEWER/VIEWER_CONTRIBUTOR par stock), répondant à un axe d'amélioration relevé explicitement par l'encadrant RNCP (authentification présente, autorisation manquante).

**Source** : [ADR-009](../adr/ADR-009-resource-based-authorization.md).

**Angle pour le mémoire** : couvre directement OWASP A01 (Broken Access Control). L'ADR compare 3 alternatives (RBAC simple, ABAC pur, permissions granulaires façon GitHub) sur des critères explicites (flexibilité, simplicité UX, sécurité) et les rejette chacune avec une raison précise. Cas d'usage familial concret (3 scénarios détaillés) qui justifie le modèle hybride retenu plutôt qu'un standard générique.

**Point de vigilance si cité tel quel** : seules les phases 1 et 2 du plan d'implémentation sont complétées (rôles de base, workflow de contributions). Les phases 3 et 4 (notifications temps réel, audit log) sont encore à l'état de plan, non réalisées. Ne pas présenter les 4 phases comme livrées.

## C2.4 Piloter le back-end (RGPD)

**Cas** : politique RGPD documentée avec base légale par donnée collectée, durée de rétention justifiée par donnée, et procédure concrète pour chacun des 4 droits applicables (accès, rectification, effacement, portabilité).

**Source** : [docs/technical/rgpd.md](../technical/rgpd.md).

**Angle pour le mémoire** : peu de données collectées au départ (email et identifiant Azure B2C uniquement, énuméré explicitement ce qui n'est pas collecté), ce qui simplifie la conformité mais reste présenté avec la même rigueur qu'un système plus complexe (tableau sous-traitants avec DPA, base légale par donnée). Le droit à la portabilité (Art. 20) est noté non implémenté plutôt que passé sous silence, ce qui est un point honnête à citer.

**Point de vigilance si cité tel quel** : le fichier liste lui-même 2 points d'amélioration non résolus (`loggingNoPII` pas encore activé dans `authConfig.ts`, export des données non implémenté). Daté mars 2026, à vérifier avant citation si des changements sur l'authentification ou le logging sont survenus depuis.
