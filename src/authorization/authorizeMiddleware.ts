import { PrismaClient, StockRole as PrismaStockRole } from '@prisma/client';
import express from 'express';
import { StockRole } from '@domain/authorization/common/value-objects/StockRole';

const prisma = new PrismaClient();

export interface AuthorizedRequest extends express.Request {
  userID?: string;
  stockRole?: PrismaStockRole;
  isStockOwner?: boolean;
}

export type RequiredPermission = 'read' | 'write' | 'suggest';

/**
 * Middleware to authorize access to stock resources
 * Must be used AFTER authenticationMiddleware
 */
export function authorizeStockAccess(requiredPermission: RequiredPermission = 'read') {
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
      const user = await prisma.users.findUnique({
        where: { EMAIL: req.userID },
        select: { ID: true },
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // 4. Check if stock exists
      const stock = await prisma.stocks.findUnique({
        where: { ID: stockId },
        select: { ID: true, USER_ID: true },
      });

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
      const collaborator = await prisma.stockCollaborator.findUnique({
        where: {
          stockId_userId: {
            stockId: stockId,
            userId: user.ID,
          },
        },
        select: { role: true },
      });

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
 */
export const authorizeStockRead = authorizeStockAccess('read');

/**
 * Shorthand middleware for write access
 */
export const authorizeStockWrite = authorizeStockAccess('write');

/**
 * Shorthand middleware for suggest access
 */
export const authorizeStockSuggest = authorizeStockAccess('suggest');
