# Vérification post-corrections — StockHub V2 Back-end

> **Mode d'emploi** : Dépose ce fichier à la racine du repo `stockhub_back`.
> Dans Claude Code : **"Lis VERIFICATION_POST_CORRECTIONS_BACK.md et exécute les vérifications"**
> C'est un audit de confirmation — pas de modifications de code sauf si une vérification échoue.

---

## VÉRIFICATION 1 — Sécurité A01 (Correction 1)

**Ce qu'on vérifie** : `authorizeStockWrite` bien présent sur PATCH et DELETE /stocks/:stockId

```bash
# Commande à lancer :
grep -n "authorizeStockWrite\|router.patch\|router.delete" src/api/routes/StockRoutesV2.ts
```

**Résultat attendu** : `authorizeStockWrite` apparaît sur les lignes PATCH et DELETE /stocks/:stockId

**Test fonctionnel** :

```bash
npm run test:unit
```

**Rapport** :

- [ ] `authorizeStockWrite` présent sur `PATCH /stocks/:stockId`
- [ ] `authorizeStockWrite` présent sur `DELETE /stocks/:stockId`
- [ ] Tous les tests unitaires passent

---

## VÉRIFICATION 2 — Coverage (Correction 2)

**Ce qu'on vérifie** : seuil configuré + taux affiché dans le README

```bash
# Vérifier le threshold dans jest.ci.config.js
grep -A 10 "coverageThreshold" jest.ci.config.js

# Vérifier la section coverage dans le README
grep -A 10 "Coverage\|coverage" README.md | head -20

# Lancer le coverage pour confirmer qu'il passe le seuil
npm run test:coverage
```

**Résultat attendu** :

- `coverageThreshold` présent dans `jest.ci.config.js`
- Section coverage visible dans `README.md`
- `npm run test:coverage` se termine sans erreur de threshold

**Rapport** :

- [ ] `coverageThreshold` configuré dans `jest.ci.config.js`
- [ ] Taux backend affiché dans `README.md`
- [ ] `npm run test:coverage` passe sans échec de seuil

---

## VÉRIFICATION 3 — `.env.example` (Correction 3)

**Ce qu'on vérifie** : fichier présent, complet, versionné

```bash
# Vérifier que le fichier existe
ls -la .env.example

# Vérifier qu'il n'est PAS dans .gitignore (doit être versionné)
grep "\.env\.example" .gitignore

# Afficher son contenu
cat .env.example
```

**Résultat attendu** :

- `.env.example` existe à la racine
- `.gitignore` ne contient PAS `.env.example` (il doit être versionné)
- Toutes les variables d'env utilisées dans le code sont listées

**Rapport** :

- [ ] `.env.example` présent à la racine
- [ ] Non exclu par `.gitignore`
- [ ] Variables complètes (PORT, DATABASE*URL, AZURE*_, ALLOWED*ORIGINS, APPLICATIONINSIGHTS*_)

---

## VÉRIFICATION 4 — OpenAPI (Correction 4)

**Ce qu'on vérifie** : 3 endpoints ajoutés, version corrigée

```bash
# Vérifier les 3 endpoints manquants
grep -n "patch.*stocks.*stockId\|delete.*stocks.*stockId\|delete.*items.*itemId" docs/openapi.yaml

# Vérifier la version
grep "version:" docs/openapi.yaml | head -5
```

**Résultat attendu** :

- `patch /api/v2/stocks/{stockId}` documenté
- `delete /api/v2/stocks/{stockId}` documenté
- `delete /api/v2/stocks/{stockId}/items/{itemId}` documenté
- `version: 2.5.0` dans `info`

**Rapport** :

- [ ] PATCH /stocks/{stockId} présent dans openapi.yaml
- [ ] DELETE /stocks/{stockId} présent dans openapi.yaml
- [ ] DELETE /stocks/{stockId}/items/{itemId} présent dans openapi.yaml
- [ ] version: 2.5.0 dans info

---

## VÉRIFICATION 5 — RGPD back (Correction 5)

**Ce qu'on vérifie** : docs/rgpd.md créé et lié depuis le README

```bash
# Vérifier que le fichier existe
ls -la docs/rgpd.md

# Vérifier le contenu minimal (tableau traitements + rétention + droits)
grep -c "rétention\|effacement\|Base légale" docs/rgpd.md

# Vérifier le lien depuis le README
grep -i "rgpd\|privacy\|données" README.md
```

