import {Stock} from "../../../../domain/stock-management/common/entities/Stock";
import {StockItem} from "../../../../domain/stock-management/common/entities/StockItem";
import {
    IStockVisualizationRepository
} from "../../../../domain/stock-management/visualization/queries/IStockVisualizationRepository";

import {items as PrismaItem, PrismaClient, stocks as PrismaStock} from "@prisma/client";
import {DependencyTelemetry, rootDependency, rootException} from "../../../../Utils/cloudLogger";

const DEPENDENCY_NAME = process.env.DB_DATABASE;
const DEPENDENCY_TARGET = process.env.DB_HOST;
const DEPENDENCY_TYPE = "MySQL";

export class PrismaStockVisualizationRepository implements IStockVisualizationRepository {
    private prisma: PrismaClient;

    constructor(prismaClient?: PrismaClient) {
        this.prisma = prismaClient ?? new PrismaClient();
    }

    async getAllStocks(userId: number): Promise<Stock[]> {
        const stocks = await this.prisma.stocks.findMany({
            where: {USER_ID: userId},
            include: {
                items: true
            }
        });
        return stocks.map((stock) => {
            const stockEntity = new Stock(
                stock.ID,
                stock.LABEL,
                stock.DESCRIPTION ?? '',
                stock.CATEGORY,
            );
            // Ajouter les items au stock
            stockEntity.items = stock.items.map((item: PrismaItem) => new StockItem(
                item.ID,
                item.LABEL ?? '',
                item.QUANTITY ?? 0,
                item.DESCRIPTION ?? '',
                item.MINIMUM_STOCK,
                item.STOCK_ID!,
            ));
            return stockEntity;
        });

    }

    async getStockDetails(stockId: number, userId: number): Promise<Stock | null> {
        const stock = await this.prisma.stocks.findFirst({
            where: {ID: stockId, USER_ID: userId},
            include: {
                items: true
            }
        });
        if (!stock) {
            return null;
        }
        const stockEntity = new Stock(
            stock.ID,
            stock.LABEL,
            stock.DESCRIPTION ?? '',
            stock.CATEGORY,
        );
        // Ajouter les items au stock
        stockEntity.items = stock.items.map((item: PrismaItem) => new StockItem(
            item.ID,
            item.LABEL ?? '',
            item.QUANTITY ?? 0,
            item.DESCRIPTION ?? '',
            item.MINIMUM_STOCK,
            item.STOCK_ID!,
        ));
        return stockEntity;
    }

    async getStockItems(stockId: number, userId: number): Promise<StockItem[]> {

        let success = false;

        try {

            const stock = await this.prisma.stocks.findFirst({
                where: {ID: stockId, USER_ID: userId},

            });
            if (!stock) {
                throw new Error('Stock not found or access denied');
            }

            const items = await this.prisma.items.findMany({
                where: {STOCK_ID: stockId},
            });
            return items.map((item: PrismaItem) => new StockItem(
                item.ID,
                item.LABEL ?? '',
                item.QUANTITY ?? 0,
                item.DESCRIPTION ?? '',
                item.MINIMUM_STOCK,
                item.STOCK_ID!,
            ));
        } catch (error) {
            rootException(error as Error);
            throw error;
        } finally {
            rootDependency({
                name: DEPENDENCY_NAME,
                data: `prisma.stocks.findFirst({ where: {ID: ${stockId}, USER_ID: ${userId}}}) and prisma.items.findMany({ where: {STOCK_ID: ${stockId}}})`,
                duration: 0,
                success: success,
                resultCode: 0,
                target: DEPENDENCY_TARGET,
                dependencyTypeName: DEPENDENCY_TYPE,
            } as DependencyTelemetry);
        }
    }

}