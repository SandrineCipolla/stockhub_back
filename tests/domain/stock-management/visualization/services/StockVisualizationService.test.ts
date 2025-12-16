import {
    StockVisualizationService
} from "@domain/stock-management/visualization/services/StockVisualizationService";
import {StockItem} from "@domain/stock-management/common/entities/StockItem";
import {Stock} from "@domain/stock-management/common/entities/Stock";
import {
    IStockVisualizationRepository
} from "@domain/stock-management/visualization/queries/IStockVisualizationRepository";

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
            })
        })

        describe('when user has a stock', () => {
            const fakeRepository: IStockVisualizationRepository = {
                getAllStocks: async () => [
                    new Stock(1, 'Stock 1', 'Description 1', 'alimentation', [
                        new StockItem(1, 'Item 1', 5, 'description item1', 1, 1),
                        new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
                    ]),
                ],
                getStockDetails: async () => null,
                getStockItems: async () => [],
            };
            const service = new StockVisualizationService(fakeRepository);
            it('should return one stock', async () => {
                const result = await service.getAllStocks(1);
                expect(result.length).toBe(1);
                expect(result[0].label).toBe('Stock 1');

            })
        })

        describe('when user has multiple stocks', () => {
            const fakeRepository: IStockVisualizationRepository = {
                getAllStocks: async () => [
                    new Stock(1, 'Stock 1', 'Description 1', 'alimentation', [
                        new StockItem(1, 'Item 1', 5, 'description item1', 1, 1),
                    ]),
                    new Stock(2, 'Stock 2', 'Description 2', 'electronics', [
                        new StockItem(2, 'Item 2', 3, 'description item2', 2, 1),
                    ]),
                ],
                getStockDetails: async () => null,
                getStockItems: async () => [],
            };
            const service = new StockVisualizationService(fakeRepository);
            it('should return an array of stocks', async () => {
                const result = await service.getAllStocks(1);
                expect(result.length).toBe(2);
                expect(result[0].label).toBe('Stock 1');

                expect(result[1].label).toBe('Stock 2');

            })
        })
    })
    describe('getStockDetails', () => {
        describe('when there is no items in the stock', () => {
            const fakeRepository: IStockVisualizationRepository = {
                getAllStocks: async () => [],
                getStockDetails: async () =>
                    new Stock(1, 'Stock 1', 'Description 1', 'alimentation', []),
                getStockItems: async () => [],
            };
            const service = new StockVisualizationService(fakeRepository);
            it('should return the stock with 0 items and 0 quantity', async () => {
                const result = await service.getStockDetails(1, 1);
                expect(result).toEqual({
                    ID: 1,
                    LABEL: 'Stock 1',
                    DESCRIPTION: 'Description 1',
                    category: 'alimentation',
                });
            })
        })

        describe('when stock does not exist', () => {
            const fakeRepository: IStockVisualizationRepository = {
                getAllStocks: async () => [],
                getStockDetails: async () => null,
                getStockItems: async () => [],
            };
            const service = new StockVisualizationService(fakeRepository);
            it('should throw an error', async () => {
                await expect(service.getStockDetails(99, 1))
                    .rejects.toThrow('Stock not found')
            })
        })
    })
    describe('getStockItems', () => {
        describe('when there is no items in the stock', () => {
            const fakeRepository: IStockVisualizationRepository = {
                getAllStocks: async () => [],
                getStockDetails: async () => null,
                getStockItems: async () => [],
            };
            const service = new StockVisualizationService(fakeRepository);
            it('should return an empty array', async () => {
                const result = await service.getStockItems(1, 1);
                expect(result).toEqual([]);
            })
        })

        describe('when there are items in the stock', () => {
            const fakeRepository: IStockVisualizationRepository = {
                getAllStocks: async () => [],
                getStockDetails: async () => null,
                getStockItems: async () => [
                    new StockItem(1, 'Item 1', 5, 'description item1', 1, 1),
                    new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
                ],
            };
            const service = new StockVisualizationService(fakeRepository);
            it('should return an array of items', async () => {
                const result = await service.getStockItems(1, 1);
                expect(result.length).toBe(2);
                expect(result[0].LABEL).toBe('Item 1');
                expect(result[0].QUANTITY).toBe(5);
                expect(result[1].LABEL).toBe('Item 2');
                expect(result[1].QUANTITY).toBe(10);
            })
        })
    })

})