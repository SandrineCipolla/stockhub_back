# ADR-017 : Choix du framework HTTP — Express

**Date :** 2026-04-08
**Statut :** ✅ Accepté
**Décideurs :** Sandrine Cipolla
**Tags :** `framework`, `express`, `nestjs`, `fastify`, `architecture`

---

## Besoin métier

StockHub est une API Node.js/TypeScript dont l'architecture (DDD/CQRS) est déjà définie et maîtrisée. Le framework HTTP est une couche technique au service de cette architecture — il ne doit pas l'imposer ni interférer avec elle.

Le critère principal n'est pas la performance brute ni la richesse de l'outillage, mais la **compatibilité avec une architecture DDD/CQRS déjà structurée**, dans un contexte de développement solo.

---

## Décision

**Express 4** est retenu comme framework HTTP pour StockHub.

---

## Raisons

### 1. Express est minimal par conception — l'architecture vient du domaine, pas du framework

Express n'impose aucune structure applicative : il gère les routes, les middlewares, et la réponse HTTP. Toute la logique de structuration (commandes, handlers, repositories, value objects) est portée par l'architecture DDD/CQRS.

Cette séparation est délibérée. Le framework gère le transport ; le domaine gère la logique. Un framework qui impose sa propre structure (NestJS) crée un conflit de responsabilités avec cette approche.

### 2. NestJS aurait créé une superposition architecturale contre-productive

NestJS est un framework "opinionated" qui apporte son propre système de modules, de DI, de décorateurs, et de controllers. Ces concepts sont proches de DDD/CQRS mais pas équivalents — et mélanger les deux crée de la confusion :

```typescript
// ❌ Conflit NestJS + DDD : où s'arrête le module NestJS, où commence le bounded context ?
@Module({
  providers: [AddItemToStockCommandHandler], // DI NestJS
})
export class StockModule {} // Module NestJS ≠ domaine DDD

// ✅ Express + DDD : chaque couche a une responsabilité claire
router.post('/stocks/:id/items', authenticateMiddleware, async (req, res) => {
  const handler = new AddItemToStockCommandHandler(repository);
  const result = await handler.handle(command);
  res.status(201).json(result);
});
```

Avec Express, la DI est implémentée via le pattern `prismaClient ?? new PrismaClient()` — simple, testable, sans décorateurs. L'ajouter via NestJS aurait été un doublon de complexité.

### 3. Écosystème mature et documentation abondante

Express est le framework Node.js le plus utilisé depuis plus de 10 ans. Sur un projet RNCP développé en solo, la capacité à trouver rapidement une réponse à un problème de middleware, de gestion d'erreurs ou de routing est un critère opérationnel concret.

### 4. Faible surface d'apprentissage pour les middlewares existants

L'authentification (Passport Bearer), la gestion des erreurs, les middlewares d'autorisation, tous sont implémentés avec les patterns Express standard. Migrer vers Fastify ou NestJS aurait nécessité de réécrire ces intégrations.

---

## Alternatives considérées

### NestJS

**Principe :** Framework "batteries included" avec DI, modules, décorateurs, et CLI intégrés.

**Avantages :**

- ✅ Architecture structurée imposée (idéal pour onboarder une équipe)
- ✅ DI native, Swagger auto-généré, support TypeScript first-class
- ✅ Modules = bounded contexts naturels en théorie

**Pourquoi rejeté :**

- ❌ L'architecture DDD/CQRS est déjà définie et implémentée — NestJS l'aurait dupliquée sans valeur ajoutée
- ❌ Les décorateurs NestJS (`@Injectable`, `@Controller`, `@Module`) superposent une couche d'abstraction sur une architecture déjà abstraite
- ❌ Courbe d'apprentissage significative pour un projet solo avec délai RNCP
- ❌ Sur-engineering documenté : NestJS répond à des problèmes d'organisation à grande échelle que StockHub n'a pas

### Fastify

**Principe :** Framework HTTP plus rapide qu'Express, avec plugin system et schema validation intégrée.

**Avantages :**

- ✅ Performances ~2x supérieures à Express (benchmarks officiels)
- ✅ Validation JSON Schema native
- ✅ Logging structuré (Pino) intégré

**Pourquoi rejeté :**

- ❌ Les gains de performance sont sans impact mesurable pour StockHub (~10 utilisateurs, faible charge)
- ❌ La validation des données est déjà assurée par les Value Objects du domaine — la validation JSON Schema serait redondante
- ❌ Le logging structuré est déjà implémenté via `winston` et Application Insights
- ❌ Migration des middlewares Passport existants vers l'écosystème Fastify sans bénéfice justifié

---

## Conséquences

### Positives ✅

- Séparation claire : Express gère le transport, DDD/CQRS gère la logique
- Middlewares standard (Passport, CORS, body-parser) intégrés sans friction
- Aucun conflit entre la DI Express et la DI DDD (`prismaClient ?? new PrismaClient()`)
- Documentation abondante pour chaque problème rencontré

### Négatives ⚠️

- Pas de validation de schéma HTTP automatique (gérée manuellement via les Value Objects)
- Pas de génération automatique de Swagger (compensé par `docs/openapi.yaml` maintenu manuellement)

---

## Liens

- `src/api/routes/` — routes Express
- `src/authentication/authenticateMiddleware.ts` — middleware Passport
- [ADR-001](./ADR-001-migration-ddd-cqrs.md) — architecture DDD/CQRS
- Issue : [#182](https://github.com/SandrineCipolla/stockhub_back/issues/182)
