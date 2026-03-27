export interface PredictionResult {
  itemId: number;
  daysUntilEmpty: number | null;
  avgDailyConsumption: number | null;
  trend: 'STABLE' | 'INCREASING' | 'DECREASING';
  recommendedRestock: number | null;
  simulatedFallback: boolean;
  generatedAt: Date;
}

export interface CachedAISuggestions {
  data: object[];
  generatedAt: Date;
}

export interface IPredictionRepository {
  save(prediction: Omit<PredictionResult, 'generatedAt'>): Promise<PredictionResult>;
  getLatest(itemId: number): Promise<PredictionResult | null>;
  saveAISuggestions(itemId: number, suggestions: object[]): Promise<void>;
  getCachedAISuggestions(itemId: number): Promise<CachedAISuggestions | null>;
}
