export class Quantity {
    constructor(
        public value: number
    ) {
        if (value < 0) {
            throw new Error('Quantity cannot be negative');
        }
    }

    isZero(): boolean {
        return this.value === 0;
    }

    isLessOrEqualToMinimum(minimum: number): boolean {
        return this.value <= minimum;
    }
}