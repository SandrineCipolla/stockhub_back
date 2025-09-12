import {Stock} from "../../common/entities/Stock";
import {StockItem} from "../../common/entities/StockItem";

export interface IStockVisualizationRepository {
    getAllStocks(userId: number): Promise<Stock []>;

    getStockDetails(stockId: number, userId: number): Promise<Stock | null>;

    getStockItems(stockId: number, userId: number): Promise<StockItem[]>;
}