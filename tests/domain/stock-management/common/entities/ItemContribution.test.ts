import { ItemContribution } from '@domain/stock-management/common/entities/ItemContribution';

const makeContribution = (overrides?: Partial<Parameters<typeof ItemContribution.create>[0]>) =>
  ItemContribution.create({
    itemId: 1,
    stockId: 10,
    contributedBy: 99,
    suggestedQuantity: 5,
    ...overrides,
  });

describe('ItemContribution', () => {
  describe('create()', () => {
    it('should create a PENDING contribution with correct values', () => {
      const contribution = makeContribution();

      expect(contribution.itemId).toBe(1);
      expect(contribution.stockId).toBe(10);
      expect(contribution.contributedBy).toBe(99);
      expect(contribution.suggestedQuantity).toBe(5);
      expect(contribution.status.isPending()).toBe(true);
      expect(contribution.reviewedBy).toBeNull();
      expect(contribution.reviewedAt).toBeNull();
    });

    it('should accept quantity of 0 (item is empty)', () => {
      expect(() => makeContribution({ suggestedQuantity: 0 })).not.toThrow();
    });

    it('should throw when quantity is negative', () => {
      expect(() => makeContribution({ suggestedQuantity: -1 })).toThrow(
        'Suggested quantity cannot be negative'
      );
    });
  });

  describe('approve()', () => {
    it('should return an APPROVED contribution with reviewer info', () => {
      const contribution = makeContribution();
      const approved = contribution.approve(42);

      expect(approved.status.isApproved()).toBe(true);
      expect(approved.reviewedBy).toBe(42);
      expect(approved.reviewedAt).toBeInstanceOf(Date);
    });

    it('should not mutate the original contribution', () => {
      const contribution = makeContribution();
      contribution.approve(42);

      expect(contribution.status.isPending()).toBe(true);
    });

    it('should throw when approving an already approved contribution', () => {
      const contribution = makeContribution();
      const approved = contribution.approve(42);

      expect(() => approved.approve(42)).toThrow('Only pending contributions can be approved');
    });

    it('should throw when approving a rejected contribution', () => {
      const contribution = makeContribution();
      const rejected = contribution.reject(42);

      expect(() => rejected.approve(42)).toThrow('Only pending contributions can be approved');
    });
  });

  describe('reject()', () => {
    it('should return a REJECTED contribution with reviewer info', () => {
      const contribution = makeContribution();
      const rejected = contribution.reject(42);

      expect(rejected.status.isRejected()).toBe(true);
      expect(rejected.reviewedBy).toBe(42);
      expect(rejected.reviewedAt).toBeInstanceOf(Date);
    });

    it('should not mutate the original contribution', () => {
      const contribution = makeContribution();
      contribution.reject(42);

      expect(contribution.status.isPending()).toBe(true);
    });

    it('should throw when rejecting an already rejected contribution', () => {
      const contribution = makeContribution();
      const rejected = contribution.reject(42);

      expect(() => rejected.reject(42)).toThrow('Only pending contributions can be rejected');
    });
  });
});
