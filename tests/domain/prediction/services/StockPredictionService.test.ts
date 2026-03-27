import { StockPredictionService } from '@domain/prediction/services/StockPredictionService';
import {
  IItemHistoryRepository,
  ItemHistoryRecord,
} from '@domain/prediction/repositories/IItemHistoryRepository';
import { IPredictionRepository } from '@domain/prediction/repositories/IPredictionRepository';

const makeHistory = (
  records: {
    oldQty: number;
    newQty: number;
    changeType: ItemHistoryRecord['changeType'];
    daysAgo: number;
  }[]
): ItemHistoryRecord[] =>
  records.map((r, i) => {
    const date = new Date();
    date.setDate(date.getDate() - r.daysAgo);
    return {
      id: i + 1,
      itemId: 1,
      oldQuantity: r.oldQty,
      newQuantity: r.newQty,
      changeType: r.changeType,
      changedBy: null,
      changedAt: date,
    };
  });

const makePredictionRepo = (): IPredictionRepository => ({
  save: jest.fn().mockImplementation(p => Promise.resolve({ ...p, generatedAt: new Date() })),
  getLatest: jest.fn().mockResolvedValue(null),
  saveAISuggestions: jest.fn().mockResolvedValue(undefined),
  getCachedAISuggestions: jest.fn().mockResolvedValue(null),
});

