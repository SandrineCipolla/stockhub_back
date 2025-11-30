import {items as PrismaItem, PrismaClient} from "@prisma/client";
import {
    IStockCommandRepository
} from "../../../../domain/stock-management/manipulation/repositories/IStockCommandRepository";
import {Stock} from "../../../../domain/stock-management/common/entities/Stock";
import {StockItem} from "../../../../domain/stock-management/common/entities/StockItem";
import {DependencyTelemetry, rootDependency, rootException} from "../../../../Utils/cloudLogger";

const DEPENDENCY_NAME = process.env.DB_DATABASE;
const DEPENDENCY_TARGET = process.env.DB_HOST;
const DEPENDENCY_TYPE = "MySQL";

const prisma = new PrismaClient();

export class PrismaStockCommandRepository implements IStockCommandRepository {
    async save(stock: Stock, userId: number): Promise<Stock> {
        let success = false;

        try {
            const createdStock = await prisma.stocks.create({
                data: {
                    LABEL: stock.getLabelValue(),
                    DESCRIPTION: stock.getDescriptionValue(),
                    CATEGORY: stock.category as any,
                    USER_ID: userId
                },
                include: {
                    items: true
                }
            });

            success = true;
            return this.toDomain(createdStock);
        } catch (error) {
            rootException(error as Error);
            throw error;
        } finally {
            rootDependency({
                name: DEPENDENCY_NAME,
                data: `prisma.stocks.create({ LABEL: ${stock.getLabelValue()}, USER_ID: ${userId} })`,
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
            const stock = await prisma.stocks.findUnique({
                where: {ID: stockId},
                include: {items: true}
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
                minimumStock: item.minimumStock
            });


            await prisma.items.create({
                data: {
                    LABEL: item.label,
                    DESCRIPTION: item.description || '',
                    QUANTITY: item.quantity,
                    MINIMUM_STOCK: item.minimumStock || 1,
                    STOCK_ID: stockId
                }
            });

            success = true;


            return await this.findById(stockId) as Stock;
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

    async updateItemQuantity(
        stockId: number,
        itemId: number,
        newQuantity: number
    ): Promise<Stock> {
        let success = false;

        try {

            const stock = await this.findById(stockId);
            if (!stock) {
                throw new Error(`Stock with ID ${stockId} not found`);
            }


            stock.updateItemQuantity(itemId, newQuantity);


            await prisma.items.update({
                where: {ID: itemId},
                data: {QUANTITY: newQuantity}
            });

            success = true;


            return await this.findById(stockId) as Stock;
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

    private toDomain(prismaStock: any): Stock {
        const items = prismaStock.items?.map((item: PrismaItem) =>
            new StockItem(
                item.ID,
                item.LABEL ?? '',
                item.QUANTITY ?? 0,
                item.DESCRIPTION ?? '',
                item.MINIMUM_STOCK,
                item.STOCK_ID!
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
