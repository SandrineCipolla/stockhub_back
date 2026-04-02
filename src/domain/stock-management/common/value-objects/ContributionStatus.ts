export type ContributionStatusValue = 'PENDING' | 'APPROVED' | 'REJECTED';

export class ContributionStatus {
  private readonly value: ContributionStatusValue;

  constructor(value: ContributionStatusValue) {
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(value)) {
      throw new Error(`Invalid contribution status: ${value}`);
    }
    this.value = value;
  }

  static pending(): ContributionStatus {
    return new ContributionStatus('PENDING');
  }

  isPending(): boolean {
    return this.value === 'PENDING';
  }

  isApproved(): boolean {
    return this.value === 'APPROVED';
  }

  isRejected(): boolean {
    return this.value === 'REJECTED';
  }

  toString(): ContributionStatusValue {
    return this.value;
  }
}
