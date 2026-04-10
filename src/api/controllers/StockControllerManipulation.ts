import express from 'express';
import { AuthenticatedRequest } from '@api/types/AuthenticatedRequest';
import {
  AddItemToStockRequest,
  CreateStockRequest,
  DeleteItemRequest,
  DeleteStockRequest,
  UpdateItemBody,
  UpdateItemQuantityRequest,
  UpdateItemRequest,
  UpdateStockRequest,
} from '@api/types/StockRequestTypes';
import { UserService } from '@domain/user/services/UserService';
import { CreateStockCommandHandler } from '@domain/stock-management/manipulation/use-cases/CreateStockCommandHandler';
import { AddItemToStockCommandHandler } from '@domain/stock-management/manipulation/use-cases/AddItemToStockCommandHandler';
import { UpdateItemCommandHandler } from '@domain/stock-management/manipulation/use-cases/UpdateItemCommandHandler';
import { UpdateItemQuantityCommandHandler } from '@domain/stock-management/manipulation/use-cases/UpdateItemQuantityCommandHandler';
import { UpdateStockCommandHandler } from '@domain/stock-management/manipulation/use-cases/UpdateStockCommandHandler';
import { DeleteStockCommandHandler } from '@domain/stock-management/manipulation/use-cases/DeleteStockCommandHandler';
import { CreateStockCommand } from '@domain/stock-management/manipulation/commands/CreateStockCommand';
import { AddItemToStockCommand } from '@domain/stock-management/manipulation/commands/AddItemToStockCommand';
import { UpdateItemCommand } from '@domain/stock-management/manipulation/commands/UpdateItemCommand';
import { UpdateItemQuantityCommand } from '@domain/stock-management/manipulation/commands/UpdateItemQuantityCommand';
import { UpdateStockCommand } from '@domain/stock-management/manipulation/commands/UpdateStockCommand';
import { DeleteStockCommand } from '@domain/stock-management/manipulation/commands/DeleteStockCommand';
import { DeleteItemCommand } from '@domain/stock-management/manipulation/commands/DeleteItemCommand';
import { DeleteItemCommandHandler } from '@domain/stock-management/manipulation/use-cases/DeleteItemCommandHandler';
import { HTTP_CODE_CREATED, HTTP_CODE_OK } from '@utils/httpCodes';
import { CustomError, sendError } from '@api/errors';
import { rootMain } from '@utils/logger';
import { rootException } from '@utils/cloudLogger';

export class StockControllerManipulation {
  constructor(
    private readonly createStockHandler: CreateStockCommandHandler,
    private readonly addItemHandler: AddItemToStockCommandHandler,
    private readonly updateQuantityHandler: UpdateItemQuantityCommandHandler,
    private readonly updateItemHandler: UpdateItemCommandHandler,
    private readonly updateStockHandler: UpdateStockCommandHandler,
    private readonly deleteStockHandler: DeleteStockCommandHandler,
    private readonly deleteItemHandler: DeleteItemCommandHandler,
    private readonly userService: UserService
  ) {}

  /**
   * Récupère et valide l'OID (Object Identifier) de l'utilisateur connecté.
   *
   * L'OID est l'identifiant unique Azure AD B2C extrait du token Bearer par le middleware
   * d'authentification et attaché à `req.userID`. Il sert à deux fins :
   *   1. Valider que l'utilisateur est bien authentifié (retourne null + 401 si absent)
   *   2. Tracer l'action dans les logs (OID = qui a effectué l'opération)
   *
   * Note : pour createStock, l'OID est converti en userID interne via UserService.
   * Pour updateStock/deleteStock, l'autorisation sur la ressource est déjà vérifiée
   * par authorizeMiddleware en amont — l'OID n'est utilisé qu'à des fins de traçabilité.
   */
  private getValidatedOID(req: AuthenticatedRequest, res: express.Response): string | null {
    const OID = req.userID;
    if (!OID || OID.trim() === '') {
      res.status(401).json({ error: 'User not authenticated' });
      return null;
    }
    return OID;
  }

