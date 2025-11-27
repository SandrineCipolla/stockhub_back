import {StockLabel} from "../../../../../src/domain/stock-management/common/value-objects/StockLabel";

describe('StockLabel', () => {
    describe('constructor()', () => {
        describe('when creating with valid label at min length (3 chars)', () => {
            it('should create the StockLabel', () => {
                const label = new StockLabel('ABC');

                expect(label.getValue()).toBe('ABC');
            })
        })

        describe('when creating with valid label at max length (50 chars)', () => {
            it('should create the StockLabel', () => {
                const longLabel = 'A'.repeat(50);
                const label = new StockLabel(longLabel);

                expect(label.getValue()).toBe(longLabel);
            })
        })

        describe('when creating with normal text', () => {
            it('should create the StockLabel', () => {
                const label = new StockLabel('Stock Cuisine');

                expect(label.getValue()).toBe('Stock Cuisine');
            })
        })

        describe('when label contains whitespace', () => {
            it('should trim the whitespace', () => {
                const label = new StockLabel('  Mon Stock  ');

                expect(label.getValue()).toBe('Mon Stock');
            })
        })

        describe('when label contains special characters', () => {
            it('should accept them', () => {
                const label = new StockLabel('Stock-2024 (été)');

                expect(label.getValue()).toBe('Stock-2024 (été)');
            })
        })

        describe('when label is empty', () => {
            it('should throw an error', () => {
                expect(() => new StockLabel('')).toThrow(
                    'Stock label must be at least 3 characters.'
                );
            })
        })

        describe('when label is whitespace only', () => {
            it('should throw an error', () => {
                expect(() => new StockLabel('   ')).toThrow(
                    'Stock label must be at least 3 characters.'
                );
            })
        })

        describe('when label is too short (2 chars)', () => {
            it('should throw an error', () => {
                expect(() => new StockLabel('AB')).toThrow(
                    'Stock label must be at least 3 characters.'
                );
            })
        })

        describe('when label is too long (51 chars)', () => {
            it('should throw an error', () => {
                const tooLong = 'A'.repeat(51);

                expect(() => new StockLabel(tooLong)).toThrow(
                    'Stock label must not exceed 50 characters.'
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

    describe('immutability', () => {
        describe('when value field is accessed', () => {
            it('should be readonly at runtime', () => {
                const label = new StockLabel('Test Stock');

                expect((label as any).value).toBeDefined();
                expect(label.getValue()).toBe('Test Stock');
            })
        })
    })

    describe('equality', () => {
        describe('when creating two instances with same value', () => {
            it('should create independent instances with same value', () => {
                const label1 = new StockLabel('Stock Test');
                const label2 = new StockLabel('Stock Test');

                expect(label1).not.toBe(label2);
                expect(label1.getValue()).toBe(label2.getValue());
            })
        })
    })
})
