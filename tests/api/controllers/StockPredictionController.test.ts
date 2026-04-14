import { StockPredictionController } from '@api/controllers/StockPredictionController';
import { sendError } from '@api/errors';
import {
  IItemHistoryRepository,
  ItemHistoryRecord,
} from '@domain/prediction/repositories/IItemHistoryRepository';
import {
  IPredictionRepository,
  PredictionResult,
} from '@domain/prediction/repositories/IPredictionRepository';
import { StockPredictionService } from '@domain/prediction/services/StockPredictionService';
import { HTTP_CODE_OK } from '@utils/httpCodes';
import { Request, Response } from 'express';

jest.mock('@api/errors', () => ({ sendError: jest.fn() }));
jest.mock('@utils/cloudLogger', () => ({ rootException: jest.fn() }));

const makePrediction = (overrides: Partial<PredictionResult> = {}): PredictionResult => ({
  itemId: 1,
  daysUntilEmpty: 15,
  avgDailyConsumption: 2.5,
  trend: 'STABLE',
  recommendedRestock: 30,
  simulatedFallback: false,
  generatedAt: new Date('2026-04-10'),
  ...overrides,
});

const makeHistoryRecord = (overrides: Partial<ItemHistoryRecord> = {}): ItemHistoryRecord => ({
  id: 1,
  itemId: 1,
  oldQuantity: 10,
  newQuantity: 8,
  changeType: 'CONSUMPTION',
  changedBy: 'user@test.com',
  changedAt: new Date('2026-04-10'),
  ...overrides,
});

