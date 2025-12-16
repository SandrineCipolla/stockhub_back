import {
    UpdateItemQuantityCommandHandler
} from "@domain/stock-management/manipulation/command-handlers(UseCase)/UpdateItemQuantityCommandHandler";
import {
    UpdateItemQuantityCommand
} from "@domain/stock-management/manipulation/commands(Request)/UpdateItemQuantityCommand";
import {
    IStockCommandRepository
} from "@domain/stock-management/manipulation/repositories/IStockCommandRepository";
import {Stock} from "@domain/stock-management/common/entities/Stock";
import {StockItem} from "@domain/stock-management/common/entities/StockItem";

describe('UpdateItemQuantityCommandHandler', () => {
    describe('handle()', () => {
        describe('when handling a valid UpdateItemQuantityCommand', () => {
            it('should update item quantity via repository', async () => {
                const item = new StockItem(1, 'Tomates', 25, 'Description', 2, 1);
                const mockStock = new Stock(1, 'Stock Cuisine', 'Description', 'alimentation', [item]);

                const mockRepository: IStockCommandRepository = {
                    save: jest.fn(),
                    findById: jest.fn(),
                    addItemToStock: jest.fn(),
                    updateItemQuantity: jest.fn().mockResolvedValue(mockStock)
                };

                const handler = new UpdateItemQuantityCommandHandler(mockRepository);
                const command = new UpdateItemQuantityCommand(1, 1, 25);

                const result = await handler.handle(command);

                expect(mockRepository.updateItemQuantity).toHaveBeenCalledTimes(1);
                expect(mockRepository.updateItemQuantity).toHaveBeenCalledWith(1, 1, 25);
                expect(result).toBe(mockStock);
            })
        })

        describe('when updating to zero quantity', () => {
            it('should pass zero to repository', async () => {
                const mockStock = new Stock(1, 'Stock Cuisine', 'Description', 'alimentation', []);

                const mockRepository: IStockCommandRepository = {
                    save: jest.fn(),
                    findById: jest.fn(),
                    addItemToStock: jest.fn(),
                    updateItemQuantity: jest.fn().mockResolvedValue(mockStock)
                };

                const handler = new UpdateItemQuantityCommandHandler(mockRepository);
                const command = new UpdateItemQuantityCommand(1, 1, 0);

                await handler.handle(command);

                expect(mockRepository.updateItemQuantity).toHaveBeenCalledWith(1, 1, 0);
            })
        })


    })
})
