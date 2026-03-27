import { PrismaClient } from '@prisma/client';
import {
  IPredictionRepository,
  PredictionResult,
} from '@domain/prediction/repositories/IPredictionRepository';

export class PrismaStockPredictionRepository implements IPredictionRepository {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async save(prediction: Omit<PredictionResult, 'generatedAt'>): Promise<PredictionResult> {
    const saved = await this.prisma.stockPrediction.create({
      data: {
        itemId: prediction.itemId,
        daysUntilEmpty: prediction.daysUntilEmpty,
        avgDailyConsumption: prediction.avgDailyConsumption,
        trend: prediction.trend,
        recommendedRestock: prediction.recommendedRestock,
        simulatedFallback: prediction.simulatedFallback,
      },
    });

    return {
      itemId: saved.itemId,
      daysUntilEmpty: saved.daysUntilEmpty,
      avgDailyConsumption: saved.avgDailyConsumption,
      trend: saved.trend as PredictionResult['trend'],
      recommendedRestock: saved.recommendedRestock,
      simulatedFallback: saved.simulatedFallback,
      generatedAt: saved.generatedAt,
    };
  }

  async getLatest(itemId: number): Promise<PredictionResult | null> {
    const record = await this.prisma.stockPrediction.findFirst({
      where: { itemId },
      orderBy: { generatedAt: 'desc' },
    });

    if (!record) return null;

    return {
      itemId: record.itemId,
      daysUntilEmpty: record.daysUntilEmpty,
      avgDailyConsumption: record.avgDailyConsumption,
      trend: record.trend as PredictionResult['trend'],
      recommendedRestock: record.recommendedRestock,
      simulatedFallback: record.simulatedFallback,
      generatedAt: record.generatedAt,
    };
  }
}
