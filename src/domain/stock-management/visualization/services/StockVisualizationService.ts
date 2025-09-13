import {StockSummary} from "../models/StockSummary";
import {IStockVisualizationRepository} from "../queries/IStockVisualizationRepository";
import {StockItem} from "../../common/entities/StockItem";
import {StockWithoutItems} from "../models/StockWithoutItems";


export class StockVisualizationService {
    constructor(
        private repository: IStockVisualizationRepository
    ) {
    }

    async getAllStocks(userId: number): Promise<StockWithoutItems []> {
        const stocks = await this.repository.getAllStocks(userId);

        return stocks.map((stock) => ({
            id: stock.id,
            label: stock.label,
            description: stock.description,
            category: stock.category,
        }));
    }

    async getStockDetails(stockId: number, userId: number): Promise<StockSummary> {
        const stock = await this.repository.getStockDetails(stockId, userId);

        if (!stock) {
            throw new Error("Stock not found");
        }
        return {
            ID: stock.id,
            LABEL: stock.label,
            DESCRIPTION: stock.description,
            category: stock.category,
        };
    }

    async getStockItems(stockId: number, userId: number): Promise<StockItem []> {
        return this.repository.getStockItems(stockId, userId);
    }
}