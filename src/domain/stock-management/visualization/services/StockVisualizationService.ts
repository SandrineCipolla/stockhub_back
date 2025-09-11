import {Stock} from "../../common/entities/Stock";
import {StockSummary} from "../models/StockSummary";
import {IStockVisualizationRepository} from "../queries/IStockVisualizationRepository";


export class StockVisualizationService {
    constructor(
        private repository: IStockVisualizationRepository
    ) {
    }

    async getAllStocks(userId: number): Promise<StockSummary []> {
        const stocks = await this.repository.getAllStocks(userId);

        return stocks.map((stock) => ({
            id: stock.id,
            label: stock.label,
            description: stock.description,
            category: stock.category,
        }));
    }

    async getStockDetails(stockId: number, userId: number): Promise<Stock> {
        const stocks = await this.repository.getAllStocks(userId);
        const stock = stocks.find(s => s.id === stockId);
        if (!stock) {
            throw new Error("Stock not found");
        }
        return stock;
    }
}