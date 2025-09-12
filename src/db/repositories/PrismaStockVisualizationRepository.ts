import {Stock} from "../../domain/stock-management/common/entities/Stock";
import {StockItem} from "../../domain/stock-management/common/entities/StockItem";
import {Quantity} from "../../domain/stock-management/common/value-objects/Quantity";
import {
    IStockVisualizationRepository
} from "../../domain/stock-management/visualization/queries/IStockVisualizationRepository";

import {items as PrismaItem, PrismaClient, stocks as PrismaStock} from "@prisma/client";
import {rootMain} from "../../Utils/logger";


const prisma = new PrismaClient();

export class PrismaStockVisualizationRepository implements IStockVisualizationRepository {
    async getAllStocks(userId: number): Promise<Stock[]> {
        const stocks = await prisma.stocks.findMany({
            where: {USER_ID: userId},

        });
        return stocks.map((stock: PrismaStock) => new Stock(
            stock.ID,
            stock.LABEL,
            stock.DESCRIPTION ?? '',
            stock.CATEGORY,
        ));

    }

    async getStockDetails(stockId: number, userId: number): Promise<Stock | null> {
        const stock = await prisma.stocks.findFirst({
            where: {ID: stockId, USER_ID: userId},

        });
        if (!stock) {
            return null;
        }
        return new Stock(
            stock.ID,
            stock.LABEL,
            stock.DESCRIPTION ?? '',
            stock.CATEGORY,
        )
    }

    async getStockItems(stockId: number, userId: number): Promise<StockItem[]> {
        const stock = await prisma.stocks.findFirst({
            where: {ID: stockId, USER_ID: userId},

        });
        if (!stock) {
            rootMain.error(`Stock ${stockId} not found for user ${userId}`);
            throw new Error('Stock not found or access denied');
        }

        const items = await prisma.items.findMany({
            where: {STOCK_ID: stockId},
        });
        return items.map((item: PrismaItem) => new StockItem(
            item.ID,
            item.LABEL ?? '',
            new Quantity(item.QUANTITY ?? 0),
            item.DESCRIPTION ?? '',
            item.MINIMUM_STOCK,
            item.STOCK_ID,
        ));
    }

    async getStockById(stockId: number): Promise<Stock | null> {
        const stock = await prisma.stocks.findUnique({
            where: {ID: stockId}
        });

        if (!stock) {
            return null;
        }

        return new Stock(
            stock.ID,
            stock.LABEL,
            stock.DESCRIPTION ?? '',
            stock.CATEGORY,
        );
    }

    async getStockItemById(itemId: number): Promise<StockItem | null> {
        const item = await prisma.items.findUnique({
            where: {ID: itemId}
        });

        if (!item) {
            return null;
        }

        return new StockItem(
            item.ID,
            item.LABEL ?? '',
            new Quantity(item.QUANTITY ?? 0),
            item.DESCRIPTION ?? '',
            item.MINIMUM_STOCK,
            item.STOCK_ID,
        );
    }

    async updateStockItemQuantity(itemId: number, newQuantity: number): Promise<void> {
        await prisma.items.update({
            where: {ID: itemId},
            data: {QUANTITY: newQuantity}
        });
    }

}