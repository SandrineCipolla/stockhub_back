# Guide du système de logging — StockHub Backend

Le projet utilise un système de logging structuré à deux niveaux : `logger.ts` (logs locaux) et `cloudLogger.ts` (monitoring Azure Application Insights).

**Règle absolue : jamais de `console.*` dans le code — utiliser uniquement le logger structuré.**

---

## Architecture

```
src/Utils/
  ├── logger.ts        # Logging local (typescript-logging-category-style)
  └── cloudLogger.ts   # Intégration Azure Application Insights
```

Tous les logs passent par `logger.ts`, capturés automatiquement par `cloudLogger.ts` en production.

---

## 1. Logger local (`logger.ts`)

### Catégories disponibles

| Catégorie            | Import                          | Usage                     |
| -------------------- | ------------------------------- | ------------------------- |
| `rootController`     | `import { rootController }`     | Controllers et routes     |
| `rootDatabase`       | `import { rootDatabase }`       | Repositories et accès DB  |
| `rootSecurity`       | `import { rootSecurity }`       | Auth et autorisation      |
| `rootUtils`          | `import { rootUtils }`          | Utilitaires               |
| `rootServerSetup`    | `import { rootServerSetup }`    | Configuration serveur     |
| `rootUserService`    | `import { rootUserService }`    | Service utilisateur       |
| `rootWriteStockRepo` | `import { rootWriteStockRepo }` | Repository écriture stock |
| `rootSecurityAuthMW` | `import { rootSecurityAuthMW }` | Middleware auth           |

### Niveaux de log

| Niveau  | Quand l'utiliser                                  |
| ------- | ------------------------------------------------- |
| `debug` | Debugging détaillé (désactivé en production)      |
| `info`  | Opérations normales (requête traitée, stock créé) |
| `warn`  | Situation anormale non bloquante (stock faible)   |
| `error` | Erreur nécessitant attention (DB inaccessible)    |

### Utilisation

```typescript
import { rootController } from '@utils/logger';

// Sous-catégorie (recommandé)
const logger = rootController.getChildCategory('stockRoutes');

logger.info('Stock {stockId} created by user {userId}', stockId, userId);
logger.error('Failed to create stock {stockId}', stockId, error);
logger.warn('Low stock detected: {stockId}', stockId);
logger.debug('Processing request...', requestData);
```

> ⚠️ Utiliser des **placeholders `{nom}`** plutôt que la concaténation de strings.

---

## 2. Cloud Logger (`cloudLogger.ts`)

```typescript
import { rootCloudEvent, rootDependency, rootException } from '@utils/cloudLogger';

// Événement métier
rootCloudEvent('StockCreated', { stockId: 123, category: 'alimentation' });

// Dépendance externe
rootDependency({
  target: 'MySQL',
  name: 'findStockById',
  duration: 45,
  resultCode: 200,
  success: true,
  dependencyTypeName: 'SQL',
});

// Exception
rootException(new Error('Database connection failed'));
```

---

## 3. Exemples par couche

### Controller / Route

```typescript
import { rootController } from '@utils/logger';

const configureStockRoutes = async (): Promise<Router> => {
  const logger = rootController.getChildCategory('configureStockRoutes');

  router.get('/stocks', async (req, res) => {
    try {
      await stockController.getAllStocks(req, res);
    } catch (error) {
      logger.error('Error in GET /stocks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
```

### Repository

```typescript
import { rootDatabase } from '@utils/logger';

export class PrismaStockCommandRepository {
  private logger = rootDatabase.getChildCategory('stockCommandRepository');

  async createStock(command: CreateStockCommand): Promise<Stock> {
    this.logger.info('Creating stock: {label}', command.label);
    try {
      const stock = await this.prisma.stocks.create({ ... });
      this.logger.info('Stock created: {stockId}', stock.ID);
      return stock;
    } catch (error) {
      this.logger.error('Failed to create stock: {label}', command.label, error);
      throw error;
    }
  }
}
```

### Middleware auth

```typescript
import { rootSecurity } from '@utils/logger';

const logger = rootSecurity.getChildCategory('authMiddleware');

logger.debug('Authenticating request...');
logger.warn('Authentication failed: No token provided');
logger.info('Token validated for user: {userId}', user.id);
```

---

## 4. Sécurité — Ne jamais logger

```typescript
// ❌ INTERDIT
logger.info('Client ID: {id}', authConfig.credentials.clientID);
logger.info('Password: {pwd}', password);
logger.info('JWT token: {token}', token);
logger.info('Connection string: {conn}', databaseUrl);

// ✅ OK
logger.info('User logged in: {userId}', user.id);
logger.info('Stock created: {stockId}', stock.id);
logger.error('Database connection failed', error); // pas de credentials
```

---

## 5. Checklist avant commit

- [ ] Pas de `console.log / console.error / console.warn / console.info`
- [ ] Logger structuré utilisé (`rootController`, `rootDatabase`, etc.)
- [ ] Placeholders `{nom}` utilisés (pas de concaténation)
- [ ] Pas d'infos sensibles dans les logs (credentials, tokens, passwords)
- [ ] Niveau approprié : `debug` / `info` / `warn` / `error`
- [ ] Sous-catégorie créée avec `.getChildCategory()`
- [ ] Try/catch avec `logger.error()` sur toutes les exceptions