**Résultat attendu** :

- `docs/rgpd.md` existe
- Contient les sections : données traitées, politique de rétention, droits RGPD
- README.md fait référence à ce fichier

**Rapport** :

- [ ] `docs/rgpd.md` présent
- [ ] Tableau des traitements avec base légale
- [ ] Politique de rétention documentée
- [ ] Lien depuis README.md

---

## VÉRIFICATION 6 — DDD StockCategory (Correction 6)

**Ce qu'on vérifie** : import `@prisma/client` supprimé du domaine

```bash
# Vérifier que l'import Prisma n'est plus dans Stock.ts
grep "@prisma/client" src/domain/stock-management/common/entities/Stock.ts

# Vérifier que l'enum domaine existe
ls src/domain/stock-management/common/value-objects/StockCategory.ts

# Vérifier que TypeScript compile
npx tsc --noEmit

# Relancer les tests
npm run test:unit
```

**Résultat attendu** :

- `grep` ne retourne rien (import Prisma absent)
- `StockCategory.ts` existe dans le domaine
- `npx tsc --noEmit` sans erreur
- Tests passent

**Rapport** :

- [ ] `@prisma/client` absent de `Stock.ts`
- [ ] `src/domain/.../value-objects/StockCategory.ts` créé
- [ ] TypeScript compile sans erreur
- [ ] Tests unitaires passent

---

## VÉRIFICATION 7 — ADRs (Correction 7)

**Ce qu'on vérifie** : ADR-011 et ADR-012 créés et référencés dans l'index

```bash
# Vérifier les fichiers
ls docs/adr/ADR-011* docs/adr/ADR-012*

# Vérifier qu'ils sont dans l'index
grep "ADR-011\|ADR-012" docs/adr/INDEX.md

# Vérifier le contenu minimal de chaque ADR
grep -c "Contexte\|Décision\|Alternatives\|Conséquences" docs/adr/ADR-011-staging-render-aiven.md
grep -c "Contexte\|Décision\|Alternatives\|Conséquences" docs/adr/ADR-012-migration-node22.md
```

**Résultat attendu** :

- Les deux fichiers existent
- Référencés dans `INDEX.md`
- Chaque ADR contient les 4 sections obligatoires (résultat = 4)

**Rapport** :

- [ ] `ADR-011-staging-render-aiven.md` présent
- [ ] `ADR-012-migration-node22.md` présent
- [ ] Les deux référencés dans `INDEX.md`
- [ ] 4 sections obligatoires dans chaque ADR

---

## VÉRIFICATION GLOBALE FINALE

```bash
# TypeScript — aucune régression
npx tsc --noEmit

# Tests unitaires — tous verts
npm run test:unit

# Lint — pas de nouvelles erreurs
npm run lint

# Build — le projet compile
npm run build
```

**Rapport final** :

- [ ] `npx tsc --noEmit` → 0 erreur
- [ ] `npm run test:unit` → tous verts
- [ ] `npm run lint` → 0 erreur nouvelle
- [ ] `npm run build` → succès

---

## FORMAT DE SORTIE ATTENDU

Génère un fichier `VERIFICATION_RESULTS.md` avec :

```markdown
# Résultats de vérification post-corrections

Date : [date]
Branche : [nom de la branche]

## Vérification 1 — Sécurité A01

✅ / ❌ — [détail]

## Vérification 2 — Coverage

✅ / ❌ — [taux mesuré] / seuil [seuil configuré]

## Vérification 3 — .env.example

✅ / ❌ — [détail]

## Vérification 4 — OpenAPI

✅ / ❌ — [endpoints trouvés]

## Vérification 5 — RGPD back

✅ / ❌ — [détail]

## Vérification 6 — DDD StockCategory

✅ / ❌ — [détail]

## Vérification 7 — ADRs

✅ / ❌ — [détail]

## Vérification globale

- TypeScript : ✅ / ❌
- Tests : ✅ / ❌ ([X] tests passés)
- Lint : ✅ / ❌
- Build : ✅ / ❌

## Résumé

[X]/7 corrections validées
```

Dépose ce fichier dans le repo et reviens avec les résultats.
