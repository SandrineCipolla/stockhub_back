import {Stock} from "../models";

export function createUpdatedItemQuantity(itemID: number, quantity: number): Partial<Stock> {
    return {
        id: itemID,
        quantity: quantity,
    };
}