  public async createStock(req: CreateStockRequest, res: express.Response) {
    try {
      const OID = this.getValidatedOID(req, res);
      if (!OID) return;

      const userID = await this.userService.convertOIDtoUserID(OID);
      const { label, description, category } = req.body;

      const command = new CreateStockCommand(label, description, category, userID.value);

      const stock = await this.createStockHandler.handle(command);

      const labelValue = typeof stock.label === 'string' ? stock.label : stock.label.getValue();
      rootMain.info(`createStock OID=${OID} stockId=${stock.id} label=${labelValue}`);

      res.status(HTTP_CODE_CREATED).json(stock);
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  public async addItemToStock(req: AddItemToStockRequest, res: express.Response) {
    try {
      const OID = this.getValidatedOID(req, res);
      if (!OID) return;

      const stockId = Number(req.params.stockId);
      const { label, quantity, description, minimumStock } = req.body;

      const command = new AddItemToStockCommand(
        stockId,
        label,
        quantity,
        description,
        minimumStock,
        OID
      );

      const stock = await this.addItemHandler.handle(command);

      rootMain.info(`addItemToStock OID=${OID} stockId=${stockId} itemLabel=${label}`);

      res.status(HTTP_CODE_CREATED).json(stock);
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  public async updateItemQuantity(req: UpdateItemQuantityRequest, res: express.Response) {
    try {
      const OID = this.getValidatedOID(req, res);
      if (!OID) return;

      const stockId = Number(req.params.stockId);
      const itemId = Number(req.params.itemId);
      const { quantity } = req.body;

      const command = new UpdateItemQuantityCommand(stockId, itemId, quantity, OID);

      const stock = await this.updateQuantityHandler.handle(command);

      rootMain.info(
        `updateItemQuantity OID=${OID} stockId=${stockId} itemId=${itemId} newQuantity=${quantity}`
      );

      res.status(HTTP_CODE_OK).json(stock);
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  public async updateItem(req: UpdateItemRequest, res: express.Response) {
    try {
      const OID = this.getValidatedOID(req, res);
      if (!OID) return;

      const stockId = Number(req.params.stockId);
      const itemId = Number(req.params.itemId);
      const { label, description, minimumStock, quantity } = req.body as UpdateItemBody;

      const command = new UpdateItemCommand(
        stockId,
        itemId,
        label,
        description,
        minimumStock,
        quantity,
        OID
      );

      const stock = await this.updateItemHandler.handle(command);

      rootMain.info(`updateItem OID=${OID} stockId=${stockId} itemId=${itemId}`);

      res.status(HTTP_CODE_OK).json(stock);
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  public async updateStock(req: UpdateStockRequest, res: express.Response) {
    try {
      const OID = this.getValidatedOID(req, res);
      if (!OID) return;

      const stockId = Number(req.params.stockId);
      const { label, description, category } = req.body;

      const command = new UpdateStockCommand(stockId, label, description, category);

      const stock = await this.updateStockHandler.handle(command);

      rootMain.info(`updateStock OID=${OID} stockId=${stockId}`);

      res.status(HTTP_CODE_OK).json(stock);
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  public async deleteItem(req: DeleteItemRequest, res: express.Response) {
    try {
      const OID = this.getValidatedOID(req, res);
      if (!OID) return;

      const stockId = Number(req.params.stockId);
      const itemId = Number(req.params.itemId);

      const command = new DeleteItemCommand(stockId, itemId);

      await this.deleteItemHandler.handle(command);

      rootMain.info(`deleteItem OID=${OID} stockId=${stockId} itemId=${itemId}`);

      res.status(204).send();
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  public async deleteStock(req: DeleteStockRequest, res: express.Response) {
    try {
      const OID = this.getValidatedOID(req, res);
      if (!OID) return;

      const stockId = Number(req.params.stockId);

      const command = new DeleteStockCommand(stockId);

      await this.deleteStockHandler.handle(command);

      rootMain.info(`deleteStock OID=${OID} stockId=${stockId}`);

      res.status(204).send();
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }
}
