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
  });

  describe('getValue()', () => {
    describe('when getting the value', () => {
      it('should return the stored value', () => {
        const desc = new StockDescription('Test description');

        expect(desc.getValue()).toBe('Test description');
      });
    });
  });
});
