import { Stock } from '@domain/stock-management/common/entities/Stock';
import { StockItem } from '@domain/stock-management/common/entities/StockItem';
import { IStockVisualizationRepository } from '@domain/stock-management/visualization/queries/IStockVisualizationRepository';

import { Item as PrismaItem, PrismaClient, Stock as PrismaStock } from '@prisma/client';
import { DependencyTelemetry, rootDependency, rootException } from '@utils/cloudLogger';

const DEPENDENCY_NAME = process.env.DB_DATABASE;
const DEPENDENCY_TARGET = process.env.DB_HOST;
const DEPENDENCY_TYPE = 'MySQL';

export class PrismaStockVisualizationRepository implements IStockVisualizationRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async getAllStocks(userId: number): Promise<Stock[]> {
    const stocks = await this.prisma.stock.findMany({
      where: { userId: userId },
    });
    return stocks.map(
      (stock: PrismaStock) =>
        new Stock(stock.id, stock.label, stock.description ?? '', stock.category)
    );
  }

  async getStockDetails(stockId: number, userId: number): Promise<Stock | null> {
    const stock = await this.prisma.stock.findFirst({
      where: { id: stockId, userId: userId },
    });
    if (!stock) {
      return null;
    }
    return new Stock(stock.id, stock.label, stock.description ?? '', stock.category);
  }

  async getStockItems(stockId: number, userId: number): Promise<StockItem[]> {
    const success = false;

    try {
      const stock = await this.prisma.stock.findFirst({
        where: { id: stockId, userId: userId },
      });
      if (!stock) {
        throw new Error('Stock not found or access denied');
      }

      const items = await this.prisma.item.findMany({
        where: { stockId: stockId },
      });
      return items.map(
        (item: PrismaItem) =>
          new StockItem(
            item.id,
            item.label ?? '',
            item.quantity ?? 0,
            item.description ?? '',
            item.minimumStock,
            item.stockId ?? stockId
          )
      );
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      rootDependency({
        name: DEPENDENCY_NAME,
        data: `prisma.stock.findFirst({ where: {id: ${stockId}, userId: ${userId}}}) and prisma.item.findMany({ where: {stockId: ${stockId}}})`,
        duration: 0,
        success: success,
        resultCode: 0,
        target: DEPENDENCY_TARGET,
        dependencyTypeName: DEPENDENCY_TYPE,
      } as DependencyTelemetry);
    }
  }
}
