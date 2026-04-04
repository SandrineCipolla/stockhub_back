import { StockVisualizationService } from '@domain/stock-management/visualization/services/StockVisualizationService';
import { StockItem } from '@domain/stock-management/common/entities/StockItem';
import { Stock } from '@domain/stock-management/common/entities/Stock';
import { IStockVisualizationRepository } from '@domain/stock-management/visualization/queries/IStockVisualizationRepository';

describe('StockVisualizationService', () => {
  describe('getAllStocks', () => {
    describe('when user has no stocks', () => {
      const fakeRepository: IStockVisualizationRepository = {
        getAllStocks: async () => [],
        getStockDetails: async () => null,
        getStockItems: async () => [],
      };
      const service = new StockVisualizationService(fakeRepository);
      it('should return an empty array', async () => {
        const result = await service.getAllStocks(1);
        expect(result).toEqual([]);
      });
    });

    describe('when user has a stock with items', () => {
      const fakeRepository: IStockVisualizationRepository = {
        getAllStocks: async () => [
          {
            stock: new Stock(1, 'Stock 1', 'Description 1', 'alimentation', [
              new StockItem(1, 'Item 1', 5, 'description item1', 1, 1),
              new StockItem(2, 'Item 2', 0, 'description item2', 1, 1),
            ]),
            viewerRole: 'OWNER',
          },
        ],
        getStockDetails: async () => null,
        getStockItems: async () => [],
      };
      const service = new StockVisualizationService(fakeRepository);
      it('should return stock with aggregates', async () => {
        const result = await service.getAllStocks(1);
        expect(result.length).toBe(1);
        expect(result[0].label).toBe('Stock 1');
        expect(result[0].totalItems).toBe(2);
        expect(result[0].totalQuantity).toBe(5);
        expect(result[0].criticalItemsCount).toBe(1); // Item 2 is out-of-stock
      });
    });

    describe('when user has multiple stocks', () => {
      const fakeRepository: IStockVisualizationRepository = {
        getAllStocks: async () => [
          {
            stock: new Stock(1, 'Stock 1', 'Description 1', 'alimentation', [
              new StockItem(1, 'Item 1', 5, 'description item1', 1, 1),
            ]),
            viewerRole: 'OWNER',
          },
          {
            stock: new Stock(2, 'Stock 2', 'Description 2', 'alimentation', [
              new StockItem(2, 'Item 2', 3, 'description item2', 2, 2),
            ]),
            viewerRole: 'EDITOR',
          },
        ],
        getStockDetails: async () => null,
        getStockItems: async () => [],
      };
      const service = new StockVisualizationService(fakeRepository);
      it('should return all stocks with aggregates', async () => {
        const result = await service.getAllStocks(1);
        expect(result.length).toBe(2);
        expect(result[0].label).toBe('Stock 1');
        expect(result[1].label).toBe('Stock 2');
      });
    });
  });

  describe('getStockDetails', () => {
    describe('when stock has items', () => {
      const fakeRepository: IStockVisualizationRepository = {
        getAllStocks: async () => [],
        getStockDetails: async () =>
          new Stock(1, 'Stock 1', 'Description 1', 'alimentation', [
            new StockItem(1, 'Item 1', 5, 'desc', 3, 1), // qty=5, min=3 → 5 > 4.5, 5 <= 9 → optimal
            new StockItem(2, 'Item 2', 0, 'desc', 3, 1), // qty=0 → out-of-stock
          ]),
        getStockItems: async () => [],
      };
      const service = new StockVisualizationService(fakeRepository);
      it('should return stock detail with items and aggregates', async () => {
        const result = await service.getStockDetails(1, 1);
        expect(result.id).toBe(1);
        expect(result.label).toBe('Stock 1');
        expect(result.totalItems).toBe(2);
        expect(result.totalQuantity).toBe(5);
        expect(result.criticalItemsCount).toBe(1);
        expect(result.items).toHaveLength(2);
        expect(result.items[0].status).toBe('optimal');
        expect(result.items[1].status).toBe('out-of-stock');
      });
    });

    describe('when there are no items in the stock', () => {
      const fakeRepository: IStockVisualizationRepository = {
        getAllStocks: async () => [],
        getStockDetails: async () => new Stock(1, 'Stock 1', 'Description 1', 'alimentation', []),
        getStockItems: async () => [],
      };
      const service = new StockVisualizationService(fakeRepository);
      it('should return stock with 0 items and 0 quantity', async () => {
        const result = await service.getStockDetails(1, 1);
        expect(result.id).toBe(1);
        expect(result.label).toBe('Stock 1');
        expect(result.totalItems).toBe(0);
        expect(result.totalQuantity).toBe(0);
        expect(result.criticalItemsCount).toBe(0);
        expect(result.items).toHaveLength(0);
      });
    });

    describe('when stock does not exist', () => {
      const fakeRepository: IStockVisualizationRepository = {
        getAllStocks: async () => [],
        getStockDetails: async () => null,
        getStockItems: async () => [],
      };
      const service = new StockVisualizationService(fakeRepository);
      it('should throw an error', async () => {
        await expect(service.getStockDetails(99, 1)).rejects.toThrow('Stock not found');
      });
    });
  });

  describe('getStockItems', () => {
    describe('when there are no items in the stock', () => {
      const fakeRepository: IStockVisualizationRepository = {
        getAllStocks: async () => [],
        getStockDetails: async () => null,
        getStockItems: async () => [],
      };
      const service = new StockVisualizationService(fakeRepository);
      it('should return an empty array', async () => {
        const result = await service.getStockItems(1, 1);
        expect(result).toEqual([]);
      });
    });

    describe('when there are items in the stock', () => {
      const fakeRepository: IStockVisualizationRepository = {
        getAllStocks: async () => [],
        getStockDetails: async () => null,
        getStockItems: async () => [
          new StockItem(1, 'Item 1', 5, 'description item1', 3, 1), // qty=5, min=3 → optimal
          new StockItem(2, 'Item 2', 0, 'description item2', 3, 1), // qty=0 → out-of-stock
        ],
      };
      const service = new StockVisualizationService(fakeRepository);
      it('should return items with status', async () => {
        const result = await service.getStockItems(1, 1);
        expect(result.length).toBe(2);
        expect(result[0].label).toBe('Item 1');
        expect(result[0].quantity).toBe(5);
        expect(result[0].status).toBe('optimal');
        expect(result[1].label).toBe('Item 2');
        expect(result[1].quantity).toBe(0);
        expect(result[1].status).toBe('out-of-stock');
      });
    });
  });
});
