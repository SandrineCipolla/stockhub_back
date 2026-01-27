import { PrismaClient } from '@prisma/client';
import express from 'express';
import { StockRole } from '@domain/authorization/common/value-objects/StockRole';
import { AuthorizationRepository } from './repositories/AuthorizationRepository';
import {
  PERMISSIONS,
  RequiredPermission,
  AUTH_ERROR_MESSAGES,
  HTTP_STATUS,
  sendErrorResponse,
} from './constants/permissions';
import { rootSecurity } from '@utils/logger';

export interface AuthorizedRequest extends express.Request {
  userID?: string;
  stockRole?: string;
  isStockOwner?: boolean;
}

/**
 * Middleware to authorize access to stock resources
 * Must be used AFTER authenticationMiddleware
 *
 * @param requiredPermission - Permission level required (read, write, suggest)
 * @param prismaClient - Optional PrismaClient for dependency injection (testing)
 */
export function authorizeStockAccess(
  requiredPermission: RequiredPermission = PERMISSIONS.READ,
  prismaClient?: PrismaClient
) {
  const prisma = prismaClient ?? new PrismaClient();
  const repository = new AuthorizationRepository(prisma);

  return async (req: AuthorizedRequest, res: express.Response, next: express.NextFunction) => {
    try {
      // 1. Check if user is authenticated
      if (!req.userID) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_ERROR_MESSAGES.UNAUTHORIZED);
      }

      // 2. Extract stockId from route params
      const stockId = parseInt(req.params.stockId, 10);
      if (isNaN(stockId)) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.BAD_REQUEST,
          AUTH_ERROR_MESSAGES.INVALID_STOCK_ID
        );
      }

      // 3. Get user from database
      const user = await repository.findUserByEmail(req.userID);

      if (!user) {
        return sendErrorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // 4. Check if stock exists
      const stock = await repository.findStockById(stockId);

      if (!stock) {
        return sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, AUTH_ERROR_MESSAGES.STOCK_NOT_FOUND);
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
      const collaborator = await repository.findCollaboratorByUserAndStock(stockId, user.ID);

      if (!collaborator) {
        return sendErrorResponse(res, HTTP_STATUS.FORBIDDEN, AUTH_ERROR_MESSAGES.FORBIDDEN);
      }

      // 7. Check if role has required permission
      const roleValue = collaborator.role;
      const role = new StockRole(roleValue);
      req.stockRole = roleValue;

      if (!role.hasRequiredPermission(requiredPermission)) {
        return sendErrorResponse(
          res,
          HTTP_STATUS.FORBIDDEN,
          AUTH_ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS(collaborator.role, requiredPermission)
        );
      }

      // 8. Authorization successful
      return next();
    } catch (error) {
      rootSecurity.error('Authorization error:', error);
      return sendErrorResponse(res, HTTP_STATUS.INTERNAL_ERROR, AUTH_ERROR_MESSAGES.INTERNAL_ERROR);
    }
  };
}

/**
 * Shorthand middleware for read access
 */
export const authorizeStockRead = authorizeStockAccess(PERMISSIONS.READ);

/**
 * Shorthand middleware for write access
 */
export const authorizeStockWrite = authorizeStockAccess(PERMISSIONS.WRITE);

/**
 * Shorthand middleware for suggest access
 */
export const authorizeStockSuggest = authorizeStockAccess(PERMISSIONS.SUGGEST);
