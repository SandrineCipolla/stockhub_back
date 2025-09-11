import {Quantity} from "../value-objects/Quantity";

export class StockItem {
    constructor(
        public label: string,
        public quantity: Quantity,
        public minimumStock: number = 1,
    ) {

    }

    isOutOfStock(): boolean {
        return this.quantity.isZero();
    }

    isLowStock(): boolean {
        return this.quantity.isLessOrEqualToMinimum(this.minimumStock);
    }
}