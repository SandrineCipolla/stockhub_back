import { Stock } from '@domain/stock-management/common/entities/Stock';

export interface StockItemDto {
  id: number;
  label: string;
  description?: string;
  quantity: number;
  minimumStock?: number;
  status: 'optimal' | 'low' | 'critical' | 'out-of-stock' | 'overstocked';
}

export interface StockSummaryDto {
  id: number;
  label: string;
  description: string;
  category?: string;
  totalItems: number;
  totalQuantity: number;
  criticalItemsCount: number;
  status: 'optimal' | 'low' | 'critical' | 'out-of-stock' | 'overstocked';
  viewerRole?: string;
}

export interface StockDetailDto extends StockSummaryDto {
  items: StockItemDto[];
}

export function toStockSummaryDto(stock: Stock, viewerRole?: string): StockSummaryDto {
  return {
    id: stock.id,
    label: stock.getLabelValue(),
    description: stock.getDescriptionValue(),
    category: typeof stock.category === 'string' ? stock.category : String(stock.category),
    totalItems: stock.getTotalItems(),
    totalQuantity: stock.getTotalQuantity(),
    criticalItemsCount: stock.getCriticalItemsCount(),
    status: stock.getAggregatedStatus(),
    viewerRole,
  };
}

export function toStockDetailDto(stock: Stock): StockDetailDto {
  return {
    ...toStockSummaryDto(stock),
    items: stock.items.map(item => ({
      id: item.id,
      label: item.label,
      description: item.description,
      quantity: item.quantity,
      minimumStock: item.minimumStock,
      status: item.getStatus(),
    })),
  };
}
