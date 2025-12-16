import {Stock} from "@domain/stock-management/common/entities/Stock";
import {StockItem} from "@domain/stock-management/common/entities/StockItem";

export interface IStockVisualizationRepository {
    getAllStocks(userId: number): Promise<Stock []>;

    getStockDetails(stockId: number, userId: number): Promise<Stock | null>;

    getStockItems(stockId: number, userId: number): Promise<StockItem[]>;
}