import { IItemHistoryRepository } from '@domain/prediction/repositories/IItemHistoryRepository';
import {
  IPredictionRepository,
  PredictionResult,
} from '@domain/prediction/repositories/IPredictionRepository';

const MIN_HISTORY_DAYS = 7;
const DEFAULT_HISTORY_DAYS = 90;
const TREND_THRESHOLD_PERCENT = 10;

export class StockPredictionService {
  constructor(
    private readonly historyRepository: IItemHistoryRepository,
    private readonly predictionRepository: IPredictionRepository
  ) {}

  async hasSufficientHistory(itemId: number, minDays = MIN_HISTORY_DAYS): Promise<boolean> {
    const history = await this.historyRepository.getHistory(itemId, minDays);
    const consumptions = history.filter(h => h.changeType === 'CONSUMPTION');
    return consumptions.length >= minDays;
  }

  async avgDailyConsumption(itemId: number, days = DEFAULT_HISTORY_DAYS): Promise<number | null> {
    const history = await this.historyRepository.getHistory(itemId, days);
    const consumptions = history.filter(h => h.changeType === 'CONSUMPTION');
    if (consumptions.length === 0) return null;

    const total = consumptions.reduce((sum, h) => sum + (h.oldQuantity - h.newQuantity), 0);
    return total / days;
  }

  async daysUntilEmpty(itemId: number, currentQuantity: number): Promise<number | null> {
    const avg = await this.avgDailyConsumption(itemId);
    if (avg === null || avg <= 0) return null;
    return Math.floor(currentQuantity / avg);
  }

  async detectTrend(itemId: number): Promise<'STABLE' | 'INCREASING' | 'DECREASING'> {
    const history = await this.historyRepository.getHistory(itemId, DEFAULT_HISTORY_DAYS);
    const consumptions = history
      .filter(h => h.changeType === 'CONSUMPTION')
      .sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime());

    if (consumptions.length < MIN_HISTORY_DAYS * 2) return 'STABLE';

    const mid = Math.floor(consumptions.length / 2);
    const firstHalf = consumptions.slice(0, mid);
    const secondHalf = consumptions.slice(mid);

    const avgFirst =
      firstHalf.reduce((sum, h) => sum + (h.oldQuantity - h.newQuantity), 0) / firstHalf.length;
    const avgSecond =
      secondHalf.reduce((sum, h) => sum + (h.oldQuantity - h.newQuantity), 0) / secondHalf.length;

    if (avgFirst === 0) return 'STABLE';
    const delta = ((avgSecond - avgFirst) / avgFirst) * 100;

    if (delta > TREND_THRESHOLD_PERCENT) return 'INCREASING';
    if (delta < -TREND_THRESHOLD_PERCENT) return 'DECREASING';
    return 'STABLE';
  }

  async recommendedRestockQuantity(itemId: number, minimumStock: number): Promise<number | null> {
    const avg = await this.avgDailyConsumption(itemId);
    if (avg === null) return null;
    // Viser 30 jours d'autonomie au-dessus du stock minimum
    return Math.ceil(avg * 30 + minimumStock);
  }

  async computeAndSave(
    itemId: number,
    currentQuantity: number,
    minimumStock: number
  ): Promise<PredictionResult> {
    const sufficient = await this.hasSufficientHistory(itemId);

    if (!sufficient) {
      return this.predictionRepository.save({
        itemId,
        daysUntilEmpty: null,
        avgDailyConsumption: null,
        trend: 'STABLE',
        recommendedRestock: null,
        simulatedFallback: true,
      });
    }

    const [daysUntilEmpty, avgDailyConsumption, trend, recommendedRestock] = await Promise.all([
      this.daysUntilEmpty(itemId, currentQuantity),
      this.avgDailyConsumption(itemId),
      this.detectTrend(itemId),
      this.recommendedRestockQuantity(itemId, minimumStock),
    ]);

    return this.predictionRepository.save({
      itemId,
      daysUntilEmpty,
      avgDailyConsumption,
      trend,
      recommendedRestock,
      simulatedFallback: false,
    });
  }
}
