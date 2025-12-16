import {Stock} from "@core/models";

export function createUpdatedItemQuantity(itemID: number, quantity: number): Partial<Stock> {
    return {
        id: itemID,
        quantity: quantity,
    };
}