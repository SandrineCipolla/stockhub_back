# ADR-009: Système d'autorisation hybride basé sur les ressources

**Date:** 2025-12-27
**Statut:** Accepté
**Décideurs:** Sandrine Cipolla

---

## Contexte

### Situation actuelle

L'application StockHub dispose actuellement d'une **authentification** fonctionnelle via Azure AD B2C avec tokens JWT. Cependant, comme souligné par l'encadrant RNCP:

> "Authentification via Azure AD B2C avec JWT. [...] Il manque cependant une couche d'autorisation"

**Problème identifié:**

- ✅ Authentification fonctionnelle (qui est l'utilisateur)
- ❌ Pas d'autorisation (qui peut faire quoi sur quelles ressources)
- ❌ Un utilisateur peut actuellement accéder aux stocks d'autres utilisateurs

### Cas d'usage réels (contexte familial)

**Scénario 1: Stock "Cellier" (propriétaire: Maman)**

- Maman crée et initialise le stock
- Papa fait des courses → doit pouvoir mettre à jour les quantités
- Les enfants consultent → lecture seule pour savoir ce qui est disponible

**Scénario 2: Stock "Peinture Warhammer" (propriétaire: Papa)**

- Papa gère son stock de peintures
- Fils utilise un pot → doit pouvoir signaler qu'il est vide
- Maman consulte → lecture seule pour voir l'état

**Scénario 3: Stock partagé "Courses hebdomadaires"**

- Plusieurs membres de la famille peuvent modifier
- Historique des modifications pour traçabilité

### Contraintes

- **Temporelles:** 1 an avant soutenance RNCP (mars 2027)
- **Techniques:** Architecture DDD/CQRS existante, API RESTful
- **RNCP:** Démontrer maîtrise d'une architecture complexe mais justifiée
- **UX:** Application familiale → simplicité d'utilisation

## Décision

**Nous adoptons un système d'autorisation hybride basé sur les ressources** combinant:

1. **Groupes familiaux** (simplification UX)
2. **Rôles par stock** avec permissions granulaires
3. **Workflow de suggestions** pour collaboration sécurisée
4. **Notifications temps réel** pour coordination

## Raisons

### Critères de décision

1. **Flexibilité:** Gérer différents niveaux de collaboration par stock
2. **Simplicité UX:** Partage facile au sein d'une famille
3. **Sécurité:** Isolation stricte des données entre utilisateurs/familles
4. **Évolutivité:** Architecture permettant ajouts progressifs de fonctionnalités
5. **Valeur RNCP:** Démontre maîtrise architecture complexe avec justification métier

### Pourquoi cette solution

- ✅ **Contexte familial réaliste:** Correspond exactement au cas d'usage
- ✅ **Architecture démontrable:** Event-driven, notifications, workflow
- ✅ **Implémentation progressive:** 4 phases étalées sur plusieurs mois
- ✅ **Complexité maîtrisée:** Chaque phase apporte de la valeur métier
- ✅ **Histoire pour le jury:** Cas d'usage concret, évolution logique

## Alternatives considérées

### Alternative 1: RBAC (Role-Based Access Control) simple

**Principe:** Permissions basées sur le rôle global de l'utilisateur

```typescript
User {
  role: 'ADMIN' | 'USER' | 'READER'
}
```

- **Avantages:**
  - Simple à implémenter
  - Rapide (2-3 jours)
  - Standard bien connu

- **Inconvénients:**
  - Rigide: impossible de partager différemment par stock
  - Ne répond pas au besoin de "Papa peut modifier le Cellier de Maman"
  - Pas de granularité

- **Pourquoi rejetée:** Ne permet pas le partage sélectif de stocks entre membres de la famille

### Alternative 2: ABAC (Attribute-Based Access Control) pur

**Principe:** Règles dynamiques basées sur attributs

```typescript
IF user.familyId == stock.familyId AND user.age >= 18 THEN allow edit
```

- **Avantages:**
  - Très flexible
  - Règles complexes possibles

- **Inconvénients:**
  - Complexité élevée
  - Difficile à debugger
  - Surcharge cognitive pour configuration

- **Pourquoi rejetée:** Trop complexe pour le besoin, over-engineering

### Alternative 3: Permissions granulaires uniquement (GitHub-style)

**Principe:** Chaque utilisateur a des permissions spécifiques par stock

```typescript
Stock {
  collaborators: [
    { userId: 2, permissions: ['read', 'update_quantity', 'add_item'] }
  ]
}
```

- **Avantages:**
  - Très granulaire
  - Contrôle fin

- **Inconvénients:**
  - UX complexe (gérer permission par permission)
  - Pas adapté au contexte familial (trop de configuration)

- **Pourquoi rejetée:** Pas de concept de "famille" = configuration répétitive stock par stock

## Architecture du système choisi

### Modèle de données

```typescript
// 1. Groupes familiaux
Family {
  id: number,
  name: string,
  members: [
    { userId: number, familyRole: 'ADMIN' | 'MEMBER' }
  ]
}

// 2. Stock avec autorisation
Stock {
  id: number,
  name: string,
  ownerId: number,           // Créateur du stock
  familyId: number,          // Visible par tous les membres
  collaborators: [
    {
      userId: number,
      role: 'OWNER' | 'EDITOR' | 'VIEWER' | 'VIEWER_CONTRIBUTOR'
    }
  ]
}

// 3. Suggestions (workflow)
StockSuggestion {
  id: number,
  stockId: number,
  suggestedBy: number,
  type: 'UPDATE_QUANTITY' | 'ADD_ITEM' | 'DELETE_ITEM',
  changes: json,
  reason: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  createdAt: timestamp
}

// 4. Notifications
Notification {
  id: number,
  userId: number,
  type: string,
  message: string,
  relatedResourceType: string,
  relatedResourceId: number,
  read: boolean
}
```

### Rôles par stock

| Rôle                   | Permissions                                                     |
| ---------------------- | --------------------------------------------------------------- |
| **OWNER**              | Tous les droits + gestion partage + suppression stock           |
| **EDITOR**             | Lecture + modification quantités + ajout/suppression items      |
| **VIEWER**             | Lecture seule                                                   |
| **VIEWER_CONTRIBUTOR** | Lecture + création de suggestions (nécessite approbation OWNER) |

### Flux de permissions

```
Requête → Authentification (JWT) → Autorisation (check ownership/role) → Action
                                           ↓
                                    403 Forbidden si refusé
```

## Plan d'implémentation (4 phases)

### Phase 1: Fondations - Groupes + Rôles basiques (3-4 semaines)

**Objectif:** Système d'autorisation minimal fonctionnel

**Livrables:**

- [ ] Migration Prisma: tables `Family`, `FamilyMember`, `StockCollaborator`
- [ ] Middleware `authorize(resource, action, ownership)`
- [ ] Rôles: OWNER, EDITOR, VIEWER uniquement
- [ ] Application aux routes v2
- [ ] Tests unitaires + E2E (user A ne peut pas accéder stocks de user B)
- [ ] ADR-009 (ce document)

**Critères de succès:**

- Un stock n'est accessible que par owner + collaborateurs
- Tests E2E passent pour isolation

### Phase 2: Workflow de suggestions (4-6 semaines)

**Objectif:** Permettre contribution sécurisée

**Livrables:**

- [ ] Rôle VIEWER_CONTRIBUTOR
- [ ] Entity `StockSuggestion` (DDD)
- [ ] Routes `/api/v2/stocks/:id/suggestions` (POST, GET)
- [ ] Command handlers: `CreateSuggestion`, `ApproveSuggestion`, `RejectSuggestion`
- [ ] Tests workflow complet

**Critères de succès:**

- Un VIEWER_CONTRIBUTOR peut créer suggestion
- OWNER reçoit notification (email pour MVP)
- OWNER peut approve/reject
- Suggestion approved → appliquée au stock

### Phase 3: Notifications temps réel (2-3 semaines)

**Objectif:** Améliorer UX avec notifications push

**Livrables:**

- [ ] Entity `Notification`
- [ ] Service de notifications
- [ ] Intégration Server-Sent Events (SSE) ou WebSockets
- [ ] Frontend: affichage notifications temps réel
- [ ] Tests notifications

**Critères de succès:**

- Notification instantanée quand suggestion créée
- Badge de notifications non lues
- Historique consultable

### Phase 4: Fonctionnalités avancées (optionnel - 2-4 semaines)

**Objectif:** Enrichissement pour démonstration RNCP

**Livrables optionnels:**

- [ ] Audit log (historique des modifications)
- [ ] Permissions temporaires (partage limité dans le temps)
- [ ] Délégation de droits (OWNER → EDITOR temporaire)
- [ ] Analytics: qui modifie quoi, quand

## Conséquences

### Positives

- ✅ **Réponse complète au feedback RNCP:** "Couche d'autorisation" avec architecture justifiée
- ✅ **Use case réaliste:** Correspond exactement au besoin familial
- ✅ **Architecture démonstrable:** Event-driven, DDD, CQRS appliqués
- ✅ **Évolutivité:** Chaque phase apporte de la valeur incrémentale
- ✅ **Complexité maîtrisée:** Plan étalé sur 3-4 mois
- ✅ **Histoire pour le jury:** Cas d'usage concret avec évolution logique

### Négatives

- ⚠️ **Complexité accrue:** Plus de tables, plus de logique métier
- ⚠️ **Temps d'implémentation:** ~10-15 semaines au total
- ⚠️ **Maintenance:** Plus de code = plus de tests, plus de bugs potentiels
- ⚠️ **Performance:** Vérifications d'autorisation sur chaque requête

### Risques et mitigations

| Risque                                        | Probabilité | Impact | Mitigation                                                  |
| --------------------------------------------- | ----------- | ------ | ----------------------------------------------------------- |
| Dépassement temps avant RNCP                  | Moyenne     | Élevé  | Phase 1 = MVP suffisant, phases 2-4 optionnelles            |
| Bugs de sécurité (bypass autorisation)        | Faible      | Élevé  | Tests E2E exhaustifs, code review, middleware centralisé    |
| Performances dégradées (trop de checks)       | Faible      | Moyen  | Caching des permissions, index DB optimisés                 |
| Complexité architecture difficile à présenter | Faible      | Moyen  | Schémas clairs, documentation ADR, démo progressive au jury |

## Validation

### Critères de succès global

**Phase 1 (MVP RNCP):**

- [ ] Un utilisateur ne peut pas accéder aux stocks d'autres utilisateurs/familles
- [ ] Un OWNER peut partager son stock avec EDITOR/VIEWER
- [ ] Un EDITOR peut modifier, un VIEWER ne peut que lire
- [ ] Tests E2E couvrent tous les scénarios d'autorisation
- [ ] Documentation OpenAPI mise à jour avec nouveaux endpoints

**Phases 2-4 (Enrichissement):**

- [ ] Workflow de suggestions fonctionnel end-to-end
- [ ] Notifications temps réel opérationnelles
- [ ] Audit log consultable

### Métriques techniques

- Couverture tests: >80% sur middleware autorisation
- Performance: autorisation check <5ms (p95)
- Sécurité: 0 bypass possible (validé par tests E2E)

### Validation jury RNCP

**Points à démontrer:**

1. Architecture justifiée par use case réel (contexte familial)
2. Évolution progressive (MVP → enrichissement)
3. Maîtrise DDD/CQRS (Suggestion = aggregate, events)
4. Sécurité (isolation données, tests)
5. Event-driven architecture (notifications)

## Liens

- Issue GitHub: #44
- Code concerné:
  - `src/domain/family/` (nouveau)
  - `src/domain/stock-management/authorization/` (nouveau)
  - `src/api/middleware/authorize.ts` (nouveau)
  - `src/infrastructure/notifications/` (Phase 3)
- Documentation OpenAPI: `docs/openapi.yaml` (à mettre à jour Phase 1)

---

**Note:** Les ADRs sont immuables. Si cette décision change, créer une nouvelle ADR qui supplante celle-ci.