describe('StockPredictionController', () => {
  let controller: StockPredictionController;
  let req: Partial<Request>;
  let res: jest.Mocked<Response>;
  let mockHistoryRepository: jest.Mocked<IItemHistoryRepository>;
  let mockPredictionRepository: jest.Mocked<IPredictionRepository>;
  let mockPredictionService: jest.Mocked<StockPredictionService>;

  beforeEach(() => {
    mockHistoryRepository = {
      record: jest.fn(),
      getHistory: jest.fn(),
    };

    mockPredictionRepository = {
      save: jest.fn(),
      getLatest: jest.fn(),
      saveAISuggestions: jest.fn(),
      getCachedAISuggestions: jest.fn(),
    };

    mockPredictionService = {
      computeAndSave: jest.fn(),
      hasSufficientHistory: jest.fn(),
      avgDailyConsumption: jest.fn(),
      daysUntilEmpty: jest.fn(),
      detectTrend: jest.fn(),
      recommendedRestockQuantity: jest.fn(),
    } as unknown as jest.Mocked<StockPredictionService>;

    controller = new StockPredictionController(
      mockPredictionService,
      mockHistoryRepository,
      mockPredictionRepository
    );

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as jest.Mocked<Response>;

    jest.clearAllMocks();
  });

  describe('getItemHistory', () => {
    describe('nominal case', () => {
      it('should return 200 and the history records', async () => {
        const records = [makeHistoryRecord(), makeHistoryRecord({ id: 2, changeType: 'RESTOCK' })];
        mockHistoryRepository.getHistory.mockResolvedValue(records);

        req = { params: { itemId: '1' }, query: {} };

        await controller.getItemHistory(req as Request, res);

        expect(mockHistoryRepository.getHistory).toHaveBeenCalledWith(1, 90);
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith(records);
      });

      it('should use the days query parameter when provided', async () => {
        mockHistoryRepository.getHistory.mockResolvedValue([]);

        req = { params: { itemId: '5' }, query: { days: '30' } };

        await controller.getItemHistory(req as Request, res);

        expect(mockHistoryRepository.getHistory).toHaveBeenCalledWith(5, 30);
      });
    });

    describe('empty history', () => {
      it('should return 200 with an empty array when no records exist', async () => {
        mockHistoryRepository.getHistory.mockResolvedValue([]);

        req = { params: { itemId: '1' }, query: {} };

        await controller.getItemHistory(req as Request, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith([]);
      });
    });

    describe('invalid itemId', () => {
      it('should return 400 when itemId is not a number', async () => {
        req = { params: { itemId: 'abc' }, query: {} };

        await controller.getItemHistory(req as Request, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid itemId' });
        expect(mockHistoryRepository.getHistory).not.toHaveBeenCalled();
      });
    });

    describe('error case', () => {
      it('should call sendError when the repository throws', async () => {
        const error = new Error('DB connection failed');
        mockHistoryRepository.getHistory.mockRejectedValue(error);

        req = { params: { itemId: '1' }, query: {} };

        await controller.getItemHistory(req as Request, res);

        expect(sendError).toHaveBeenCalledWith(res, error);
      });
    });
  });

  describe('getItemPrediction', () => {
    describe('cached prediction', () => {
      it('should return 200 with the cached prediction without computing', async () => {
        const cached = makePrediction();
        mockPredictionRepository.getLatest.mockResolvedValue(cached);

        req = { params: { itemId: '1' }, query: {} };

        await controller.getItemPrediction(req as Request, res);

        expect(mockPredictionRepository.getLatest).toHaveBeenCalledWith(1);
        expect(mockPredictionService.computeAndSave).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith(cached);
      });
    });

    describe('no cached prediction', () => {
      it('should compute and return 200 when history is sufficient', async () => {
        const computed = makePrediction({ simulatedFallback: false });
        mockPredictionRepository.getLatest.mockResolvedValue(null);
        mockPredictionService.computeAndSave.mockResolvedValue(computed);

        req = {
          params: { itemId: '2' },
          query: { quantity: '10', minimumStock: '3' },
        };

        await controller.getItemPrediction(req as Request, res);

        expect(mockPredictionService.computeAndSave).toHaveBeenCalledWith(2, 10, 3);
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith(computed);
      });

      it('should use default quantity=0 and minimumStock=1 when not provided', async () => {
        const computed = makePrediction({ simulatedFallback: false });
        mockPredictionRepository.getLatest.mockResolvedValue(null);
        mockPredictionService.computeAndSave.mockResolvedValue(computed);

        req = { params: { itemId: '3' }, query: {} };

        await controller.getItemPrediction(req as Request, res);

        expect(mockPredictionService.computeAndSave).toHaveBeenCalledWith(3, 0, 1);
      });

      it('should return 404 when history is insufficient (simulatedFallback)', async () => {
        const fallback = makePrediction({ simulatedFallback: true });
        mockPredictionRepository.getLatest.mockResolvedValue(null);
        mockPredictionService.computeAndSave.mockResolvedValue(fallback);

        req = { params: { itemId: '4' }, query: {} };

        await controller.getItemPrediction(req as Request, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Insufficient history to compute a prediction for this item',
        });
      });
    });

    describe('cached prediction with simulatedFallback', () => {
      it('should return 404 when the cached prediction is a simulated fallback', async () => {
        const cached = makePrediction({ simulatedFallback: true });
        mockPredictionRepository.getLatest.mockResolvedValue(cached);

        req = { params: { itemId: '1' }, query: {} };

        await controller.getItemPrediction(req as Request, res);

        expect(mockPredictionService.computeAndSave).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe('invalid itemId', () => {
      it('should return 400 when itemId is not a number', async () => {
        req = { params: { itemId: 'abc' }, query: {} };

        await controller.getItemPrediction(req as Request, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid itemId' });
        expect(mockPredictionRepository.getLatest).not.toHaveBeenCalled();
      });
    });

    describe('error case', () => {
      it('should call sendError when the repository throws', async () => {
        const error = new Error('Prediction service unavailable');
        mockPredictionRepository.getLatest.mockRejectedValue(error);

        req = { params: { itemId: '1' }, query: {} };

        await controller.getItemPrediction(req as Request, res);

        expect(sendError).toHaveBeenCalledWith(res, error);
      });
    });
  });
});
