import {PrismaClient} from "../../generated/prisma";

import {Stock} from "../../domain/stock-management/common/entities/Stock";
import {StockItem} from "../../domain/stock-management/common/entities/StockItem";
import {Quantity} from "../../domain/stock-management/common/value-objects/Quantity";
import {
    IStockVisualizationRepository
} from "../../domain/stock-management/visualization/queries/IStockVisualizationRepository";

const prisma = new PrismaClient();

export class PrismaStockVisualizationRepository implements IStockVisualizationRepository {
    async getAllStocks(userId: number): Promise<Stock[]> {
        const stocks = await prisma.stocks.findMany({
            where: {USER_ID: userId},
            include: {items: true},
        });
        return stocks.map((stock) => new Stock(
            stock.ID,
            stock.LABEL,
            stock.DESCRIPTION ?? '',
            stock.CATEGORY,
            stock.items.map((item) => new StockItem(
                    item.LABEL ?? '',
                    new Quantity(item.QUANTITY ?? 0),
                    item.MINIMUM_STOCK
                )
            )
        ));

    }
}