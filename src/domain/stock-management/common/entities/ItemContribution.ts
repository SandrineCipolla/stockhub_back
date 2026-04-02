import { ContributionStatus } from '@domain/stock-management/common/value-objects/ContributionStatus';

export class ItemContribution {
  readonly status: ContributionStatus;

  constructor(
    public readonly id: number,
    public readonly itemId: number,
    public readonly stockId: number,
    public readonly contributedBy: number,
    public readonly suggestedQuantity: number,
    status: ContributionStatus,
    public readonly reviewedBy: number | null,
    public readonly reviewedAt: Date | null,
    public readonly createdAt: Date
  ) {
    this.status = status;
  }

  static create(params: {
    itemId: number;
    stockId: number;
    contributedBy: number;
    suggestedQuantity: number;
  }): ItemContribution {
    if (params.suggestedQuantity < 0) {
      throw new Error('Suggested quantity cannot be negative');
    }
    return new ItemContribution(
      0,
      params.itemId,
      params.stockId,
      params.contributedBy,
      params.suggestedQuantity,
      ContributionStatus.pending(),
      null,
      null,
      new Date()
    );
  }

  approve(reviewedBy: number): ItemContribution {
    if (!this.status.isPending()) {
      throw new Error('Only pending contributions can be approved');
    }
    return new ItemContribution(
      this.id,
      this.itemId,
      this.stockId,
      this.contributedBy,
      this.suggestedQuantity,
      new ContributionStatus('APPROVED'),
      reviewedBy,
      new Date(),
      this.createdAt
    );
  }

  reject(reviewedBy: number): ItemContribution {
    if (!this.status.isPending()) {
      throw new Error('Only pending contributions can be rejected');
    }
    return new ItemContribution(
      this.id,
      this.itemId,
      this.stockId,
      this.contributedBy,
      this.suggestedQuantity,
      new ContributionStatus('REJECTED'),
      reviewedBy,
      new Date(),
      this.createdAt
    );
  }
}
