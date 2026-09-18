# Audit complet de l'architecture DDD/CQRS — stockhub_back

## Contexte

Tu travailles sur le repo `stockhub_back` (Node.js 22 + TypeScript + Express + Prisma + MySQL).
Ce backend implémente une architecture DDD (Domain-Driven Design) avec CQRS.
Le projet est une certification RNCP Niveau 7 — chaque décision architecturale doit être défendable devant un jury.

## Mission

Effectue un **audit architectural complet** du dossier `src/`. L'objectif est de produire un document de référence que
la développeuse pourra :

1. Consulter pour comprendre sa propre arborescence en profondeur
2. Utiliser pour préparer la soutenance orale (expliquer chaque couche au jury)
3. Identifier les écarts avec un DDD "pur" et décider quoi corriger ou justifier

---

## Instructions pas à pas

### Étape 1 — Cartographie exhaustive

Parcours **tout** le dossier `src/` de façon récursive :

```bash
find src -type f -name "*.ts" | sort
```

Pour chaque sous-dossier de `src/`, liste tous les fichiers `.ts` présents.

### Étape 2 — Analyse par couche

Pour chacune des couches suivantes, lis les fichiers concernés et analyse leur contenu réel :

#### 2a. Couche Domain (`src/domain/`)

Pour chaque sous-dossier (`ai/`, `authorization/`, `prediction/`, `stock-management/`) :

- Liste les fichiers
- Identifie : entities, value objects, aggregates, interfaces de repository, domain services, domain events
- Note ce qui est présent et ce qui manque par rapport au DDD strict
- Lis le contenu des fichiers clés pour comprendre ce qu'ils font vraiment

#### 2b. Couche API (`src/api/`)

Pour chaque sous-dossier (`controllers/`, `dto/`, `routes/`, `types/`) :

- Liste les fichiers
- Identifie le rôle de chaque fichier
- Vérifie que les controllers ne contiennent pas de logique métier (violation DDD fréquente)
- Note les DTOs présents et leur usage

#### 2c. Couche Infrastructure (`src/infrastructure/`)

- Liste les fichiers
- Identifie les implémentations concrètes de repositories (Prisma)
- Vérifie que l'infrastructure dépend du domaine (et pas l'inverse)

#### 2d. Couche Services (`src/services/`)

- Liste et lis les fichiers : `readUserRepository.ts`, `userService.ts`, `writeUserRepository.ts`
- Analyse leur contenu réel
- Réponds clairement : est-ce de la logique métier ? De l'infrastructure ? Une couche applicative ?
- Propose un placement DDD correct avec justification

#### 2e. Authentication & Authorization (`src/authentication/`, `src/authorization/`)

- Liste les fichiers dans les deux dossiers
- Distingue bien authentification (qui es-tu ?) vs autorisation (as-tu le droit ?)
- Vérifie la cohérence avec les patterns DDD/CQRS pour la sécurité

#### 2f. Config & Setup (`src/config/`, `src/serverSetup/`, `src/Utils/`)

- Liste les fichiers
- Explique le rôle de chaque fichier
- Note `authConfig.ts`, `index.ts`, `initializeApp.ts` — ce qu'ils font concrètement

### Étape 3 — Analyse CQRS

Cherche dans tout le codebase les patterns CQRS :

```bash
grep -r "Command\|Query\|Handler\|CommandBus\|QueryBus" src/ --include="*.ts" -l
```

- Identifie les Commands et Queries implémentés
- Vérifie qu'il y a bien une séparation read/write
- Note si les Handlers sont correctement placés dans le domaine

### Étape 4 — Analyse des ADRs

Lis les fichiers dans `docs/adr/` :

```bash
ls docs/adr/
```

Pour chaque ADR, extrait : la décision prise, la justification, les alternatives rejetées.
Cela servira à la préparation orale.

### Étape 5 — Analyse des tests

```bash
find tests/ -type f -name "*.test.ts" | sort
```

- Liste les fichiers de tests
- Identifie ce qui est testé : value objects, entities, services, controllers ?
- Vérifie que les tests unitaires testent bien la logique domaine (pas l'infra)

### Étape 6 — Vérification des dépendances entre couches

Vérifie que la règle de dépendance DDD est respectée :
`domain` ← `application/services` ← `infrastructure` ← `api`

```bash
grep -r "from.*infrastructure" src/domain --include="*.ts"
grep -r "from.*api" src/domain --include="*.ts"
grep -r "from.*prisma" src/domain --include="*.ts"
```

Si des violations existent, liste-les clairement.

---

## Format de sortie attendu

Produis un fichier `ARCHITECTURE_AUDIT.md` dans `docs/` avec la structure suivante :

```markdown
# Audit Architecture DDD/CQRS — stockhub_back

## 1. Cartographie complète de src/

[arborescence avec tous les fichiers]

## 2. Analyse par couche

### 2.1 Domain — [statut : ✅ conforme / ⚠️ partiel / ❌ problème]

[Pour chaque sous-domaine : ce qui est présent, ce qui manque, verdict]

### 2.2 API (Présentation) — [statut]

[Analyse controllers, DTOs, routes]

### 2.3 Infrastructure — [statut]

[Analyse repositories Prisma, adaptateurs]

### 2.4 Services — [statut + recommandation de placement DDD]

[Analyse du contenu réel, verdict, proposition de correction ou justification]

### 2.5 Authentication / Authorization — [statut]

[Distinction auth vs authz, cohérence DDD]

### 2.6 Config / Setup / Utils — [statut]

[Rôle de chaque fichier]

## 3. Analyse CQRS

[Commands et Queries identifiés, séparation read/write vérifiée]

## 4. Synthèse des ADRs

[Tableau : ADR | Décision | Justification | Alternatives rejetées]

## 5. Couverture des tests

[Ce qui est testé, gaps identifiés]

## 6. Violations de la règle de dépendance

[Liste des violations si trouvées, sinon "aucune violation détectée"]

## 7. Bilan et recommandations pour la soutenance

### Points forts à mettre en avant au jury

[Liste]

### Écarts assumés à justifier

[Liste avec formulation orale suggérée pour chaque écart]

### Corrections prioritaires (si temps disponible)

[Liste ordonnée par impact/effort]
```

---

## Contraintes importantes

- Ne modifie **aucun fichier** existant, uniquement lecture + création de `docs/ARCHITECTURE_AUDIT.md`
- Sois **factuel** : base-toi sur le code réel, pas sur ce que le code devrait être
- Distingue clairement "DDD strict" vs "DDD pragmatique défendable"
- Le document doit être utilisable tel quel comme support de préparation à la soutenance RNCP 7
- Langue : **français**
