import { Stock } from '@domain/stock-management/common/entities/Stock';
import { StockItem } from '@domain/stock-management/common/entities/StockItem';
import {
  IStockVisualizationRepository,
  StockWithRole,
} from '@domain/stock-management/visualization/queries/IStockVisualizationRepository';

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

  async getAllStocks(userId: number): Promise<StockWithRole[]> {
    const [ownedStocks, collaboratedStocks] = await Promise.all([
      this.prisma.stock.findMany({
        where: { userId },
        include: { items: true },
      }),
      this.prisma.stock.findMany({
        where: { collaborators: { some: { userId } } },
        include: {
          items: true,
          collaborators: { where: { userId } },
        },
      }),
    ]);

    const toStockEntity = (stock: PrismaStock & { items: PrismaItem[] }): Stock =>
      new Stock(
        stock.id,
        stock.label,
        stock.description ?? '',
        stock.category,
        stock.items.map(
          item =>
            new StockItem(
              item.id,
              item.label ?? '',
              item.quantity ?? 0,
              item.description ?? '',
              item.minimumStock,
              item.stockId ?? stock.id
            )
        )
      );

    const owned: StockWithRole[] = ownedStocks.map(stock => ({
      stock: toStockEntity(stock),
      viewerRole: 'OWNER',
    }));

    type CollaboratedStock = PrismaStock & {
      items: PrismaItem[];
      collaborators: { role: string }[];
    };

    const collaborated: StockWithRole[] = collaboratedStocks.map((stock: CollaboratedStock) => ({
      stock: toStockEntity(stock),
      viewerRole: stock.collaborators[0]?.role ?? 'VIEWER',
    }));

    return [...owned, ...collaborated];
  }

  async getStockDetails(stockId: number, userId: number): Promise<Stock | null> {
    const stock = await this.prisma.stock.findFirst({
      where: { id: stockId, userId: userId },
      include: { items: true },
    });
    if (!stock) {
      return null;
    }
    return new Stock(
      stock.id,
      stock.label,
      stock.description ?? '',
      stock.category,
      stock.items.map(
        item =>
          new StockItem(
            item.id,
            item.label ?? '',
            item.quantity ?? 0,
            item.description ?? '',
            item.minimumStock,
            item.stockId ?? stock.id
          )
      )
    );
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
