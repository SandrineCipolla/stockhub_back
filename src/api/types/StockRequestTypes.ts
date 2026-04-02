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

export interface UpdateItemBody {
  label?: string;
  description?: string;
  minimumStock?: number;
  quantity?: number;
}

export interface UpdateStockBody {
  label?: string;
  description?: string;
  category?: string;
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

export type UpdateItemRequest = AuthenticatedRequest<StockItemParams, unknown, UpdateItemBody>;

export type UpdateStockRequest = AuthenticatedRequest<StockParams, unknown, UpdateStockBody>;

export type DeleteStockRequest = AuthenticatedRequest<StockParams, unknown, unknown>;

export type DeleteItemRequest = AuthenticatedRequest<StockItemParams, unknown, unknown>;

export interface CollaboratorParams extends ParamsDictionary {
  stockId: string;
  collaboratorId: string;
}

export interface AddCollaboratorBody {
  email: string;
  role: string;
}

export interface UpdateCollaboratorRoleBody {
  role: string;
}

export type AddCollaboratorRequest = AuthenticatedRequest<
  StockParams,
  unknown,
  AddCollaboratorBody
>;

export type UpdateCollaboratorRequest = AuthenticatedRequest<
  CollaboratorParams,
  unknown,
  UpdateCollaboratorRoleBody
>;

export type RemoveCollaboratorRequest = AuthenticatedRequest<CollaboratorParams, unknown, unknown>;
