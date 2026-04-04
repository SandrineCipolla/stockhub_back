import {
  StockSummaryDto,
  StockDetailDto,
  StockItemDto,
  toStockSummaryDto,
  toStockDetailDto,
} from '@domain/stock-management/visualization/models/StockSummary';
import { IStockVisualizationRepository } from '@domain/stock-management/visualization/queries/IStockVisualizationRepository';

export class StockVisualizationService {
  constructor(private repository: IStockVisualizationRepository) {}

  async getAllStocks(userId: number): Promise<StockSummaryDto[]> {
    const stocks = await this.repository.getAllStocks(userId);
    return stocks.map(({ stock, viewerRole }) => toStockSummaryDto(stock, viewerRole));
  }

  async getStockDetails(stockId: number, userId: number): Promise<StockDetailDto> {
    const stock = await this.repository.getStockDetails(stockId, userId);

    if (!stock) {
      throw new Error('Stock not found');
    }

    return toStockDetailDto(stock);
  }

  async getStockItems(stockId: number, userId: number): Promise<StockItemDto[]> {
    const items = await this.repository.getStockItems(stockId, userId);
    return items.map(item => ({
      id: item.id,
      label: item.label,
      description: item.description,
      quantity: item.quantity,
      minimumStock: item.minimumStock,
      status: item.getStatus(),
    }));
  }
}
