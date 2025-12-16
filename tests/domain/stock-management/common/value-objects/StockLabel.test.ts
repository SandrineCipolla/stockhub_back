import {StockLabel} from "@domain/stock-management/common/value-objects/StockLabel";

describe('StockLabel', () => {
    describe('constructor()', () => {

        describe('when creating with good format', () => {
            it('should create the StockLabel', () => {
                const label = new StockLabel('Stock Cuisine');

                expect(label.getValue()).toBe('Stock Cuisine');
            })
        })

        describe('when label is empty', () => {
            it('should throw an error', () => {
                expect(() => new StockLabel('')).toThrow(
                    'Stock label must be at least 3 characters.'
                );
            })
        })

        describe('when label is null', () => {
            it('should throw an error', () => {
                expect(() => new StockLabel(null as any)).toThrow(
                    'Stock label must be a string.'
                );
            })
        })

        describe('when label is undefined', () => {
            it('should throw an error', () => {
                expect(() => new StockLabel(undefined as any)).toThrow(
                    'Stock label must be a string.'
                );
            })
        })

        describe('when label is a number', () => {
            it('should throw an error', () => {
                expect(() => new StockLabel(123 as any)).toThrow(
                    'Stock label must be a string.'
                );
            })
        })
    })

    describe('getValue()', () => {
        describe('when getting the value', () => {
            it('should return the stored value', () => {
                const label = new StockLabel('Test Stock');

                expect(label.getValue()).toBe('Test Stock');
            })
        })
    })

})
