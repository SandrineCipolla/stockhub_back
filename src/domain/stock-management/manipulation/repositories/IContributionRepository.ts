import { ItemContribution } from '@domain/stock-management/common/entities/ItemContribution';

export interface IContributionRepository {
  save(contribution: ItemContribution): Promise<ItemContribution>;
  findById(id: number): Promise<ItemContribution | null>;
  findPendingByStockId(stockId: number): Promise<ItemContribution[]>;
  update(contribution: ItemContribution): Promise<ItemContribution>;
  countPendingByOwner(ownerUserId: number): Promise<number>;
}
