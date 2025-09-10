import {Quantity} from "../../../../../src/domain/stock-management/common/value-objects/Quantity";

describe('Quantity', () => {
    describe('when the quantity is negative', () => {
        it('should throw an error', () => {
            expect(() => new Quantity(-1)).toThrow('Quantity cannot be negative');
        });
    });

    describe('when the quantity is zero', () => {
        it('should return true for isZero', () => {
            const quantity = new Quantity(0);
            expect(quantity.isZero()).toBe(true);
        });

        it('should return true for isLessOrEqualToMinimum with minimum 0', () => {
            const quantity = new Quantity(0);
            expect(quantity.isLessOrEqualToMinimum(0)).toBe(true);
        });

        it('should return true for isLessOrEqualToMinimum with minimum greater than 0', () => {
            const quantity = new Quantity(0);
            expect(quantity.isLessOrEqualToMinimum(5)).toBe(true);
        });

    });

    describe('when the quantity is greater than zero', () => {
        it('should return false for isZero', () => {
            const quantity = new Quantity(5);
            expect(quantity.isZero()).toBe(false);
        });

        it('should return false for isLessOrEqualToMinimum with minimum less than quantity', () => {
            const quantity = new Quantity(5);
            expect(quantity.isLessOrEqualToMinimum(3)).toBe(false);
        });

        it('should return true for isLessOrEqualToMinimum with minimum equal to quantity', () => {
            const quantity = new Quantity(5);
            expect(quantity.isLessOrEqualToMinimum(5)).toBe(true);
        });

        it('should return true for isLessOrEqualToMinimum with minimum greater than quantity', () => {
            const quantity = new Quantity(5);
            expect(quantity.isLessOrEqualToMinimum(10)).toBe(true);
        });

    })
})