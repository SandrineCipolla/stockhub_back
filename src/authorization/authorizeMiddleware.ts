import { PrismaClient, StockRole as PrismaStockRole } from '@prisma/client';
import express from 'express';
import { StockRole } from '@domain/authorization/common/value-objects/StockRole';
import { AuthorizationRepository } from './repositories/AuthorizationRepository';

export interface AuthorizedRequest extends express.Request {
  userID?: string;
  stockRole?: PrismaStockRole;
  isStockOwner?: boolean;
}

export type RequiredPermission = 'read' | 'write' | 'suggest';

/**
 * Middleware to authorize access to stock resources
 * Must be used AFTER authenticationMiddleware
 *
 * @param requiredPermission - The permission level required (read, write, suggest)
 * @param repository - Optional AuthorizationRepository for dependency injection (useful for testing)
 */
export function authorizeStockAccess(
  requiredPermission: RequiredPermission = 'read',
  repository?: AuthorizationRepository
) {
  const authRepository = repository ?? new AuthorizationRepository(new PrismaClient());

  return async (req: AuthorizedRequest, res: express.Response, next: express.NextFunction) => {
    try {
      // 1. Check if user is authenticated
      if (!req.userID) {
        return res.status(401).json({ error: 'Unauthorized - Authentication required' });
      }

      // 2. Extract stockId from route params
      const stockId = parseInt(req.params.stockId, 10);
      if (isNaN(stockId)) {
        return res.status(400).json({ error: 'Invalid stock ID' });
      }

      // 3. Get user from database
      const user = await authRepository.findUserByEmail(req.userID);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // 4. Check if stock exists
      const stock = await authRepository.findStockById(stockId);

      if (!stock) {
        return res.status(404).json({ error: 'Stock not found' });
      }

      // 5. Check if user is the stock owner
      const isOwner = stock.USER_ID === user.ID;
      req.isStockOwner = isOwner;

      if (isOwner) {
        // Owner has full access
        req.stockRole = 'OWNER';
        return next();
      }

      // 6. Check if user has a collaborator role
      const collaborator = await authRepository.findCollaboratorByUserAndStock(stockId, user.ID);

      if (!collaborator) {
        return res.status(403).json({
          error: 'Forbidden - You do not have access to this stock',
        });
      }

      // 7. Check if role has required permission
      const roleValue = collaborator.role;
      const role = new StockRole(roleValue);
      req.stockRole = roleValue;

      let hasPermission = false;

      switch (requiredPermission) {
        case 'read':
          hasPermission = role.canRead();
          break;
        case 'write':
          hasPermission = role.canWrite();
          break;
        case 'suggest':
          hasPermission = role.canSuggest();
          break;
      }

      if (!hasPermission) {
        return res.status(403).json({
          error: `Forbidden - Your role (${collaborator.role}) does not allow ${requiredPermission} access`,
        });
      }

      // 8. Authorization successful
      return next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ error: 'Internal server error during authorization' });
    }
  };
}

/**
 * Shorthand middleware for read access
 * @param repository - Optional AuthorizationRepository for dependency injection (useful for testing)
 */
export const authorizeStockRead = (repository?: AuthorizationRepository) =>
  authorizeStockAccess('read', repository);

/**
 * Shorthand middleware for write access
 * @param repository - Optional AuthorizationRepository for dependency injection (useful for testing)
 */
export const authorizeStockWrite = (repository?: AuthorizationRepository) =>
  authorizeStockAccess('write', repository);

/**
 * Shorthand middleware for suggest access
 * @param repository - Optional AuthorizationRepository for dependency injection (useful for testing)
 */
export const authorizeStockSuggest = (repository?: AuthorizationRepository) =>
  authorizeStockAccess('suggest', repository);
