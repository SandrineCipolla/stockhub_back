import express from 'express';
import { AuthenticatedRequest } from '@api/types/AuthenticatedRequest';
import { AISuggestion, IAIService } from '@domain/ai/IAIService';
import { IPredictionRepository } from '@domain/prediction/repositories/IPredictionRepository';
import { IStockVisualizationRepository } from '@domain/stock-management/visualization/queries/IStockVisualizationRepository';
import { UserService } from '@services/userService';
import { HTTP_CODE_OK } from '@utils/httpCodes';
import { CustomError, sendError } from '@core/errors';
import { rootController } from '@utils/logger';
import { rootException } from '@utils/cloudLogger';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const logger = rootController.getChildCategory('suggestionsController');

export class StockSuggestionsController {
  constructor(
    private readonly visualizationRepository: IStockVisualizationRepository,
    private readonly predictionRepository: IPredictionRepository,
    private readonly aiService: IAIService,
    private readonly userService: UserService
  ) {}

  private validateOID(OID: string, res: express.Response): boolean {
    if (!OID || OID.trim() === '') {
      res.status(401).json({ error: 'User not authenticated' });
      return false;
    }
    return true;
  }

  public async getStockSuggestions(
    req: AuthenticatedRequest,
    res: express.Response
  ): Promise<void> {
    try {
      const OID = req.userID || '';

      if (!this.validateOID(OID, res)) {
        return;
      }

      const stockId = Number(req.params.stockId);

      if (isNaN(stockId)) {
        res.status(400).json({ error: 'Invalid stockId parameter' });
        return;
      }

      const userIdentifier = await this.userService.convertOIDtoUserID(OID);
      const items = await this.visualizationRepository.getStockItems(stockId, userIdentifier.value);

      if (items.length === 0) {
        res.status(404).json({ error: 'Stock not found or has no items' });
        return;
      }

      const predictions = await Promise.all(
        items.map(async item => ({
          item,
          prediction: await this.predictionRepository.getLatest(item.id),
          cached: await this.predictionRepository.getCachedAISuggestions(item.id),
        }))
      );

      const now = Date.now();
      const allFresh = predictions.every(
        ({ cached }) => cached && now - cached.generatedAt.getTime() < CACHE_TTL_MS
      );

      if (allFresh) {
        const cached = predictions.flatMap(({ cached: c }) => (c?.data ?? []) as AISuggestion[]);
        logger.info(
          `getStockSuggestions stockId=${stockId} — served from cache (${cached.length} suggestions)`
        );
        res.status(HTTP_CODE_OK).json(cached);
        return;
      }

      const contextItems = predictions.map(({ item, prediction }) => ({
        itemId: item.id,
        quantity: item.quantity,
        minimumStock: item.minimumStock,
        daysUntilEmpty: prediction?.daysUntilEmpty ?? 0,
        trend: prediction?.trend ?? 'STABLE',
        avgDailyConsumption: prediction?.avgDailyConsumption ?? 0,
        recommendedRestock: prediction?.recommendedRestock ?? 0,
      }));

      const suggestions = await this.aiService.generateSuggestions({ items: contextItems });

      await Promise.all(
        items.map(async item => {
          const itemSuggestions = suggestions.filter(s => s.itemId === item.id);
          await this.predictionRepository.saveAISuggestions(item.id, itemSuggestions);
        })
      );

      logger.info(
        `getStockSuggestions stockId=${stockId} items=${items.length} suggestions=${suggestions.length}`
      );

      res.status(HTTP_CODE_OK).json(suggestions);
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }
}
