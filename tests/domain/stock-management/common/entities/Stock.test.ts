import {Stock} from "../../../../../src/domain/stock-management/common/entities/Stock";
import {StockItem} from "../../../../../src/domain/stock-management/common/entities/StockItem";
import {StockLabel} from "../../../../../src/domain/stock-management/common/value-objects/StockLabel";
import {StockDescription} from "../../../../../src/domain/stock-management/common/value-objects/StockDescription";


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
                    userId: 123
                });

                expect(stock.getLabelValue()).toBe('Stock Cuisine');
                expect(stock.getDescriptionValue()).toBe('Aliments périssables');
                expect(stock.category).toBe('alimentation');
                expect(stock.items).toHaveLength(0);
            })
        })

        describe('when label is invalid', () => {
            it('should throw an error from StockLabel', () => {
                expect(() => Stock.create({
                    label: 'AB',
                    description: 'Test',
                    category: 'test',
                    userId: 1
                })).toThrow('Stock label must be at least 3 characters');
            })
        })
    })

    describe('getTotalItems()', () => {
        describe('when stock is empty', () => {
            it('should return 0', () => {
                const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', []);
                expect(stock.getTotalItems()).toBe(0);
            })
        })

        describe('when stock has items', () => {
            it('should return the correct count', () => {
                const items = [
                    new StockItem(1, 'Item 1', 5, 'description item1', 1, 1),
                    new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
                ];
                const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', items);
                expect(stock.getTotalItems()).toBe(2);
            })
        })
    })

    describe('getTotalQuantity()', () => {
        describe('when stock is empty', () => {
            it('should return 0', () => {
                const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', []);
                expect(stock.getTotalQuantity()).toBe(0);
            })
        })

        describe('when stock has items', () => {
            it('should return the sum of all quantities', () => {
                const items = [
                    new StockItem(1, 'Item 1', 5, 'description item1', 1, 1),
                    new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
                ];
                const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', items);
                expect(stock.getTotalQuantity()).toBe(15);
            })
        })

        describe('when items have zero quantity', () => {
            it('should not count zero quantities', () => {
                const items = [
                    new StockItem(1, 'Item 1', 0, 'description item1', 1, 1),
                    new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
                ];
                const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', items);
                expect(stock.getTotalQuantity()).toBe(10);
            })
        })
    })
    
})
