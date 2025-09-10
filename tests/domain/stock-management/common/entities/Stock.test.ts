import {Stock} from "../../../../../src/domain/stock-management/common/entities/Stock";
import {StockItem} from "../../../../../src/domain/stock-management/common/entities/StockItem";
import {Quantity} from "../../../../../src/domain/stock-management/common/value-objects/Quantity";

;

describe('Stock', () => {
    describe('when a stock is empty', () => {
        it('should return 0 items and 0 quantiy', () => {
            const stock = new Stock(1, 'Stock 1', 'Description 1','alimentation', []);
            expect(stock.getTotalItems()).toBe(0);
            expect(stock.getTotalQuantity()).toBe(0);
        })
    })

    describe('when a stock has items', () => {
        it('should return the correct total items and total quantity', () => {
            const items = [
                new StockItem('Item 1', new Quantity(5), 1),
                new StockItem('Item 2', new Quantity(10), 1),
            ];
            const stock = new Stock(1, 'Stock 1', 'Description 1','alimentation', items);
            expect(stock.getTotalItems()).toBe(2);
            expect(stock.getTotalQuantity()).toBe(15);
        })
    })

    describe('when a stock has items with zero quantity', () => {
        it('should count items but not their quantity', () => {
            const items = [
                new StockItem('Item 1', new Quantity(0), 1),
                new StockItem('Item 2', new Quantity(10), 1),
            ];
            const stock = new Stock(1, 'Stock 1', 'Description 1','alimentation', items);
            expect(stock.getTotalItems()).toBe(2);
            expect(stock.getTotalQuantity()).toBe(10);
        })
    })
})