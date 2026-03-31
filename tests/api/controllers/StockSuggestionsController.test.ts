import { StockSuggestionsController } from '@api/controllers/StockSuggestionsController';
import '@core/errors';
import { IAIService } from '@domain/ai/IAIService';
import { IPredictionRepository } from '@domain/prediction/repositories/IPredictionRepository';
import { StockPredictionService } from '@domain/prediction/services/StockPredictionService';
import { IStockVisualizationRepository } from '@domain/stock-management/visualization/queries/IStockVisualizationRepository';
import { UserService } from '@services/userService';
import { HTTP_CODE_OK } from '@utils/httpCodes';
import { Request, Response } from 'express';

jest.mock('@core/errors', () => ({ sendError: jest.fn() }));
jest.mock('@utils/logger', () => ({
  rootController: {
    getChildCategory: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn() }),
  },
}));
jest.mock('@utils/cloudLogger', () => ({ rootException: jest.fn() }));

const makeItem = (id: number, quantity = 1, minimumStock = 5) => ({
  id,
  label: `Item ${id}`,
  quantity,
  minimumStock,
  getStatus: (): 'optimal' | 'critical' | 'out-of-stock' =>
    quantity === 0 ? 'out-of-stock' : quantity <= minimumStock ? 'critical' : 'optimal',
});

const makePrediction = (itemId: number) => ({
  id: itemId,
  itemId,
  daysUntilEmpty: 14,
  avgDailyConsumption: 1,
  trend: 'STABLE' as const,
  recommendedRestock: 10,
  simulatedFallback: false,
  generatedAt: new Date(),
});

describe('StockSuggestionsController', () => {
  let controller: StockSuggestionsController;
  let req: Partial<Request>;
  let res: jest.Mocked<Response>;
  let mockVisualizationRepo: jest.Mocked<IStockVisualizationRepository>;
  let mockPredictionRepo: jest.Mocked<IPredictionRepository>;
  let mockAIService: jest.Mocked<IAIService>;
  let mockUserService: jest.Mocked<UserService>;
  let mockPredictionService: jest.Mocked<StockPredictionService>;

  beforeEach(() => {
    mockVisualizationRepo = {
      getAllStocks: jest.fn(),
      getStockDetails: jest.fn(),
      getStockItems: jest.fn(),
    } as unknown as jest.Mocked<IStockVisualizationRepository>;

    mockPredictionRepo = {
      getLatest: jest.fn(),
      save: jest.fn(),
      getCachedAISuggestions: jest.fn(),
      saveAISuggestions: jest.fn(),
    } as unknown as jest.Mocked<IPredictionRepository>;

    mockAIService = {
      generateSuggestions: jest.fn().mockResolvedValue([
        {
          itemId: 1,
          type: 'RESTOCK',
          priority: 'high',
          title: 'T',
          description: 'D',
          source: 'llm',
        },
      ]),
    };

    mockUserService = {
      convertOIDtoUserID: jest.fn().mockResolvedValue({ value: 42 }),
    } as unknown as jest.Mocked<UserService>;

    mockPredictionService = {
      computeAndSave: jest.fn().mockResolvedValue(makePrediction(1)),
    } as unknown as jest.Mocked<StockPredictionService>;

    controller = new StockSuggestionsController(
      mockVisualizationRepo,
      mockPredictionRepo,
      mockAIService,
      mockUserService,
      mockPredictionService
    );

    req = { userID: 'oid', params: { stockId: '1' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as jest.Mocked<Response>;
  });

  describe('getStockSuggestions', () => {
    describe('when all items have cached suggestions', () => {
      it('should return cached suggestions without calling AI', async () => {
        const item = makeItem(1);
        const cachedSuggestion = {
          data: [
            {
              itemId: 1,
              type: 'RESTOCK',
              priority: 'high',
              title: 'T',
              description: 'D',
              source: 'llm',
            },
          ],
          generatedAt: new Date(),
        };

        mockVisualizationRepo.getStockItems.mockResolvedValue([item] as any);
        mockPredictionRepo.getLatest.mockResolvedValue(makePrediction(1));
        mockPredictionRepo.getCachedAISuggestions.mockResolvedValue(cachedSuggestion);

        await controller.getStockSuggestions(req as any, res);

        expect(mockAIService.generateSuggestions).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
      });
    });

    describe('when an item has no existing prediction', () => {
      it('should call computeAndSave for that item', async () => {
        const item = makeItem(1);

        mockVisualizationRepo.getStockItems.mockResolvedValue([item] as any);
        mockPredictionRepo.getLatest.mockResolvedValue(null);
        mockPredictionRepo.getCachedAISuggestions.mockResolvedValue(null);
        mockPredictionRepo.saveAISuggestions.mockResolvedValue();

        await controller.getStockSuggestions(req as any, res);

        expect(mockPredictionService.computeAndSave).toHaveBeenCalledWith(1, 1, 5);
        expect(mockAIService.generateSuggestions).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
      });
    });

    describe('when all items are optimal', () => {
      it('should return empty suggestions without calling AI', async () => {
        const item = makeItem(1, 10, 2); // qty=10, min=2 → optimal

        mockVisualizationRepo.getStockItems.mockResolvedValue([item] as any);

        await controller.getStockSuggestions(req as any, res);

        expect(mockAIService.generateSuggestions).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith([]);
      });
    });

    describe('when stock has no items', () => {
      it('should return 404', async () => {
        mockVisualizationRepo.getStockItems.mockResolvedValue([]);

        await controller.getStockSuggestions(req as any, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe('when stockId is invalid', () => {
      it('should return 400', async () => {
        req = { userID: 'oid', params: { stockId: 'abc' } };

        await controller.getStockSuggestions(req as any, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });
    });
  });
});
