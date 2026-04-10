import express from 'express';
import { StockPredictionService } from '@domain/prediction/services/StockPredictionService';
import { IItemHistoryRepository } from '@domain/prediction/repositories/IItemHistoryRepository';
import { IPredictionRepository } from '@domain/prediction/repositories/IPredictionRepository';
import { HTTP_CODE_OK } from '@utils/httpCodes';
import { CustomError, sendError } from '@api/errors';
import { rootController } from '@utils/logger';
import { rootException } from '@utils/cloudLogger';

const logger = rootController.getChildCategory('predictionController');

export class StockPredictionController {
  constructor(
    private readonly predictionService: StockPredictionService,
    private readonly historyRepository: IItemHistoryRepository,
    private readonly predictionRepository: IPredictionRepository
  ) {}

  public async getItemHistory(req: express.Request, res: express.Response): Promise<void> {
    try {
      const itemId = Number(req.params.itemId);
      const days = Number(req.query['days'] ?? 90);

      const history = await this.historyRepository.getHistory(itemId, days);

      logger.info(`getItemHistory itemId=${itemId} days=${days} records=${history.length}`);

      res.status(HTTP_CODE_OK).json(history);
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  public async getItemPrediction(req: express.Request, res: express.Response): Promise<void> {
    try {
      const itemId = Number(req.params.itemId);
      const currentQuantity = Number(req.query['quantity'] ?? 0);
      const minimumStock = Number(req.query['minimumStock'] ?? 1);

      const existing = await this.predictionRepository.getLatest(itemId);
      const prediction =
        existing ??
        (await this.predictionService.computeAndSave(itemId, currentQuantity, minimumStock));

      logger.info(
        `getItemPrediction itemId=${itemId} simulatedFallback=${prediction.simulatedFallback} cached=${existing !== null}`
      );

      res.status(HTTP_CODE_OK).json(prediction);
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }
}
