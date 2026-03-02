import { DeleteItemCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/DeleteItemCommandHandler';
import { DeleteItemCommand } from '@domain/stock-management/manipulation/commands(Request)/DeleteItemCommand';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';
import { Stock } from '@domain/stock-management/common/entities/Stock';
import { StockItem } from '@domain/stock-management/common/entities/StockItem';

describe('DeleteItemCommandHandler', () => {
  describe('handle()', () => {
    const createMockRepository = (
      overrides: Partial<IStockCommandRepository> = {}
    ): IStockCommandRepository => ({
      save: jest.fn(),
      findById: jest.fn(),
      addItemToStock: jest.fn(),
      updateItemQuantity: jest.fn(),
      updateStock: jest.fn(),
      deleteStock: jest.fn(),
      deleteItem: jest.fn(),
      ...overrides,
    });

    describe('when stock and item exist', () => {
      it('should call deleteItem on the repository', async () => {
        const item = new StockItem(1, 'Tomates', 10, 'Tomates fraîches', 2, 1);
        const mockStock = new Stock(1, 'Stock Cuisine', 'Description', 'alimentation', [item]);

        const mockRepository = createMockRepository({
          findById: jest.fn().mockResolvedValue(mockStock),
          deleteItem: jest.fn().mockResolvedValue(undefined),
        });

        const handler = new DeleteItemCommandHandler(mockRepository);
        const command = new DeleteItemCommand(1, 1);

        await handler.handle(command);

        expect(mockRepository.findById).toHaveBeenCalledWith(1);
        expect(mockRepository.deleteItem).toHaveBeenCalledWith(1, 1);
      });
    });

    describe('when stock does not exist', () => {
      it('should throw an error', async () => {
        const mockRepository = createMockRepository({
          findById: jest.fn().mockResolvedValue(null),
        });

        const handler = new DeleteItemCommandHandler(mockRepository);
        const command = new DeleteItemCommand(99, 1);

        await expect(handler.handle(command)).rejects.toThrow('Stock with ID 99 not found');
        expect(mockRepository.deleteItem).not.toHaveBeenCalled();
      });
    });

    describe('when item does not exist in the stock', () => {
      it('should throw an error', async () => {
        const item = new StockItem(1, 'Tomates', 10, 'Tomates fraîches', 2, 1);
        const mockStock = new Stock(1, 'Stock Cuisine', 'Description', 'alimentation', [item]);

        const mockRepository = createMockRepository({
          findById: jest.fn().mockResolvedValue(mockStock),
        });

        const handler = new DeleteItemCommandHandler(mockRepository);
        const command = new DeleteItemCommand(1, 99);

        await expect(handler.handle(command)).rejects.toThrow(
          'Item with ID 99 not found in stock 1'
        );
        expect(mockRepository.deleteItem).not.toHaveBeenCalled();
      });
    });
  });
});
