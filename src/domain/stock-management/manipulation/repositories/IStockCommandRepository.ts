import {Stock} from "../../common/entities/Stock";

export interface IStockCommandRepository {
    save(stock: Stock): Promise<Stock>;
    findById(stockId: number): Promise<Stock | null>;
    addItemToStock(stockId: number, item: {
        label: string;
        quantity: number;
        description?: string;
        minimumStock?: number;
    }): Promise<Stock>;
    updateItemQuantity(stockId: number, itemId: number, newQuantity: number): Promise<Stock>;
}
