# Audit — UpdateItem flow (backend)

## Contexte

Projet StockHub V2 — architecture DDD/CQRS — Node.js 22 + TypeScript + Express + Prisma + MySQL.
Il existe déjà `UpdateItemQuantityCommandHandler` qui ne gère que `quantity`.
On veut ajouter l'édition complète d'un item : `label`, `description`, `minimumStock`.

## Objectif de cet audit

Avant toute implémentation, cartographier exactement ce qui existe pour le flow items PATCH,
afin d'identifier précisément ce qu'il faut créer ou modifier.

## Ce que tu dois faire

### 1. Lire et rapporter le contenu de ces fichiers (s'ils existent)

```
src/domain/stock-management/manipulation/command-handlers(UseCase)/UpdateItemQuantityCommandHandler.ts
src/domain/stock-management/manipulation/commands(Request)/UpdateItemQuantityCommand.ts
src/domain/stock-management/manipulation/repositories/IStockCommandRepository.ts
src/infrastructure/repositories/PrismaStockCommandRepository.ts
```

Pour chaque fichier, rapporte :

- Son chemin exact
- Les méthodes/classes qu'il expose
- Ce qui concerne les items (méthodes avec "item" dans le nom)

### 2. Trouver le controller qui gère les routes items

Cherche le fichier controller qui définit la route PATCH pour les items :

```
GET /api/v2/stocks/:stockId/items
PATCH /api/v2/stocks/:stockId/items/:itemId
```

Rapporte :

- Le chemin du fichier
- Le contenu complet de la méthode PATCH items
- Quel CommandHandler elle appelle

### 3. Vérifier le router Express

Cherche le fichier qui enregistre les routes `/stocks/:stockId/items`.
Rapporte le chemin et les routes déclarées pour les items.

### 4. Synthèse — ce qu'il faudra créer/modifier

Sur la base de l'audit, liste précisément :

- Les fichiers à CRÉER (avec leur chemin complet suggéré)
- Les fichiers à MODIFIER (avec les méthodes à ajouter)
- L'ordre recommandé d'implémentation (de l'entité domain vers le controller)

## Format de réponse attendu

Réponds en markdown structuré avec un titre par section.
Sois exhaustif sur les chemins de fichiers — c'est ce qui servira de base
pour le prompt d'implémentation suivant.
