import {
    IStockCommandRepository
} from "../../../../../src/domain/stock-management/manipulation/repositories/IStockCommandRepository";
import {Stock} from "../../../../../src/domain/stock-management/common/entities/Stock";
import {
    CreateStockCommandHandler
} from "../../../../../src/domain/stock-management/manipulation/command-handlers(UseCase)/CreateStockCommandHandler";
import {
    CreateStockCommand
} from "../../../../../src/domain/stock-management/manipulation/commands(Request)/CreateStockCommand";

describe('CreateStockCommandHandler', () => {
    describe('handle()', () => {
        describe('when handling a valid CreateStockCommand', () => {
            it('should create stock with correct values and save it via repository', async () => {
                const mockStock = new Stock(1, 'Stock Cuisine', 'Aliments périssables', 'alimentation', []);

                const mockRepository: IStockCommandRepository = {
                    save: jest.fn().mockResolvedValue(mockStock),
                    findById: jest.fn(),
                    addItemToStock: jest.fn(),
                    updateItemQuantity: jest.fn()
                };

                const handler = new CreateStockCommandHandler(mockRepository);
                const command = new CreateStockCommand(
                    'Stock Cuisine',
                    'Aliments périssables',
                    'alimentation',
                    123
                );

                const result = await handler.handle(command);

                expect(mockRepository.save).toHaveBeenCalledTimes(1);
                expect(mockRepository.save).toHaveBeenCalledWith(
                    expect.objectContaining({
                        category: 'alimentation'
                    }),
                    123
                );
                expect(result).toBe(mockStock);
            })
        })

    })
})
