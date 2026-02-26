import { Stock } from '@domain/stock-management/common/entities/Stock';

export interface IStockCommandRepository {
  save(stock: Stock, userId: number): Promise<Stock>;
  findById(stockId: number): Promise<Stock | null>;
  addItemToStock(
    stockId: number,
    item: {
      label: string;
      quantity: number;
      description?: string;
      minimumStock?: number;
    }
  ): Promise<Stock>;
  updateItemQuantity(stockId: number, itemId: number, newQuantity: number): Promise<Stock>;
  updateStock(
    stockId: number,
    data: {
      label?: string;
      description?: string;
      category?: string;
    }
  ): Promise<Stock>;
  deleteStock(stockId: number): Promise<void>;
}
