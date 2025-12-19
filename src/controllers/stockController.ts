import express from 'express';
import { StockService } from '@services/stockService';
import {
  BadRequestError,
  CustomError,
  ErrorMessages,
  sendError,
  ValidationError,
} from '@core/errors';
import { WriteStockRepository } from '@repositories/writeStockRepository';
import { ReadStockRepository } from '@repositories/readStockRepository';
import { HTTP_CODE_CREATED, HTTP_CODE_OK } from '@utils/httpCodes';
import { UserService } from '@services/userService';
import { ReadUserRepository } from '@services/readUserRepository';
import { WriteUserRepository } from '@services/writeUserRepository';
import { rootException } from '@utils/cloudLogger';

export class StockController {
  private stockService: StockService;
  private userService: UserService;

  constructor(
    readStock: ReadStockRepository,
    writeStock: WriteStockRepository,
    readUser: ReadUserRepository,
    writeUser: WriteUserRepository
  ) {
    this.stockService = new StockService(readStock, writeStock);
    this.userService = new UserService(readUser, writeUser);
  }

  public async getAllStocks(req: express.Request, res: express.Response) {
    try {
      const OID = req.userID || '';

      const userID = await this.userService.convertOIDtoUserID(OID);
      const stocks = await this.stockService.getAllStocks(userID.value);

      console.info('getAllStocks {OID} - {stocks.length}', OID, stocks.length);

      res.status(HTTP_CODE_OK).json(stocks);
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  async createStock(req: express.Request, res: express.Response) {
    try {
      const OID = req.userID || '';
      const userID = await this.userService.convertOIDtoUserID(OID);
      const { LABEL, DESCRIPTION } = req.body;

      console.info('createStock {OID} - {LABEL} - {DESCRIPTION} ...', OID, LABEL, DESCRIPTION);

      if (!LABEL || !DESCRIPTION) {
        return sendError(
          res,
          new BadRequestError(
            'LABEL and DESCRIPTION are required to create a stock.',
            ErrorMessages.CreateStock
          )
        );
      }
      await this.stockService.createStock({ LABEL, DESCRIPTION }, userID.value);

      console.info('createStock {OID} - {LABEL} - {DESCRIPTION} DONE!', OID, LABEL, DESCRIPTION);

      res.status(HTTP_CODE_CREATED).json({ message: 'Stock created successfully.' });
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  async getStockDetails(req: express.Request, res: express.Response) {
    try {
      const OID = req.userID || '';
      const userID = await this.userService.convertOIDtoUserID(OID);
      const ID = Number(req.params.ID);
      const stock = await this.stockService.getStockDetails(ID, userID.value);
      res.status(HTTP_CODE_OK).json(stock);
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  async getStockItems(req: express.Request, res: express.Response) {
    try {
      const ID = Number(req.params.ID);
      const items = await this.stockService.getStockItems(ID);
      res.status(HTTP_CODE_OK).json(items);
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  async updateStockItemQuantity(req: express.Request, res: express.Response) {
    try {
      const itemID = Number(req.params.itemID);
      const stockID = Number(req.params.stockID);
      const { QUANTITY } = req.body;

      if (!itemID || QUANTITY === undefined) {
        return sendError(
          res,
          new ValidationError(
            'ID and QUANTITY must be provided.',
            ErrorMessages.UpdateStockItemQuantity
          )
        );
      }

      await this.stockService.updateStockItemQuantity(itemID, QUANTITY, stockID);
      res.status(HTTP_CODE_OK).json({ message: 'Stock updated successfully.' });
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  async addStockItem(req: express.Request, res: express.Response) {
    try {
      const stockID = Number(req.params.stockID);
      const item = {
        label: req.body['LABEL'],
        description: req.body['DESCRIPTION'],
        quantity: req.body['QUANTITY'],
        minimumStock: req.body['MINIMUM_STOCK'],
      };
      await this.stockService.addStockItem(item, stockID);
      res.status(HTTP_CODE_CREATED).json({ message: 'Stock item added successfully.' });
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  async deleteStockItem(req: express.Request, res: express.Response) {
    try {
      const stockID = Number(req.params.stockID);
      const itemID = Number(req.params.itemID);
      await this.stockService.deleteStockItem(stockID, itemID);
      res.status(HTTP_CODE_OK).json({ message: 'Stock item deleted successfully.' });
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  async deleteStock(req: express.Request, res: express.Response) {
    try {
      const OID = req.userID || '';
      const userID = await this.userService.convertOIDtoUserID(OID);
      const stockID = Number(req.params.stockID);
      await this.stockService.deleteStock(stockID, userID.value);
      res.status(HTTP_CODE_OK).json({ message: 'Stock deleted successfully.' });
    } catch (err: unknown) {
      console.error('Error in deleteStock:', err);
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  async getAllItems(req: express.Request, res: express.Response) {
    try {
      const OID = req.userID || '';
      const userID = await this.userService.convertOIDtoUserID(OID);
      const items = await this.stockService.getAllItems(userID.value);
      res.status(HTTP_CODE_OK).json(items);
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  async getItemDetails(req: express.Request, res: express.Response) {
    try {
      const itemID = Number(req.params.itemID);
      const item = await this.stockService.getItemDetails(itemID);
      res.status(HTTP_CODE_OK).json(item);
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  async getLowStockItems(req: express.Request, res: express.Response) {
    try {
      const OID = req.userID || '';
      const userID = await this.userService.convertOIDtoUserID(OID);
      if (!userID) {
        return res.status(400).json({ error: 'User ID is missing' });
      }
      const items = await this.stockService.getLowStockItems(userID.value);
      res.status(HTTP_CODE_OK).json(items);
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }
}
