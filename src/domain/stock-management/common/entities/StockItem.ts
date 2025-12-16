import {Quantity} from "@domain/stock-management/common/value-objects/Quantity";

export class StockItem {

    private innerQuantity: Quantity;

    constructor(
        public ID: number,
        public LABEL: string,
        public QUANTITY: number,
        public DESCRIPTION: string,
        public minimumStock: number = 1,
        public STOCK_ID: number,
    ) {
        this.innerQuantity = new Quantity(QUANTITY);
    }

    isOutOfStock(): boolean {
        return this.innerQuantity.isZero();
    }

    isLowStock(): boolean {
        return this.innerQuantity.isLessOrEqualToMinimum(this.minimumStock);
    }
}