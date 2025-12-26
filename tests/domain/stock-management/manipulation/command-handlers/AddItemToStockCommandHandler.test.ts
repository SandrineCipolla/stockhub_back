import { AddItemToStockCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/AddItemToStockCommandHandler';
import { AddItemToStockCommand } from '@domain/stock-management/manipulation/commands(Request)/AddItemToStockCommand';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';
import { Stock } from '@domain/stock-management/common/entities/Stock';
import { StockItem } from '@domain/stock-management/common/entities/StockItem';

describe('AddItemToStockCommandHandler', () => {
  describe('handle()', () => {
    describe('when handling a valid AddItemToStockCommand', () => {
      it('should add item to stock via repository', async () => {
        const item = new StockItem(1, 'Tomates', 10, 'Tomates fraîches', 2, 1);
        const mockStock = new Stock(1, 'Stock Cuisine', 'Description', 'alimentation', [item]);

        const mockRepository: IStockCommandRepository = {
          save: jest.fn(),
          findById: jest.fn(),
          addItemToStock: jest.fn().mockResolvedValue(mockStock),
          updateItemQuantity: jest.fn(),
        };

        const handler = new AddItemToStockCommandHandler(mockRepository);
        const command = new AddItemToStockCommand(1, 'Tomates', 10, 'Tomates fraîches', 2);

        const result = await handler.handle(command);

        expect(mockRepository.addItemToStock).toHaveBeenCalledTimes(1);
        expect(mockRepository.addItemToStock).toHaveBeenCalledWith(1, {
          label: 'Tomates',
          quantity: 10,
          description: 'Tomates fraîches',
          minimumStock: 2,
        });
        expect(result).toBe(mockStock);
      });
    });
  });
});
