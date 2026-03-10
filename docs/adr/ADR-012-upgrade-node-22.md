# ADR-012: Migration vers Node.js 22 LTS

**Date:** 2026-03-10
**Statut:** Accepté
**Décideurs:** Sandrine Cipolla

---

## Contexte

Le projet utilisait Node.js 20 LTS (fin de support actif : octobre 2026, fin de maintenance : avril 2026).

Node.js 22 est entré en phase **LTS active** en octobre 2024 avec un support garanti jusqu'en avril 2027, et maintenance jusqu'en avril 2028.

### Périmètre de la migration

- `Dockerfile` : image de base `node:22-alpine`
- `.github/workflows/ci.yml` : `node-version: '22.x'`
- `render.yaml` : `nodeVersion: 22`
- `.nvmrc` : version locale `22`

---

## Décision

Migrer de **Node.js 20** vers **Node.js 22 LTS** sur tous les environnements (local, CI, staging, production).

---

## Raisons

| Critère                   | Node.js 20               | Node.js 22             |
| ------------------------- | ------------------------ | ---------------------- |
| Statut LTS                | Maintenance (→ avr 2026) | Actif (→ avr 2027)     |
| V8 Engine                 | V8 11.3                  | V8 12.4                |
| Performance               | Référence                | +~10% selon benchmarks |
| `fetch` natif             | Expérimental             | Stable                 |
| Support Azure App Service | ✅                       | ✅                     |

### Cohérence des environnements

La règle Ce3.5 #22 exige des environnements homogènes. Mettre à jour tous les points de configuration simultanément garantit que CI, staging et prod tournent exactement sur la même version.

---

## Alternatives considérées

| Alternative                | Raison du rejet                                                   |
| -------------------------- | ----------------------------------------------------------------- |
| **Rester sur Node.js 20**  | Fin de support maintenance avril 2026, dette technique croissante |
| **Migrer vers Node.js 23** | Version Current, pas LTS — instabilité et support court           |
| **Migrer progressivement** | Risque de divergence entre environnements                         |

---

## Conséquences

### Positives

- Environnements uniformes sur Node.js 22 LTS (local, CI, staging, prod)
- Support garanti jusqu'en avril 2028
- Accès aux dernières améliorations de performance V8
- `fetch` natif stable (supprime le besoin de `node-fetch` si utilisé)

### Négatives

- Risque de breaking changes dans les dépendances natives — validé par `npm audit` et CI sans erreur
- Mise à jour requise sur tous les environnements simultanément (réalisée dans PR #105)

### Validation

- Tests unitaires (145 tests) : ✅ passent sur Node.js 22
- Pipeline CI GitHub Actions : ✅
- Build Webpack : ✅
