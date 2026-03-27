import { PrismaClient } from '@prisma/client';
import {
  IItemHistoryRepository,
  ItemHistoryRecord,
} from '@domain/prediction/repositories/IItemHistoryRepository';

export class PrismaItemHistoryRepository implements IItemHistoryRepository {
  constructor(private readonly prisma: PrismaClient = new PrismaClient()) {}

  async record(entry: Omit<ItemHistoryRecord, 'id' | 'changedAt'>): Promise<void> {
    await this.prisma.itemHistory.create({
      data: {
        itemId: entry.itemId,
        oldQuantity: entry.oldQuantity,
        newQuantity: entry.newQuantity,
        changeType: entry.changeType,
        changedBy: entry.changedBy,
      },
    });
  }

  async getHistory(itemId: number, days: number): Promise<ItemHistoryRecord[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const records = await this.prisma.itemHistory.findMany({
      where: {
        itemId,
        changedAt: { gte: since },
      },
      orderBy: { changedAt: 'asc' },
    });

    return records.map(r => ({
      id: r.id,
      itemId: r.itemId,
      oldQuantity: r.oldQuantity,
      newQuantity: r.newQuantity,
      changeType: r.changeType as ItemHistoryRecord['changeType'],
      changedBy: r.changedBy,
      changedAt: r.changedAt,
    }));
  }
}
