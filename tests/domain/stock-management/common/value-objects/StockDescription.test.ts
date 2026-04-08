import { StockDescription } from '@domain/stock-management/common/value-objects/StockDescription';

describe('StockDescription', () => {
  describe('constructor()', () => {
    describe('when description is empty', () => {
      it('should throw an error', () => {
        expect(() => new StockDescription('')).toThrow('Stock description cannot be empty.');
      });
    });

    describe('when description is null', () => {
      it('should throw an error', () => {
        expect(() => new StockDescription(null as any)).toThrow(
          'Stock description must be a string.'
        );
      });
    });

    describe('when description is undefined', () => {
      it('should throw an error', () => {
        expect(() => new StockDescription(undefined as any)).toThrow(
          'Stock description must be a string.'
        );
      });
    });

    describe('when description is a number', () => {
      it('should throw an error', () => {
        expect(() => new StockDescription(123 as any)).toThrow(
          'Stock description must be a string.'
        );
      });
    });

    describe('when description is an object', () => {
      it('should throw an error', () => {
        expect(() => new StockDescription({ text: 'test' } as any)).toThrow(
          'Stock description must be a string.'
        );
      });
    });

    describe('when description is valid', () => {
      it('should create with the provided value', () => {
        const desc = new StockDescription('Test description');

        expect(desc.getValue()).toBe('Test description');
      });
    });
  });
});
