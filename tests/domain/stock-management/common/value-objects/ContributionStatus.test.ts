import { ContributionStatus } from '@domain/stock-management/common/value-objects/ContributionStatus';

describe('ContributionStatus', () => {
  describe('constructor', () => {
    it('should accept PENDING', () => {
      expect(() => new ContributionStatus('PENDING')).not.toThrow();
    });

    it('should accept APPROVED', () => {
      expect(() => new ContributionStatus('APPROVED')).not.toThrow();
    });

    it('should accept REJECTED', () => {
      expect(() => new ContributionStatus('REJECTED')).not.toThrow();
    });

    it('should throw on invalid value', () => {
      expect(() => new ContributionStatus('INVALID' as never)).toThrow(
        'Invalid contribution status: INVALID'
      );
    });
  });

  describe('static pending()', () => {
    it('should create a PENDING status', () => {
      const status = ContributionStatus.pending();
      expect(status.isPending()).toBe(true);
    });
  });

  describe('isPending()', () => {
    it('should return true for PENDING', () => {
      expect(new ContributionStatus('PENDING').isPending()).toBe(true);
    });

    it('should return false for APPROVED', () => {
      expect(new ContributionStatus('APPROVED').isPending()).toBe(false);
    });
  });

  describe('isApproved()', () => {
    it('should return true for APPROVED', () => {
      expect(new ContributionStatus('APPROVED').isApproved()).toBe(true);
    });

    it('should return false for PENDING', () => {
      expect(new ContributionStatus('PENDING').isApproved()).toBe(false);
    });
  });

  describe('isRejected()', () => {
    it('should return true for REJECTED', () => {
      expect(new ContributionStatus('REJECTED').isRejected()).toBe(true);
    });

    it('should return false for PENDING', () => {
      expect(new ContributionStatus('PENDING').isRejected()).toBe(false);
    });
  });

  describe('toString()', () => {
    it('should return the string value', () => {
      expect(new ContributionStatus('APPROVED').toString()).toBe('APPROVED');
    });
  });
});
