import { ItemContribution } from '@domain/stock-management/common/entities/ItemContribution';
import { ContributionStatus } from '@domain/stock-management/common/value-objects/ContributionStatus';

type ContributionParams = {
  id?: number;
  itemId?: number;
  stockId?: number;
  contributedBy?: number;
  suggestedQuantity?: number;
  status?: ContributionStatus;
};

export const makeContribution = (params: ContributionParams = {}): ItemContribution =>
  new ItemContribution(
    params.id ?? 1,
    params.itemId ?? 10,
    params.stockId ?? 2,
    params.contributedBy ?? 42,
    params.suggestedQuantity ?? 5,
    params.status ?? ContributionStatus.pending(),
    null,
    null,
    new Date('2026-04-10')
  );
