import {Stock} from "../../common/entities/Stock";

export interface IStockVisualizationRepository {
    getAllStocks(userId: number): Promise<Stock []>;
}