# 🧵 Ticket Fil Rouge : Axes d'Amélioration et Excellence Backend

> **Statut** : En réserve / Optionnel (À traiter si du temps se libère avant la soutenance)  
> **Objectif** : Consolider l'architecture backend et éliminer les dernières dettes techniques d'infrastructure et de validation des données.

---

## 🎯 Liste des 5 Leviers d'Amélioration

### 1. 🛡️ Validation Runtime des Inputs HTTP avec Zod (Ticket #219)

- **Pourquoi** : Le typage TypeScript protège à la compilation. L'ajout de Zod garantit la validation à la frontière de l'API (HTTP Controllers).
- **Actions** :
  - [ ] Créer les schémas Zod sous `src/api/dtos/validators/` (ex: `createStockSchema`, `updateItemSchema`).
  - [ ] Valider `req.body` et `req.params` dans les controllers avant d'invoquer les cas d'usage CQRS.
  - [ ] Retourner une erreur HTTP Bad Request structurée avec le détail des champs invalides.

---

### 2. 🔌 Singleton Prisma Client & Composition Root (ADR-020)

- **Pourquoi** : Évite les instanciations multiples du client Prisma dans les repositories et prévient l'épuisement du pool de connexions BDD.
- **Actions** :
  - [ ] Centraliser l'instance unique de `PrismaClient` dans l'infrastructure.
  - [ ] Injecter l'instance dans tous les repositories lors de leur construction dans la Composition Root (`StockRoutesV2.ts`).
  - [ ] Passer [ADR-020](../adr/ADR-020-conversion-hexagonale-authorize-middleware.md) au statut `Accepté`.

---

### 3. 🚨 Procédure de Rollback CI/CD & Base de données (Ticket #224)

- **Pourquoi** : Formaliser la gestion des incidents et des retours arrière en environnement de production.
- **Actions** :
  - [ ] Rédiger la procédure dans `docs/ci-cd/ROLLBACK-PROCEDURE.md`.
  - [ ] Documenter le retour arrière applicatif sur le service Cloud.
  - [ ] Documenter la gestion du rollback des migrations de base de données.

---

### 4. ⚙️ Endpoint Batch de recalcul des prédictions (Ticket #135)

- **Pourquoi** : Consolider le rôle du backend comme moteur d'analyse et de traitement par lots.
- **Actions** :
  - [ ] Créer le use-case de recalcul global des prédictions.
  - [ ] Exposer l'endpoint d'administration dédié `/api/v2/admin/predictions/recalculate`.
  - [ ] Documenter le déclenchement automatisé.

---

### 5. 🧪 Couverture de branches CQRS (Ticket #209)

- **Pourquoi** : Sécuriser les cas limites et les scénarios d'erreur des handlers CQRS.
- **Actions** :
  - [ ] Identifier les branches non couvertes via les rapports de tests.
  - [ ] Ajouter les tests unitaires ciblés pour les cas d'exception (ressources introuvables, droits insuffisants, erreurs BDD).

---

## 📋 Synthèse des leviers

| Levier                   | Impact                         |
| :----------------------- | :----------------------------- |
| **1. Validation Zod**    | 🔒 Robustesse frontière HTTP   |
| **2. Singleton Prisma**  | 🏗️ Performance & Architecture  |
| **3. Doc Rollback**      | 🚀 Résilience & Procédures Ops |
| **4. Batch Prédictions** | 🧠 Traitement métier par lots  |
| **5. Branch Coverage**   | 🧪 Fiabilité des tests         |
