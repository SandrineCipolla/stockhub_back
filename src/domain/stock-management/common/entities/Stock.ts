import {StockItem} from "./StockItem";

export class Stock {
    constructor(
        public id: number,
        public label: string,
        public description: string,
        public category: string,
        public items: StockItem[]=[],
    ) {
    }

    getTotalItems(): number {
        return this.items.length;
    }

    getTotalQuantity(): number {
        return this.items.reduce((sum, item) => sum + item.quantity.value, 0);
    }
}