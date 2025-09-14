import {Stock} from "../../../../../src/domain/stock-management/common/entities/Stock";
import {StockItem} from "../../../../../src/domain/stock-management/common/entities/StockItem";


describe('Stock', () => {
    describe('when a stock is empty', () => {
        it('should return 0 items and 0 quantity', () => {
            const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', []);
            expect(stock.getTotalItems()).toBe(0);
            expect(stock.getTotalQuantity()).toBe(0);
        })
    })

    describe('when a stock has items', () => {
        it('should return the correct total items and total quantity', () => {
            const items = [
                new StockItem(1, 'Item 1', 5, 'description item1', 1, 1),
                new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
            ];
            const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', items);
            expect(stock.getTotalItems()).toBe(2);
            expect(stock.getTotalQuantity()).toBe(15);
        })
    })

    describe('when a stock has items with zero quantity', () => {
        it('should count items but not their quantity', () => {
            const items = [
                new StockItem(1, 'Item 1', 0, 'description item1', 1, 1),
                new StockItem(2, 'Item 2', 10, 'description item2', 1, 1),
            ];
            const stock = new Stock(1, 'Stock 1', 'Description 1', 'alimentation', items);
            expect(stock.getTotalItems()).toBe(2);
            expect(stock.getTotalQuantity()).toBe(10);
        })
    })
})