import {StockLabel} from "@domain/stock-management/common/value-objects/StockLabel";
import {StockDescription} from "@domain/stock-management/common/value-objects/StockDescription";
import {Quantity} from "@domain/stock-management/common/value-objects/Quantity";
import {stocks_CATEGORY} from "@prisma/client";
import {StockItem} from "@domain/stock-management/common/entities/StockItem";

export class Stock {
    constructor(
        public id: number,
        public label: string | StockLabel,
        public description: string | StockDescription,
        public category: string | stocks_CATEGORY,
        public items: StockItem[] = [],
    ) {
    }

    static create(params: {
        label: StockLabel | string;
        description: StockDescription | string;
        category: string;
        userId: number;
        id?: number;
    }): Stock {
        const stockLabel = params.label instanceof StockLabel
            ? params.label
            : new StockLabel(params.label);

        const stockDescription = params.description instanceof StockDescription
            ? params.description
            : new StockDescription(params.description);

        if (!params.category || params.category.trim() === '') {
            throw new Error('Stock category cannot be empty');
        }

        if (!params.userId || params.userId <= 0) {
            throw new Error('Stock must have a valid userId');
        }

        return new Stock(
            params.id ?? 0,
            stockLabel,
            stockDescription,
            params.category.trim(),
            []
        );
    }

    getLabelValue(): string {
        return this.label instanceof StockLabel ? this.label.getValue() : this.label;
    }

    getDescriptionValue(): string {
        return this.description instanceof StockDescription
            ? this.description.getValue()
            : this.description;
    }

    updateInfo(
        newLabel: StockLabel | string,
        newDescription: StockDescription | string
    ): void {
        this.label = newLabel;
        this.description = newDescription;
    }

    getTotalItems(): number {
        return this.items.length;
    }

    getTotalQuantity(): number {
        return this.items.reduce((sum, item) => sum + (item.QUANTITY ?? 0), 0);
    }

    addItem(params: {
        label: string;
        description?: string;
        quantity: number;
        minimumStock?: number;
    }): StockItem {
        if (!params.label || params.label.trim() === '') {
            throw new Error('Item label cannot be empty');
        }

        if (params.quantity < 0) {
            throw new Error('Item quantity cannot be negative');
        }

        const existingItem = this.items.find(
            item => item.LABEL.toLowerCase() === params.label.toLowerCase()
        );

        if (existingItem) {
            throw new Error(`Item with label "${params.label}" already exists in this stock`);
        }

        const newItem = new StockItem(
            0,
            params.label.trim(),
            params.quantity,
            params.description?.trim() ?? '',
            params.minimumStock ?? 1,
            this.id
        );

        this.items.push(newItem);
        return newItem;
    }

    updateItemQuantity(itemId: number, newQuantity: number | Quantity): void {
        const quantity = newQuantity instanceof Quantity
            ? newQuantity.value
            : newQuantity;

        if (quantity < 0) {
            throw new Error('Quantity cannot be negative');
        }

        const item = this.items.find(i => i.ID === itemId);

        if (!item) {
            throw new Error(`Item with ID ${itemId} not found in this stock`);
        }

        item.QUANTITY = quantity;
    }

    getLowStockItems(): StockItem[] {
        return this.items.filter(item => item.isLowStock());
    }

    hasLowStockItems(): boolean {
        return this.items.some(item => item.isLowStock());
    }

    removeItem(itemId: number): void {
        const index = this.items.findIndex(i => i.ID === itemId);

        if (index === -1) {
            throw new Error(`Item with ID ${itemId} not found in this stock`);
        }

        this.items.splice(index, 1);
    }

    getItemById(itemId: number): StockItem | undefined {
        return this.items.find(i => i.ID === itemId);
    }
}