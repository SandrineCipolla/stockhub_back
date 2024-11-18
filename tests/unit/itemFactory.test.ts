import { createUpdatedItemQuantity } from '../../src/Utils/itemFactory';

describe('createUpdatedItemQuantity', () => {
    it('should create an object with the correct id and quantity', () => {
        const itemID = 1;
        const quantity = 10;
        const result = createUpdatedItemQuantity(itemID, quantity);

        expect(result).toEqual({
            id: itemID,
            quantity: quantity,
        });
    });
});