import { StockSummary } from '@domain/stock-management/visualization/models/StockSummary';
import { IStockVisualizationRepository } from '@domain/stock-management/visualization/queries/IStockVisualizationRepository';
import { StockItem } from '@domain/stock-management/common/entities/StockItem';
import { StockWithoutItems } from '@domain/stock-management/visualization/models/StockWithoutItems';

export class StockVisualizationService {
  constructor(private repository: IStockVisualizationRepository) {}

  async getAllStocks(userId: number): Promise<StockWithoutItems[]> {
    const stocks = await this.repository.getAllStocks(userId);

    return stocks.map(stock => ({
      id: stock.id,
      label: stock.getLabelValue(),
      description: stock.getDescriptionValue(),
      category: stock.category,
    }));
  }

  async getStockDetails(stockId: number, userId: number): Promise<StockSummary> {
    const stock = await this.repository.getStockDetails(stockId, userId);

    if (!stock) {
      throw new Error('Stock not found');
    }
    return {
      ID: stock.id,
      LABEL: stock.getLabelValue(),
      DESCRIPTION: stock.getDescriptionValue(),
      category: stock.category,
    };
  }

  async getStockItems(stockId: number, userId: number): Promise<StockItem[]> {
    return this.repository.getStockItems(stockId, userId);
  }
}
