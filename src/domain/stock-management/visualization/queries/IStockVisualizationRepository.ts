import { Stock } from '@domain/stock-management/common/entities/Stock';
import { StockItem } from '@domain/stock-management/common/entities/StockItem';

export interface StockWithRole {
  stock: Stock;
  viewerRole: string;
}

export interface IStockVisualizationRepository {
  getAllStocks(userId: number): Promise<StockWithRole[]>;

  getStockDetails(stockId: number, userId: number): Promise<Stock | null>;

  getStockItems(stockId: number, userId: number): Promise<StockItem[]>;
}
