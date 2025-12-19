import { StockVisualizationService } from '@domain/stock-management/visualization/services/StockVisualizationService';
import { UserService } from '@services/userService';
import { HTTP_CODE_OK } from '@utils/httpCodes';
import { CustomError, sendError } from '@core/errors';
import express from 'express';
import { rootMain } from '@utils/logger';
import { rootException } from '@utils/cloudLogger';

export class StockControllerVisualization {
  constructor(
    private readonly stockVisualizationService: StockVisualizationService,
    private readonly userService: UserService
  ) {}

  private validateOID(OID: string, res: express.Response): boolean {
    if (!OID || OID.trim() === '') {
      res.status(401).json({ error: 'User not authenticated' });
      return false;
    }
    return true;
  }

  public async getAllStocks(req: express.Request, res: express.Response) {
    try {
      const OID = req.userID || '';

      if (!this.validateOID(OID, res)) {
        return;
      }

      const userID = await this.userService.convertOIDtoUserID(OID);
      const stocks = await this.stockVisualizationService.getAllStocks(userID.value);

      rootMain.info(`getAllStocks OID=${OID} stocksLength=${stocks.length}`);

      res.status(HTTP_CODE_OK).json(stocks);
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  public async getStockDetails(req: express.Request, res: express.Response) {
    try {
      const OID = req.userID || '';

      if (!this.validateOID(OID, res)) {
        return;
      }

      const userID = await this.userService.convertOIDtoUserID(OID);
      const stockId = Number(req.params.stockId);
      const stock = await this.stockVisualizationService.getStockDetails(stockId, userID.value);

      rootMain.info(`getStockDetails OID=${OID} stockId=${stockId}`);
      res.status(HTTP_CODE_OK).json([stock]);
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  public async getStockItems(req: express.Request, res: express.Response) {
    try {
      const OID = req.userID || '';

      if (!this.validateOID(OID, res)) {
        return;
      }

      const userID = await this.userService.convertOIDtoUserID(OID);
      const stockId = Number(req.params.stockId);
      const items = await this.stockVisualizationService.getStockItems(stockId, userID.value);

      rootMain.info(`getStockItems OID=${OID} stockId=${stockId} itemsLength=${items.length}`);
      res.status(HTTP_CODE_OK).json(items);
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }
}
