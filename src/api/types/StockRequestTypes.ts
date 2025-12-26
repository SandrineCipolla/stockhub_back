import type { ParamsDictionary } from 'express-serve-static-core';
import type { AuthenticatedRequest } from './AuthenticatedRequest';

/**
 * Request body types for stock manipulation endpoints
 */

export interface CreateStockBody {
  label: string;
  description: string;
  category: string;
}

export interface AddItemToStockBody {
  label: string;
  quantity: number;
  description: string;
  minimumStock: number;
}

export interface UpdateItemQuantityBody {
  quantity: number;
}

/**
 * Route parameter types
 */

export interface StockParams extends ParamsDictionary {
  stockId: string;
}

export interface StockItemParams extends ParamsDictionary {
  stockId: string;
  itemId: string;
}

/**
 * Type aliases for authenticated requests
 *
 * These aliases provide:
 * - Type safety without type assertions (no "as" needed)
 * - Better IDE autocomplete
 * - Single source of truth for request types
 * - Easier refactoring and maintenance
 *
 * Usage:
 *   public async createStock(req: CreateStockRequest, res: Response) {
 *     const { label } = req.body; // TypeScript knows body is CreateStockBody
 *   }
 */

export type CreateStockRequest = AuthenticatedRequest<ParamsDictionary, unknown, CreateStockBody>;

export type AddItemToStockRequest = AuthenticatedRequest<StockParams, unknown, AddItemToStockBody>;

export type UpdateItemQuantityRequest = AuthenticatedRequest<
  StockItemParams,
  unknown,
  UpdateItemQuantityBody
>;
