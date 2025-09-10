import {Stock} from "../../common/entities/Stock";

export interface IStockVisualizationRepository {
    getAllStocks(userId: number): Promise<Stock []>;
}

export class StockVisualizationService{
    constructor(
        private repository: IStockVisualizationRepository
    ) {
    }

    async getAllStocks(userId: number): Promise<Stock []> {
        return this.repository.getAllStocks(userId);
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