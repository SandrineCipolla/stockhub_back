export interface AISuggestion {
  itemId: number;
  type: 'RESTOCK' | 'OVERSTOCK' | 'TREND_ALERT' | 'EXPIRY_ALERT' | 'OPTIMIZATION';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: 'llm' | 'deterministic';
}

export interface StockContextItem {
  itemId: number;
  quantity: number;
  minimumStock: number;
  daysUntilEmpty: number;
  trend: string;
  avgDailyConsumption: number;
  recommendedRestock: number;
}

export interface StockContext {
  items: StockContextItem[];
}

export interface IAIService {
  generateSuggestions(context: StockContext): Promise<AISuggestion[]>;
}
