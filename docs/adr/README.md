# Architecture Decision Records (ADRs)

## Qu'est-ce qu'un ADR ?

Un **Architecture Decision Record (ADR)** est un document qui capture une décision architecturale importante, incluant le **contexte**, les **alternatives considérées**, et les **conséquences** de cette décision.

### Pourquoi utiliser des ADRs ?

Les ADRs permettent de :
- 📝 **Documenter le "pourquoi"** derrière chaque choix technique
- 🔍 **Comprendre le raisonnement** des décisions passées (pour l'équipe actuelle et future)
- ⚖️ **Évaluer les trade-offs** de manière transparente
- 🎓 **Faciliter l'onboarding** des nouveaux développeurs
- 📊 **Justifier les choix** lors d'audits ou d'évaluations (ex: RNCP)

### Quand créer un ADR ?

Créez un ADR pour toute décision architecturale qui :
- Impacte la structure du code ou la stack technique
- A des alternatives viables
- A des conséquences à long terme
- Nécessite d'être justifiée auprès de l'équipe ou des parties prenantes

## Liste des ADRs

### ADRs acceptés

| # | Titre | Date | Statut |
|---|-------|------|--------|
| [ADR-001](./ADR-001-migration-ddd-cqrs.md) | Migration vers DDD/CQRS | 2024-11 | ✅ Accepté |
| [ADR-002](./ADR-002-choix-prisma-orm.md) | Choix de Prisma vs TypeORM | 2025-12 | ✅ Accepté |
| [ADR-003](./ADR-003-azure-ad-b2c-authentication.md) | Azure AD B2C pour authentification | 2025-12 | ✅ Accepté |
| [ADR-004](./ADR-004-tests-value-objects-entities.md) | Tests sur Value Objects et Entities | 2025-12 | ✅ Accepté |
| [ADR-005](./ADR-005-api-versioning-v2.md) | Versioning API (V2 sans V1) | 2025-12 | ✅ Accepté |
| [ADR-006](./ADR-006-mysql-azure-cloud.md) | MySQL Azure vs autres clouds | 2025-12 | ✅ Accepté |

### ADRs dépréciés

_Aucun pour le moment_

## Structure d'un ADR

Chaque ADR suit le template suivant (voir [TEMPLATE.md](./TEMPLATE.md)) :

1. **Contexte** : Quelle est la situation ? Quel problème doit-on résoudre ?
2. **Décision** : Quelle solution a été choisie ?
3. **Raisons** : Pourquoi cette solution est-elle la meilleure ?
4. **Alternatives considérées** : Quelles autres options ont été évaluées ?
5. **Conséquences** : Quels sont les impacts (positifs et négatifs) de cette décision ?
6. **Validation** : Comment vérifier que la décision est correcte ?
7. **Liens** : Références vers issues, code, documentation

## Comment créer un nouvel ADR

### Étape 1 : Copier le template

```bash
cp docs/adr/TEMPLATE.md docs/adr/ADR-XXX-titre-decision.md
```

### Étape 2 : Remplir le contenu

- Remplacer `XXX` par le prochain numéro séquentiel
- Utiliser un titre court et descriptif (ex: `choix-prisma-orm`)
- Remplir chaque section avec des informations factuelles

### Étape 3 : Reviewer

- Faire relire par l'équipe
- Valider avec l'encadrant si nécessaire
- Incorporer les feedbacks

### Étape 4 : Ajouter à la liste

- Mettre à jour ce README avec le nouvel ADR
- Créer un commit dédié (ex: `docs: add ADR-007 choix outil CI/CD`)

## Principes importants

### Les ADRs sont immuables

Une fois qu'un ADR est accepté, **il ne doit pas être modifié**. Si la décision change, créez un nouvel ADR qui supplante l'ancien.

**Exemple :**
```
ADR-002: Choix de Prisma (Accepté)
ADR-015: Migration vers Drizzle ORM (Accepté, supplante ADR-002)
```

### Utilisez un ton neutre et factuel

Les ADRs documentent des **décisions rationnelles**, pas des opinions personnelles.

❌ **Mauvais :** "Je pense que Prisma est meilleur car j'aime sa syntaxe"
✅ **Bon :** "Prisma a été choisi pour sa génération automatique de types TypeScript, réduisant les erreurs de type de 40% (mesure interne)"

### Documentez les trade-offs

Chaque décision a des avantages ET des inconvénients. Soyez transparent.

**Exemple :**
- ✅ **Avantage :** Type-safety excellente
- ⚠️ **Inconvénient :** Vendor lock-in (dépendance forte à Prisma)

## Ressources

- [ADR GitHub Organization](https://adr.github.io/) - Standard ADR
- [Michael Nygard - Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [Joel Parker Henderson - ADR Examples](https://github.com/joelparkerhenderson/architecture-decision-record)

---

**Maintenu par :** Sandrine Cipolla
**Dernière mise à jour :** Décembre 2025
