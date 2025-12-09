import {Stock} from '../../src/domain/stock-management/common/entities/Stock';
import {StockItem} from '../../src/domain/stock-management/common/entities/StockItem';
import {StockLabel} from '../../src/domain/stock-management/common/value-objects/StockLabel';
import {StockDescription} from '../../src/domain/stock-management/common/value-objects/StockDescription';
import {stocks_CATEGORY} from '@prisma/client';

/**
 * Factory pour créer des mocks de Stock pour les tests
 * Évite l'utilisation de `as` et garantit le type-safety
 */

export function createMockStock(params?: Partial<{
    id: number;
    label: string;
    description: string;
    category: stocks_CATEGORY | string;
    items: StockItem[];
}>): Stock {
    const stock = new Stock(
        params?.id ?? 1,
        params?.label ? new StockLabel(params.label) : new StockLabel('Mock Stock'),
        params?.description ? new StockDescription(params.description) : new StockDescription('Mock Description'),
        params?.category ?? stocks_CATEGORY.alimentation,
        params?.items ?? []
    );
    return stock;
}

export function createMockStockItem(params?: Partial<{
    id: number;
    label: string;
    quantity: number;
    description: string;
    minimumStock: number;
    stockId: number;
}>): StockItem {
    return new StockItem(
        params?.id ?? 1,
        params?.label ?? 'Mock Item',
        params?.quantity ?? 10,
        params?.description ?? 'Mock Item Description',
        params?.minimumStock ?? 5,
        params?.stockId ?? 1
    );
}

export function createMockStockWithItems(stockParams?: Parameters<typeof createMockStock>[0], itemsCount: number = 2): Stock {
    const items: StockItem[] = [];
    for (let i = 0; i < itemsCount; i++) {
        items.push(createMockStockItem({
            id: i + 1,
            label: `Item ${i + 1}`,
            quantity: 10 + i * 5,
            minimumStock: 5,
            stockId: stockParams?.id ?? 1
        }));
    }

    return createMockStock({
        ...stockParams,
        items
    });
}
