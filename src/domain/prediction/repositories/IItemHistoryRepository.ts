export interface ItemHistoryRecord {
  id: number;
  itemId: number;
  oldQuantity: number;
  newQuantity: number;
  changeType: 'CONSUMPTION' | 'RESTOCK' | 'ADJUSTMENT';
  changedBy: string | null;
  changedAt: Date;
}

export interface IItemHistoryRepository {
  record(entry: Omit<ItemHistoryRecord, 'id' | 'changedAt'>): Promise<void>;
  getHistory(itemId: number, days: number): Promise<ItemHistoryRecord[]>;
}
