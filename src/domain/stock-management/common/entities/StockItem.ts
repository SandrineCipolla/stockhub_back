import {Quantity} from "../value-objects/Quantity";

export class StockItem {
    constructor(
        public id: number,
        public label: string,
        public quantity: Quantity,
        public description: string,
        public minimumStock: number = 1,
        public stockId: number,
    ) {

    }

    isOutOfStock(): boolean {
        return this.quantity.isZero();
    }

    isLowStock(): boolean {
        return this.quantity.isLessOrEqualToMinimum(this.minimumStock);
    }
}