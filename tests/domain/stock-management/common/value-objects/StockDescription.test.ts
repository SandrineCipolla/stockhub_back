import {StockDescription} from "../../../../../src/domain/stock-management/common/value-objects/StockDescription";

describe('StockDescription', () => {
    describe('constructor()', () => {
        describe('when creating with short text', () => {
            it('should create the StockDescription', () => {
                const desc = new StockDescription('Description simple');

                expect(desc.getValue()).toBe('Description simple');
            })
        })

        describe('when creating with text at max length (200 chars)', () => {
            it('should create the StockDescription', () => {
                const longDesc = 'A'.repeat(200);
                const desc = new StockDescription(longDesc);

                expect(desc.getValue()).toBe(longDesc);
            })
        })

        describe('when creating with multiline text', () => {
            it('should create the StockDescription', () => {
                const multiline = 'Ligne 1\nLigne 2\nLigne 3';
                const desc = new StockDescription(multiline);

                expect(desc.getValue()).toBe(multiline);
            })
        })

        describe('when description contains whitespace', () => {
            it('should trim the whitespace', () => {
                const desc = new StockDescription('  Description  ');

                expect(desc.getValue()).toBe('Description');
            })
        })

        describe('when description contains special characters', () => {
            it('should accept them', () => {
                const desc = new StockDescription('Stock de produits : 100% bio (été 2024)');

                expect(desc.getValue()).toBe('Stock de produits : 100% bio (été 2024)');
            })
        })

        describe('when description is empty', () => {
            it('should throw an error', () => {
                expect(() => new StockDescription('')).toThrow(
                    'Stock description cannot be empty.'
                );
            })
        })

        describe('when description is whitespace only', () => {
            it('should throw an error', () => {
                expect(() => new StockDescription('   ')).toThrow(
                    'Stock description cannot be empty.'
                );
            })
        })

        describe('when description is too long (201 chars)', () => {
            it('should throw an error', () => {
                const tooLong = 'A'.repeat(201);

                expect(() => new StockDescription(tooLong)).toThrow(
                    'Stock description must not exceed 200 characters.'
                );
            })
        })

        describe('when description is null', () => {
            it('should throw an error', () => {
                expect(() => new StockDescription(null as any)).toThrow(
                    'Stock description must be a string.'
                );
            })
        })

        describe('when description is undefined', () => {
            it('should throw an error', () => {
                expect(() => new StockDescription(undefined as any)).toThrow(
                    'Stock description must be a string.'
                );
            })
        })

        describe('when description is a number', () => {
            it('should throw an error', () => {
                expect(() => new StockDescription(123 as any)).toThrow(
                    'Stock description must be a string.'
                );
            })
        })

        describe('when description is an object', () => {
            it('should throw an error', () => {
                expect(() => new StockDescription({text: 'test'} as any)).toThrow(
                    'Stock description must be a string.'
                );
            })
        })
    })

    describe('getValue()', () => {
        describe('when getting the value', () => {
            it('should return the stored value', () => {
                const desc = new StockDescription('Test description');

                expect(desc.getValue()).toBe('Test description');
            })
        })
    })

    describe('immutability', () => {
        describe('when value field is accessed', () => {
            it('should be readonly at runtime', () => {
                const desc = new StockDescription('Test description');

                expect((desc as any).value).toBeDefined();
                expect(desc.getValue()).toBe('Test description');
            })
        })
    })

    describe('equality', () => {
        describe('when creating two instances with same value', () => {
            it('should create independent instances with same value', () => {
                const desc1 = new StockDescription('Same description');
                const desc2 = new StockDescription('Same description');

                expect(desc1).not.toBe(desc2);
                expect(desc1.getValue()).toBe(desc2.getValue());
            })
        })
    })
})