describe('StockPredictionService', () => {
  describe('hasSufficientHistory()', () => {
    it('returns false when fewer consumption records than minDays', async () => {
      const history = makeHistory([
        { oldQty: 10, newQty: 8, changeType: 'CONSUMPTION', daysAgo: 3 },
        { oldQty: 8, newQty: 6, changeType: 'CONSUMPTION', daysAgo: 2 },
      ]);
      const historyRepo: IItemHistoryRepository = {
        record: jest.fn(),
        getHistory: jest.fn().mockResolvedValue(history),
      };

      const service = new StockPredictionService(historyRepo, makePredictionRepo());
      const result = await service.hasSufficientHistory(1, 7);

      expect(result).toBe(false);
    });

    it('returns true when enough consumption records', async () => {
      const history = makeHistory(
        Array.from({ length: 10 }, (_, i) => ({
          oldQty: 20 - i,
          newQty: 19 - i,
          changeType: 'CONSUMPTION' as const,
          daysAgo: 10 - i,
        }))
      );
      const historyRepo: IItemHistoryRepository = {
        record: jest.fn(),
        getHistory: jest.fn().mockResolvedValue(history),
      };

      const service = new StockPredictionService(historyRepo, makePredictionRepo());
      const result = await service.hasSufficientHistory(1, 7);

      expect(result).toBe(true);
    });
  });

  describe('avgDailyConsumption()', () => {
    it('returns null when no consumption records', async () => {
      const historyRepo: IItemHistoryRepository = {
        record: jest.fn(),
        getHistory: jest.fn().mockResolvedValue([]),
      };

      const service = new StockPredictionService(historyRepo, makePredictionRepo());
      const result = await service.avgDailyConsumption(1);

      expect(result).toBeNull();
    });

    it('returns correct average over 90 days', async () => {
      // 9 jours de consommation de 2 unités/jour
      const history = makeHistory(
        Array.from({ length: 9 }, (_, i) => ({
          oldQty: 20 - i * 2,
          newQty: 18 - i * 2,
          changeType: 'CONSUMPTION' as const,
          daysAgo: 9 - i,
        }))
      );
      const historyRepo: IItemHistoryRepository = {
        record: jest.fn(),
        getHistory: jest.fn().mockResolvedValue(history),
      };

      const service = new StockPredictionService(historyRepo, makePredictionRepo());
      // total = 9 * 2 = 18 / 90 jours = 0.2
      const result = await service.avgDailyConsumption(1, 90);

      expect(result).toBeCloseTo(0.2);
    });
  });

  describe('daysUntilEmpty()', () => {
    it('returns null when no consumption data', async () => {
      const historyRepo: IItemHistoryRepository = {
        record: jest.fn(),
        getHistory: jest.fn().mockResolvedValue([]),
      };

      const service = new StockPredictionService(historyRepo, makePredictionRepo());
      const result = await service.daysUntilEmpty(1, 10);

      expect(result).toBeNull();
    });

    it('returns correct days until empty', async () => {
      // consommation totale = 90 unités sur 90 jours = 1/jour
      const history = makeHistory(
        Array.from({ length: 90 }, (_, i) => ({
          oldQty: 100 - i,
          newQty: 99 - i,
          changeType: 'CONSUMPTION' as const,
          daysAgo: 90 - i,
        }))
      );
      const historyRepo: IItemHistoryRepository = {
        record: jest.fn(),
        getHistory: jest.fn().mockResolvedValue(history),
      };

      const service = new StockPredictionService(historyRepo, makePredictionRepo());
      // avg = 90/90 = 1 unité/jour, stock actuel = 15 → 15 jours
      const result = await service.daysUntilEmpty(1, 15);

      expect(result).toBe(15);
    });
  });

  describe('detectTrend()', () => {
    it('returns STABLE when not enough history', async () => {
      const historyRepo: IItemHistoryRepository = {
        record: jest.fn(),
        getHistory: jest.fn().mockResolvedValue([]),
      };

      const service = new StockPredictionService(historyRepo, makePredictionRepo());
      const result = await service.detectTrend(1);

      expect(result).toBe('STABLE');
    });

    it('returns INCREASING when consumption grows over time', async () => {
      // 1ère moitié : consomme 1/jour, 2ème moitié : consomme 5/jour
      const firstHalf = Array.from({ length: 14 }, (_, i) => ({
        oldQty: 100 - i,
        newQty: 99 - i,
        changeType: 'CONSUMPTION' as const,
        daysAgo: 28 - i,
      }));
      const secondHalf = Array.from({ length: 14 }, (_, i) => ({
        oldQty: 100 - i * 5,
        newQty: 95 - i * 5,
        changeType: 'CONSUMPTION' as const,
        daysAgo: 14 - i,
      }));
      const historyRepo: IItemHistoryRepository = {
        record: jest.fn(),
        getHistory: jest.fn().mockResolvedValue(makeHistory([...firstHalf, ...secondHalf])),
      };

      const service = new StockPredictionService(historyRepo, makePredictionRepo());
      const result = await service.detectTrend(1);

      expect(result).toBe('INCREASING');
    });

    it('returns DECREASING when consumption drops over time', async () => {
      // 1ère moitié : consomme 5/jour, 2ème moitié : consomme 1/jour
      const firstHalf = Array.from({ length: 14 }, (_, i) => ({
        oldQty: 200 - i * 5,
        newQty: 195 - i * 5,
        changeType: 'CONSUMPTION' as const,
        daysAgo: 28 - i,
      }));
      const secondHalf = Array.from({ length: 14 }, (_, i) => ({
        oldQty: 100 - i,
        newQty: 99 - i,
        changeType: 'CONSUMPTION' as const,
        daysAgo: 14 - i,
      }));
      const historyRepo: IItemHistoryRepository = {
        record: jest.fn(),
        getHistory: jest.fn().mockResolvedValue(makeHistory([...firstHalf, ...secondHalf])),
      };

      const service = new StockPredictionService(historyRepo, makePredictionRepo());
      const result = await service.detectTrend(1);

      expect(result).toBe('DECREASING');
    });
  });

  describe('computeAndSave()', () => {
    it('returns simulatedFallback=true when insufficient history', async () => {
      const historyRepo: IItemHistoryRepository = {
        record: jest.fn(),
        getHistory: jest.fn().mockResolvedValue([]),
      };
      const predictionRepo = makePredictionRepo();

      const service = new StockPredictionService(historyRepo, predictionRepo);
      const result = await service.computeAndSave(1, 10, 2);

      expect(result.simulatedFallback).toBe(true);
      expect(result.daysUntilEmpty).toBeNull();
      expect(predictionRepo.save).toHaveBeenCalledTimes(1);
    });

    it('returns full prediction when sufficient history', async () => {
      const history = makeHistory(
        Array.from({ length: 14 }, (_, i) => ({
          oldQty: 20 - i,
          newQty: 19 - i,
          changeType: 'CONSUMPTION' as const,
          daysAgo: 14 - i,
        }))
      );
      const historyRepo: IItemHistoryRepository = {
        record: jest.fn(),
        getHistory: jest.fn().mockResolvedValue(history),
      };
      const predictionRepo = makePredictionRepo();

      const service = new StockPredictionService(historyRepo, predictionRepo);
      const result = await service.computeAndSave(1, 10, 2);

      expect(result.simulatedFallback).toBe(false);
      expect(result.daysUntilEmpty).not.toBeNull();
      expect(predictionRepo.save).toHaveBeenCalledTimes(1);
    });
  });
});
