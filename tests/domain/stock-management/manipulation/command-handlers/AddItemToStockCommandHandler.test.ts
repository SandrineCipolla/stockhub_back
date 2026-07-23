import { AddItemToStockCommandHandler } from '@domain/stock-management/manipulation/use-cases/AddItemToStockCommandHandler';
import { AddItemToStockCommand } from '@domain/stock-management/manipulation/commands/AddItemToStockCommand';
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
          updateItem: jest.fn(),
          updateStock: jest.fn(),
          deleteStock: jest.fn(),
          deleteItem: jest.fn(),
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
          note: undefined,
        });
        expect(result).toBe(mockStock);
      });
    });

    describe('when the command includes a note', () => {
      it('should pass the note through to the repository', async () => {
        const item = new StockItem(1, 'Tomates', 10, 'Tomates fraîches', 2, 1);
        const mockStock = new Stock(1, 'Stock Cuisine', 'Description', 'alimentation', [item]);

        const mockRepository: IStockCommandRepository = {
          save: jest.fn(),
          findById: jest.fn(),
          addItemToStock: jest.fn().mockResolvedValue(mockStock),
          updateItemQuantity: jest.fn(),
          updateItem: jest.fn(),
          updateStock: jest.fn(),
          deleteStock: jest.fn(),
          deleteItem: jest.fn(),
        };

        const handler = new AddItemToStockCommandHandler(mockRepository);
        const command = new AddItemToStockCommand(
          1,
          'Tomates',
          10,
          'Tomates fraîches',
          2,
          undefined,
          'Marque préférée'
        );

        await handler.handle(command);

        expect(mockRepository.addItemToStock).toHaveBeenCalledWith(1, {
          label: 'Tomates',
          quantity: 10,
          description: 'Tomates fraîches',
          minimumStock: 2,
          note: 'Marque préférée',
        });
      });
    });
  });
});
