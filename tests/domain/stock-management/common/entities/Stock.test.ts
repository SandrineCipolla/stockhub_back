import { Stock } from '@domain/stock-management/common/entities/Stock';
import { StockItem } from '@domain/stock-management/common/entities/StockItem';
import { StockLabel } from '@domain/stock-management/common/value-objects/StockLabel';
import { StockDescription } from '@domain/stock-management/common/value-objects/StockDescription';

// Test helpers to reduce duplication
const createTestStock = (overrides?: {
  label?: string;
  description?: string;
  category?: string;
  userId?: number;
}) => {
  return Stock.create({
    label: overrides?.label ?? 'Stock 1',
    description: overrides?.description ?? 'Description 1',
    category: overrides?.category ?? 'alimentation',
    userId: overrides?.userId ?? 1,
  });
};

const createTestItem = (overrides?: {
  label?: string;
  description?: string;
  quantity?: number;
  minimumStock?: number;
}) => {
  return {
    label: overrides?.label ?? 'Tomates',
    description: overrides?.description ?? 'Tomates fraîches',
    quantity: overrides?.quantity ?? 10,
    minimumStock: overrides?.minimumStock ?? 3,
  };
};

describe('Stock', () => {
  describe('create()', () => {
    describe('when creating with Value Objects', () => {
      it('should create stock with StockLabel and StockDescription', () => {
        const label = new StockLabel('Stock Cuisine');
        const description = new StockDescription('Aliments périssables');

        const stock = Stock.create({
          label,
          description,
          category: 'alimentation',
          userId: 123,
        });

        expect(stock.getLabelValue()).toBe('Stock Cuisine');
        expect(stock.getDescriptionValue()).toBe('Aliments périssables');
        expect(stock.category).toBe('alimentation');
        expect(stock.items).toHaveLength(0);
      });
    });

    describe('when label is invalid', () => {
      it('should throw an error from StockLabel', () => {
        expect(() =>
          Stock.create({
            label: 'AB',
            description: 'Test',
            category: 'test',
            userId: 1,
          })
        ).toThrow('Stock label must be at least 3 characters');
      });
    });
  });

  describe('getTotalItems()', () => {
    describe('when stock is empty', () => {
      it('should return 0', () => {
        const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', []);
        expect(stock.getTotalItems()).toBe(0);
      });
    });

    describe('when stock has items', () => {
      it('should return the correct count', () => {
        const items = [
          new StockItem(1, 'Item 1', 5, 'description item1', 1, 1),
          new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
        ];
        const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', items);
        expect(stock.getTotalItems()).toBe(2);
      });
    });
  });

  describe('getTotalQuantity()', () => {
    describe('when stock is empty', () => {
      it('should return 0', () => {
        const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', []);
        expect(stock.getTotalQuantity()).toBe(0);
      });
    });

    describe('when stock has items', () => {
      it('should return the sum of all quantities', () => {
        const items = [
          new StockItem(1, 'Item 1', 5, 'description item1', 1, 1),
          new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
        ];
        const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', items);
        expect(stock.getTotalQuantity()).toBe(15);
      });
    });

    describe('when items have zero quantity', () => {
      it('should not count zero quantities', () => {
        const items = [
          new StockItem(1, 'Item 1', 0, 'description item1', 1, 1),
          new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
        ];
        const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', items);
        expect(stock.getTotalQuantity()).toBe(10);
      });
    });
  });

  describe('addItem()', () => {
    describe('when adding a valid item', () => {
      it('should add the item to the stock', () => {
        const stock = createTestStock();

        const item = stock.addItem(createTestItem());

        expect(stock.items).toHaveLength(1);
        expect(stock.items[0]).toBe(item);
        expect(item.LABEL).toBe('Tomates');
        expect(item.QUANTITY).toBe(10);
        expect(item.minimumStock).toBe(3);
      });
    });

    describe('when label is empty', () => {
      it('should throw an error', () => {
        const stock = createTestStock();

        expect(() => stock.addItem(createTestItem({ label: '' }))).toThrow(
          'Item label cannot be empty'
        );
      });
    });

    describe('when quantity is negative', () => {
      it('should throw an error', () => {
        const stock = createTestStock();

        expect(() => stock.addItem(createTestItem({ label: 'Item 1', quantity: -5 }))).toThrow(
          'Item quantity cannot be negative'
        );
      });
    });

    describe('when item with same label already exists', () => {
      it('should throw an error', () => {
        const stock = createTestStock();

        stock.addItem(createTestItem());

        expect(() => stock.addItem(createTestItem({ quantity: 5 }))).toThrow(
          'Item with label "Tomates" already exists in this stock'
        );
      });
    });

    describe('when item with same label but different case', () => {
      it('should throw an error', () => {
        const stock = createTestStock();

        stock.addItem(createTestItem());

        expect(() => stock.addItem(createTestItem({ label: 'TOMATES', quantity: 5 }))).toThrow(
          'Item with label "TOMATES" already exists in this stock'
        );
      });
    });
  });

  describe('updateItemQuantity()', () => {
    describe('when updating with a valid quantity', () => {
      it('should update the item quantity', () => {
        const stock = createTestStock();

        const item = stock.addItem(createTestItem());

        stock.updateItemQuantity(item.ID, 25);

        expect(item.QUANTITY).toBe(25);
      });
    });

    describe('when quantity is negative', () => {
      it('should throw an error', () => {
        const stock = createTestStock();

        const item = stock.addItem(createTestItem());

        expect(() => stock.updateItemQuantity(item.ID, -5)).toThrow('Quantity cannot be negative');
      });
    });

    describe('when item does not exist', () => {
      it('should throw an error', () => {
        const stock = createTestStock();

        expect(() => stock.updateItemQuantity(999, 10)).toThrow(
          'Item with ID 999 not found in this stock'
        );
      });
    });
  });

  describe('getLowStockItems()', () => {
    describe('when no items are low on stock', () => {
      it('should return an empty array', () => {
        const stock = createTestStock();

        stock.addItem(createTestItem());
        stock.addItem(createTestItem({ label: 'Carottes', quantity: 15, minimumStock: 5 }));

        expect(stock.getLowStockItems()).toHaveLength(0);
      });
    });

    describe('when some items are low on stock', () => {
      it('should return only the low stock items', () => {
        const stock = createTestStock();

        stock.addItem(createTestItem({ quantity: 2, minimumStock: 5 }));
        stock.addItem(createTestItem({ label: 'Carottes', quantity: 15, minimumStock: 3 }));
        stock.addItem(createTestItem({ label: 'Pommes', quantity: 1, minimumStock: 10 }));

        const lowStockItems = stock.getLowStockItems();

        expect(lowStockItems).toHaveLength(2);
        expect(lowStockItems.map(item => item.LABEL)).toContain('Tomates');
        expect(lowStockItems.map(item => item.LABEL)).toContain('Pommes');
      });
    });
  });

  describe('hasLowStockItems()', () => {
    describe('when there are no low stock items', () => {
      it('should return false', () => {
        const stock = createTestStock();

        stock.addItem(createTestItem());

        expect(stock.hasLowStockItems()).toBe(false);
      });
    });

    describe('when there are low stock items', () => {
      it('should return true', () => {
        const stock = createTestStock();

        stock.addItem(createTestItem({ quantity: 2, minimumStock: 5 }));

        expect(stock.hasLowStockItems()).toBe(true);
      });
    });
  });
});
