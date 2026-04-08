# ADR-017 : Choix du framework HTTP — Express

**Date :** 2026-04-08
**Statut :** ✅ Accepté
**Décideurs :** Sandrine Cipolla
**Tags :** `framework`, `express`, `nestjs`, `fastify`, `architecture`

---

## Besoin métier

Un framework HTTP, c'est la couche qui reçoit les requêtes du frontend, les route vers le bon code, et renvoie une réponse. Ce n'est pas lui qui contient la logique métier — c'est l'architecture DDD/CQRS qui s'en charge. Le framework est juste un "tuyau".

Le critère principal ici n'est pas la performance ou la richesse de l'outillage, mais la **compatibilité avec l'architecture DDD/CQRS déjà en place**, dans un contexte de développement solo.

---

## Décision

**Express 4** est retenu comme framework HTTP pour StockHub.

---

## Raisons

### 1. Express est minimaliste par conception — et c'est exactement ce qu'il faut ici

Express fait une chose : recevoir une requête HTTP, la passer aux middlewares et aux routes, retourner une réponse. Il n'impose aucune structure sur la façon d'organiser le code applicatif.

C'est un choix délibéré : toute la structure de StockHub (commandes, handlers, repositories, value objects) est portée par l'architecture DDD/CQRS. On n'a pas besoin qu'un framework vienne en imposer une deuxième par-dessus.

```
Requête HTTP
    → Express (routing + middlewares)
    → Controller (couche API)
    → Command Handler (couche domaine)
    → Repository (couche infrastructure)
    → Réponse HTTP
```

Express intervient au début et à la fin. Le reste appartient au domaine.

### 2. NestJS aurait créé une confusion architecturale

NestJS est un framework qui apporte sa propre façon d'organiser le code : ses propres "modules", son propre système d'injection de dépendances, ses propres décorateurs (`@Controller`, `@Injectable`, `@Module`...).

Ces concepts ressemblent à du DDD/CQRS mais ne sont pas la même chose. Mélanger les deux aurait créé de la confusion : où s'arrête le "module NestJS" et où commence le "bounded context DDD" ?

**Exemple concret du problème :**

```typescript
// ❌ Avec NestJS : deux systèmes d'organisation du code en parallèle
@Module({
  providers: [AddItemToStockCommandHandler], // Structure NestJS
})
export class StockModule {} // Module NestJS ≠ domaine DDD

// ✅ Avec Express : une seule responsabilité par couche
router.post('/stocks/:id/items', async (req, res) => {
  const handler = new AddItemToStockCommandHandler(repository);
  const result = await handler.handle(command);
  res.status(201).json(result);
});
// Express gère le HTTP. Le handler gère la logique. Chacun son rôle.
```

De plus, NestJS gère l'injection de dépendances avec ses décorateurs. Dans StockHub, l'injection de dépendances est déjà gérée simplement avec le pattern `prismaClient ?? new PrismaClient()`. Ajouter le système NestJS par-dessus aurait été une duplication inutile.

### 3. Écosystème mature et documentation abondante

Express existe depuis 2010 et est le framework Node.js le plus utilisé. Sur un projet solo, la capacité à trouver rapidement une réponse à un problème (middleware, gestion d'erreurs, routing) est un critère concret. Les réponses existent sur Stack Overflow, GitHub, la doc officielle.

### 4. Les middlewares existants sont déjà écrits pour Express

L'authentification (Passport Bearer), la gestion des erreurs, les middlewares d'autorisation — tout est déjà implémenté avec les patterns Express. Changer de framework aurait nécessité de tout réécrire sans rien gagner en fonctionnalité.

---

## Alternatives considérées

### NestJS

**Principe :** Framework complet et "opinionated" — il impose une façon précise d'organiser le code, avec des modules, de l'injection de dépendances automatique, des décorateurs partout, et une CLI pour générer les fichiers.

**Avantages :**

- ✅ Très structuré — utile dans une grande équipe pour que tout le monde travaille de la même façon
- ✅ Injection de dépendances automatique, Swagger auto-généré, support TypeScript natif
- ✅ En théorie, ses "modules" pourraient correspondre aux bounded contexts DDD

**Pourquoi rejeté :**

- ❌ L'architecture DDD/CQRS est déjà définie et implémentée dans StockHub — NestJS aurait ajouté une deuxième couche d'organisation au-dessus sans rien apporter de plus
- ❌ Les décorateurs NestJS (`@Injectable`, `@Controller`, `@Module`) s'ajoutent sur du code qui a déjà sa propre structure — plus de complexité, pas plus de clarté
- ❌ NestJS est pensé pour de grandes équipes sur de grands projets. Sur un projet solo de taille moyenne, c'est du sur-dimensionnement
- ❌ Courbe d'apprentissage significative (il faut comprendre le système de modules NestJS en plus du DDD/CQRS) pour un projet avec un délai RNCP

### Fastify

**Principe :** Framework HTTP alternatif à Express, conçu pour être plus rapide. Il gère aussi la validation automatique des données entrantes via des schémas JSON.

**Avantages :**

- ✅ Environ 2 fois plus rapide qu'Express sur des benchmarks (temps de traitement des requêtes)
- ✅ Validation des données d'entrée intégrée (plus besoin de valider manuellement les champs du body)
- ✅ Logging structuré intégré (via Pino)

**Pourquoi rejeté :**

- ❌ Le gain de performance (~2x) n'a aucun impact réel pour StockHub qui a environ 10 utilisateurs. Ce n'est pertinent qu'à grande échelle
- ❌ La validation des données est déjà assurée par les Value Objects du domaine (ex : `StockLabel` valide que le label fait entre 3 et 50 caractères). Ajouter une validation côté framework serait une duplication
- ❌ Le logging structuré est déjà en place via `winston` et Application Insights
- ❌ Migrer les middlewares Passport existants vers l'écosystème Fastify demanderait du travail sans bénéfice justifié

---

## Conséquences

### Positives ✅

- Séparation claire des responsabilités : Express gère le transport HTTP, DDD/CQRS gère la logique
- Middlewares standard (Passport, CORS, body-parser) intégrés sans friction
- Injection de dépendances simple et lisible (`prismaClient ?? new PrismaClient()`) sans système externe
- Documentation abondante pour chaque problème rencontré

### Négatives ⚠️

- Pas de validation automatique des données HTTP entrantes (gérée manuellement via les Value Objects du domaine)
- Pas de génération automatique de la documentation Swagger (compensé par `docs/openapi.yaml` maintenu manuellement)

---

## Liens

- `src/api/routes/` — routes Express
- `src/authentication/authenticateMiddleware.ts` — middleware Passport
- [ADR-001](./ADR-001-migration-ddd-cqrs.md) — architecture DDD/CQRS
- Issue : [#182](https://github.com/SandrineCipolla/stockhub_back/issues/182)
