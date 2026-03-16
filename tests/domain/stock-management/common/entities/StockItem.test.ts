import { StockItem } from '@domain/stock-management/common/entities/StockItem';

describe('StockItem', () => {
  describe('when the stockItem quantity is 0', () => {
    it('should return true for isOutOfStock', () => {
      const stockItem = new StockItem(1, 'item1', 0, 'description item1', 1, 3);
      expect(stockItem.isOutOfStock()).toBe(true);
    });
  });

  describe('when the stockItem quantity is less or equal to minimumStock', () => {
    it('should return true for isLowStock', () => {
      const stockItem = new StockItem(1, 'item1', 2, 'description item1', 2, 2);
      expect(stockItem.isLowStock()).toBe(true);
    });
  });

  describe('when the stockItem quantity is greater than minimumStock', () => {
    it('should return false for isLowStock', () => {
      const stockItem = new StockItem(1, 'item1', 5, 'description item1', 1, 3);
      expect(stockItem.isLowStock()).toBe(false);
    });
  });

  describe('getStatus()', () => {
    it("should return 'out-of-stock' when quantity is 0", () => {
      const item = new StockItem(1, 'item1', 0, '', 5, 1);
      expect(item.getStatus()).toBe('out-of-stock');
    });

    it("should return 'critical' when quantity equals minimumStock", () => {
      const item = new StockItem(1, 'item1', 5, '', 5, 1);
      expect(item.getStatus()).toBe('critical');
    });

    it("should return 'critical' when quantity is below minimumStock", () => {
      const item = new StockItem(1, 'item1', 3, '', 5, 1);
      expect(item.getStatus()).toBe('critical');
    });

    it("should return 'low' when quantity is between min and min * 1.5", () => {
      const item = new StockItem(1, 'item1', 7, '', 5, 1);
      expect(item.getStatus()).toBe('low');
    });

    it("should return 'optimal' in normal range", () => {
      const item = new StockItem(1, 'item1', 10, '', 5, 1);
      expect(item.getStatus()).toBe('optimal');
    });

    it("should return 'overstocked' when quantity exceeds min * 3", () => {
      const item = new StockItem(1, 'item1', 16, '', 5, 1);
      expect(item.getStatus()).toBe('overstocked');
    });

    it('should use 1 as default minimumStock when not set', () => {
      const item = new StockItem(1, 'item1', 2, '', 1, 1);
      expect(item.getStatus()).toBe('optimal');
    });
  });
});
