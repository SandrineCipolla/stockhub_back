import {IStockVisualizationRepository} from "../queries/IStockVisualizationRepository";
import {StockItem} from "../../common/entities/StockItem";
import {Stock} from "../../common/entities/Stock";


export class StockVisualizationService {
    constructor(
        private repository: IStockVisualizationRepository
    ) {
    }

    async getAllStocks(userId: number): Promise<Stock[]> {
        return this.repository.getAllStocks(userId);
    }

    async getStockDetails(stockId: number, userId: number): Promise<Stock> {
        const stock = await this.repository.getStockDetails(stockId, userId);

        if (!stock) {
            throw new Error("Stock not found");
        }
        return stock;
    }

    async getStockItems(stockId: number, userId: number): Promise<StockItem[]> {
        return this.repository.getStockItems(stockId, userId);
    }
}