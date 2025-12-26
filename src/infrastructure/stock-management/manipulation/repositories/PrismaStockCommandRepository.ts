import { items as PrismaItem, PrismaClient, stocks_CATEGORY } from '@prisma/client';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';
import { Stock } from '@domain/stock-management/common/entities/Stock';
import { StockItem } from '@domain/stock-management/common/entities/StockItem';
import { DependencyTelemetry, rootDependency, rootException } from '@utils/cloudLogger';
import { PrismaStockWithItems } from '../types/prisma';

const DEPENDENCY_NAME = process.env.DB_DATABASE;
const DEPENDENCY_TARGET = process.env.DB_HOST;
const DEPENDENCY_TYPE = 'MySQL';

export class PrismaStockCommandRepository implements IStockCommandRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async save(stock: Stock, userId: number): Promise<Stock> {
    let success = false;

    try {
      const createdStock = await this.prisma.stocks.create({
        data: {
          LABEL: stock.getLabelValue(),
          DESCRIPTION: stock.getDescriptionValue(),
          CATEGORY: this.normalizeCategory(stock.category),
          USER_ID: userId,
          items: {
            create: stock.items.map(item => ({
              LABEL: item.LABEL,
              DESCRIPTION: item.DESCRIPTION,
              QUANTITY: item.QUANTITY,
              MINIMUM_STOCK: item.minimumStock,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      success = true;
      return this.toDomain(createdStock);
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      rootDependency({
        name: DEPENDENCY_NAME,
        data: `prisma.stocks.create({ LABEL: ${stock.getLabelValue()}, USER_ID: ${userId}, items: ${stock.items.length} })`,
        duration: 0,
        success: success,
        resultCode: 0,
        target: DEPENDENCY_TARGET,
        dependencyTypeName: DEPENDENCY_TYPE,
      } as DependencyTelemetry);
    }
  }

  async findById(stockId: number): Promise<Stock | null> {
    let success = false;

    try {
      const stock = await this.prisma.stocks.findUnique({
        where: { ID: stockId },
        include: { items: true },
      });

      if (!stock) {
        return null;
      }

      success = true;
      return this.toDomain(stock);
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      rootDependency({
        name: DEPENDENCY_NAME,
        data: `prisma.stocks.findUnique({ where: {ID: ${stockId}} })`,
        duration: 0,
        success: success,
        resultCode: 0,
        target: DEPENDENCY_TARGET,
        dependencyTypeName: DEPENDENCY_TYPE,
      } as DependencyTelemetry);
    }
  }

  async addItemToStock(
    stockId: number,
    item: {
      label: string;
      quantity: number;
      description?: string;
      minimumStock?: number;
    }
  ): Promise<Stock> {
    let success = false;

    try {
      const stock = await this.findById(stockId);
      if (!stock) {
        throw new Error(`Stock with ID ${stockId} not found`);
      }

      stock.addItem({
        label: item.label,
        quantity: item.quantity,
        description: item.description,
        minimumStock: item.minimumStock,
      });

      await this.prisma.items.create({
        data: {
          LABEL: item.label,
          DESCRIPTION: item.description || '',
          QUANTITY: item.quantity,
          MINIMUM_STOCK: item.minimumStock || 1,
          STOCK_ID: stockId,
        },
      });

      success = true;

      const updatedStock = await this.findById(stockId);
      if (!updatedStock) {
        throw new Error(`Failed to retrieve updated stock with ID ${stockId}`);
      }
      return updatedStock;
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      rootDependency({
        name: DEPENDENCY_NAME,
        data: `prisma.items.create({ LABEL: ${item.label}, STOCK_ID: ${stockId} })`,
        duration: 0,
        success: success,
        resultCode: 0,
        target: DEPENDENCY_TARGET,
        dependencyTypeName: DEPENDENCY_TYPE,
      } as DependencyTelemetry);
    }
  }

  async updateItemQuantity(stockId: number, itemId: number, newQuantity: number): Promise<Stock> {
    let success = false;

    try {
      const stock = await this.findById(stockId);
      if (!stock) {
        throw new Error(`Stock with ID ${stockId} not found`);
      }

      stock.updateItemQuantity(itemId, newQuantity);

      await this.prisma.items.update({
        where: { ID: itemId },
        data: { QUANTITY: newQuantity },
      });

      success = true;

      const updatedStock = await this.findById(stockId);
      if (!updatedStock) {
        throw new Error(`Failed to retrieve updated stock with ID ${stockId}`);
      }
      return updatedStock;
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      rootDependency({
        name: DEPENDENCY_NAME,
        data: `prisma.items.update({ where: {ID: ${itemId}}, data: {QUANTITY: ${newQuantity}} })`,
        duration: 0,
        success: success,
        resultCode: 0,
        target: DEPENDENCY_TARGET,
        dependencyTypeName: DEPENDENCY_TYPE,
      } as DependencyTelemetry);
    }
  }

  private normalizeCategory(category: string | stocks_CATEGORY): stocks_CATEGORY {
    const lowerCategory = category.toLowerCase();
    const categoryValues = Object.values(stocks_CATEGORY);

    const matchedCategory = categoryValues.find(catValue => catValue === lowerCategory);

    if (matchedCategory) {
      return matchedCategory;
    }

    throw new Error(
      `Invalid category: ${category}. Valid categories: ${categoryValues.join(', ')}`
    );
  }

  private toDomain(prismaStock: PrismaStockWithItems): Stock {
    const items =
      prismaStock.items?.map(
        (item: PrismaItem) =>
          new StockItem(
            item.ID,
            item.LABEL ?? '',
            item.QUANTITY ?? 0,
            item.DESCRIPTION ?? '',
            item.MINIMUM_STOCK,
            item.STOCK_ID ?? prismaStock.ID
          )
      ) || [];

    return new Stock(
      prismaStock.ID,
      prismaStock.LABEL,
      prismaStock.DESCRIPTION ?? '',
      prismaStock.CATEGORY,
      items
    );
  }
}
