import {
    StockVisualizationService
} from "../../../../../src/domain/stock-management/visualization/services/StockVisualizationService";
import {Quantity} from "../../../../../src/domain/stock-management/common/value-objects/Quantity";
import {StockItem} from "../../../../../src/domain/stock-management/common/entities/StockItem";
import {Stock} from "../../../../../src/domain/stock-management/common/entities/Stock";

describe('StockVisualizationService', () => {
    describe(':: getAllStocks', () => {
        describe('when user has no stocks', () => {
            const fakeRepository = {getAllStocks: async () => []};
            const service = new StockVisualizationService(fakeRepository);
            it('should return an empty array', async () => {
                const result = await service.getAllStocks(1);
                expect(result).toEqual([]);
            })
        })

        describe('when user has a stocks', () => {
            const fakeStocks = {
                getAllStocks: async () => [
                    new Stock(1, 'Stock 1', 'Description 1', 'alimentation', [
                        new StockItem('Item 1', new Quantity(5), 1),
                        new StockItem('Item 2', new Quantity(10), 1),
                    ]),
                ],
            };
            const service = new StockVisualizationService(fakeStocks);
            it('should return one stock', async () => {
                const result = await service.getAllStocks(1);
                expect(result.length).toBe(1);
                expect(result[0].label).toBe('Stock 1');
                expect(result[0].getTotalItems()).toBe(2);
                expect(result[0].getTotalQuantity()).toBe(15);
            })
        })

        describe('when user has multiple stocks', () => {
            const fakeStocks = {
                getAllStocks: async () => [
                    new Stock(1, 'Stock 1', 'Description 1', 'alimentation', [
                        new StockItem('Item 1', new Quantity(5), 1),
                        new StockItem('Item 2', new Quantity(10), 1),
                    ]),
                    new Stock(2, 'Stock 2', 'Description 2', 'electronics', [
                        new StockItem('Item 3', new Quantity(3), 1),
                    ]),
                ],
            };
            const service = new StockVisualizationService(fakeStocks);
            it('should return an array of stocks with correct totals', async () => {
                const result = await service.getAllStocks(1);
                expect(result.length).toBe(2);
                expect(result[0].label).toBe('Stock 1');
                expect(result[0].getTotalItems()).toBe(2);
                expect(result[0].getTotalQuantity()).toBe(15);
                expect(result[1].label).toBe('Stock 2');
                expect(result[1].getTotalItems()).toBe(1);
                expect(result[1].getTotalQuantity()).toBe(3);
            })
        })
    })

    describe('::getStockDetails', () => {
        describe('when there is no items in the stock', () => {
            const fakeStocks = {
                getAllStocks: async () => [
                    new Stock(1, 'Stock 1', 'Description 1', 'alimentation', [

                    ]),
                ],
            };
            const service = new StockVisualizationService(fakeStocks);
            it('should return the stock with 0 items and 0 quantity', async () => {
                const result = await service.getStockDetails(1, 1);
                expect(result).toBeDefined();
                expect(result?.label).toBe('Stock 1');
                expect(result?.id).toBe(1);
                expect(result?.getTotalItems()).toBe(0);
                expect(result?.getTotalQuantity()).toBe(0);
            })
        })

        describe('when stock does not exist', () => {
            const fakeRepository = {getAllStocks: async () => []};
            const service = new StockVisualizationService(fakeRepository);
            it('should throw an error', async () => {
                await expect(service.getStockDetails(99,1))
                    .rejects.toThrow('Stock not found')
            })
        })
    })

})