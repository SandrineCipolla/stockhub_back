# Rapport Audit Seed — stockhub_back — 2026-03-23

## 1. Schéma Prisma

### Modèles et champs

| Modèle              | Champs obligatoires                             | Contraintes notables               |
| ------------------- | ----------------------------------------------- | ---------------------------------- |
| `User`              | `email`                                         | `email` unique                     |
| `Stock`             | `label`, `category` (défaut: `alimentation`)    | `userId` optionnel, FK vers User   |
| `Item`              | — (tout optionnel sauf `minimumStock` défaut 1) | `stockId` optionnel, FK vers Stock |
| `Family`            | `name`                                          | —                                  |
| `FamilyMember`      | `familyId`, `userId`, `role` (défaut MEMBER)    | unique `[familyId, userId]`        |
| `StockCollaborator` | `stockId`, `userId`, `role` (défaut VIEWER)     | unique `[stockId, userId]`         |

### Enums

- `StockCategory` : `alimentation`, `hygiene`, `artistique`
- `FamilyRole` : `ADMIN`, `MEMBER`
- `StockRole` : `OWNER`, `EDITOR`, `VIEWER`, `VIEWER_CONTRIBUTOR`

### Ordre de création (contraintes FK)

```
User → Family → FamilyMember
User → Stock → Item
Stock + User → StockCollaborator
```

---

## 2. Seed existant — `prisma/seed.ts`

**Statut : EXISTE — fonctionnel et idempotent**

### Données créées

- 3 utilisateurs : owner (`SEED_OWNER_EMAIL`), alice, bob
- 1 famille "Famille StockHub" : owner ADMIN, alice MEMBER
- 3 stocks (owner) : Stock Café, Stock Hygiène, Stock Artistique
- 9 items (3 par stock), dont 1 en sous-stock intentionnel par stock :
  - Café Soluble : qty=1, min=10 ⚠
  - Shampoing : qty=2, min=6 ⚠
  - Toile 30x40cm : qty=0, min=3 ⚠
- 1 collaborateur : alice EDITOR sur Stock Café

### Pattern utilisé

`upsert` idempotent sur tous les modèles — safe à rejouer sans doublons.

### Ce qui manque pour le module IA

Aucune donnée `ItemHistory` — la table n'existe pas encore (bloqué sur issue [#123](https://github.com/SandrineCipolla/stockhub_back/issues/123)).

---

## 3. Données de test existantes

| Fichier                         | Statut     | Remarque                                                                                     |
| ------------------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| `tests/__mocks__/mockedData.ts` | Obsolète   | Ancienne architecture pré-Prisma, champ `quantity` à plat — incohérent avec le schema actuel |
| `*.factory.ts` / `*.fixture.ts` | Inexistant | Aucun fichier de ce type                                                                     |
| Tests domain/integration        | Inline     | Données créées directement via Prisma dans chaque test                                       |

---

## 4. Scripts seed dans `package.json`

```json
"db:seed": "ts-node -r tsconfig-paths/register prisma/seed.ts"
"seed":    "ts-node -r tsconfig-paths/register prisma/seed.ts"
```

- `ts-node` v10.9.2 disponible
- Pas de config `"prisma": { "seed": ... }` — le seed se lance via scripts custom, pas via `prisma db seed`

---

## 5. Authentification

- `User` n'a **pas** de champ `azureId` — identifié uniquement par `email` (unique)
- La première connexion Azure B2C crée l'utilisateur en base via son email
- Pour le seed : seul `SEED_OWNER_EMAIL` doit correspondre à un vrai compte Azure B2C — alice et bob sont fictifs

---

## Conclusion

### Ce qui est prêt

- Seed fonctionnel, idempotent, données de démo réalistes avec sous-stocks intentionnels
- Scripts `db:seed` et `seed` configurés
- `ts-node` disponible pour exécution

### Ce qui manque

- Table `ItemHistory` (bloqué sur issue #123)
- Données d'historique dans le seed (90 jours de consommation simulée pour que les prédictions fonctionnent dès la démo jury)

### Recommandation

**Étendre `prisma/seed.ts` existant** — ne pas créer de nouveau fichier.
Ajouter un bloc `ItemHistory` après la création des items, une fois la migration #123 appliquée.
