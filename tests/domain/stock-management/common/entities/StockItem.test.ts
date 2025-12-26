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
});
