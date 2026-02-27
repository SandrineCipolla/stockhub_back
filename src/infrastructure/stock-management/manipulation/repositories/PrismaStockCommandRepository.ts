import { Item as PrismaItem, PrismaClient, StockCategory } from '@prisma/client';
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
      const createdStock = await this.prisma.stock.create({
        data: {
          label: stock.getLabelValue(),
          description: stock.getDescriptionValue(),
          category: this.normalizeCategory(stock.category),
          userId: userId,
          items: {
            create: stock.items.map(item => ({
              label: item.LABEL,
              description: item.DESCRIPTION,
              quantity: item.QUANTITY,
              minimumStock: item.minimumStock,
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
        data: `prisma.stock.create({ label: ${stock.getLabelValue()}, userId: ${userId}, items: ${stock.items.length} })`,
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
      const stock = await this.prisma.stock.findUnique({
        where: { id: stockId },
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
        data: `prisma.stock.findUnique({ where: {id: ${stockId}} })`,
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

      await this.prisma.item.create({
        data: {
          label: item.label,
          description: item.description || '',
          quantity: item.quantity,
          minimumStock: item.minimumStock || 1,
          stockId: stockId,
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
        data: `prisma.item.create({ label: ${item.label}, stockId: ${stockId} })`,
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

      await this.prisma.item.update({
        where: { id: itemId },
        data: { quantity: newQuantity },
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
        data: `prisma.item.update({ where: {id: ${itemId}}, data: {quantity: ${newQuantity}} })`,
        duration: 0,
        success: success,
        resultCode: 0,
        target: DEPENDENCY_TARGET,
        dependencyTypeName: DEPENDENCY_TYPE,
      } as DependencyTelemetry);
    }
  }

  async updateStock(
    stockId: number,
    data: {
      label?: string;
      description?: string;
      category?: string;
    }
  ): Promise<Stock> {
    let success = false;

    try {
      const stock = await this.findById(stockId);
      if (!stock) {
        throw new Error(`Stock with ID ${stockId} not found`);
      }

      const updateData: {
        label?: string;
        description?: string;
        category?: StockCategory;
      } = {};

      if (data.label !== undefined) {
        updateData.label = data.label;
      }

      if (data.description !== undefined) {
        updateData.description = data.description;
      }

      if (data.category !== undefined) {
        updateData.category = this.normalizeCategory(data.category);
      }

      await this.prisma.stock.update({
        where: { id: stockId },
        data: updateData,
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
        data: `prisma.stock.update({ where: {id: ${stockId}}, data: ${JSON.stringify(data)} })`,
        duration: 0,
        success: success,
        resultCode: 0,
        target: DEPENDENCY_TARGET,
        dependencyTypeName: DEPENDENCY_TYPE,
      } as DependencyTelemetry);
    }
  }

  async deleteStock(stockId: number): Promise<void> {
    let success = false;

    try {
      const stock = await this.findById(stockId);
      if (!stock) {
        throw new Error(`Stock with ID ${stockId} not found`);
      }

      // Items are deleted automatically via onDelete: Cascade
      await this.prisma.stock.delete({
        where: { id: stockId },
      });

      success = true;
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      rootDependency({
        name: DEPENDENCY_NAME,
        data: `prisma.stock.delete({ where: {id: ${stockId}} }) with cascade`,
        duration: 0,
        success: success,
        resultCode: 0,
        target: DEPENDENCY_TARGET,
        dependencyTypeName: DEPENDENCY_TYPE,
      } as DependencyTelemetry);
    }
  }

  private normalizeCategory(category: string | StockCategory): StockCategory {
    const lowerCategory = category.toLowerCase();
    const categoryValues = Object.values(StockCategory);

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
            item.id,
            item.label ?? '',
            item.quantity ?? 0,
            item.description ?? '',
            item.minimumStock,
            item.stockId ?? prismaStock.id
          )
      ) || [];

    return new Stock(
      prismaStock.id,
      prismaStock.label,
      prismaStock.description ?? '',
      prismaStock.category,
      items
    );
  }
}
