import { UpdateItemCommandHandler } from '@domain/stock-management/manipulation/use-cases/UpdateItemCommandHandler';
import { UpdateItemCommand } from '@domain/stock-management/manipulation/commands/UpdateItemCommand';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';
import { Stock } from '@domain/stock-management/common/entities/Stock';
import { StockItem } from '@domain/stock-management/common/entities/StockItem';

describe('UpdateItemCommandHandler', () => {
  describe('handle()', () => {
    const createMockRepository = (
      overrides: Partial<IStockCommandRepository> = {}
    ): IStockCommandRepository => ({
      save: jest.fn(),
      findById: jest.fn(),
      addItemToStock: jest.fn(),
      updateItemQuantity: jest.fn(),
      updateItem: jest.fn(),
      updateStock: jest.fn(),
      deleteStock: jest.fn(),
      deleteItem: jest.fn(),
      ...overrides,
    });

    describe('when updating label, description and minimumStock', () => {
      it('should call updateItem on the repository with correct arguments', async () => {
        const item = new StockItem(1, 'Tomates', 10, 'Tomates fraîches', 2, 1);
        const mockStock = new Stock(1, 'Stock Cuisine', 'Description', 'alimentation', [item]);

        const mockRepository = createMockRepository({
          updateItem: jest.fn().mockResolvedValue(mockStock),
        });

        const handler = new UpdateItemCommandHandler(mockRepository);
        const command = new UpdateItemCommand(1, 1, 'Tomates bio', 'Tomates bio du marché', 5);

        const result = await handler.handle(command);

        expect(mockRepository.updateItem).toHaveBeenCalledTimes(1);
        expect(mockRepository.updateItem).toHaveBeenCalledWith(1, 1, {
          label: 'Tomates bio',
          description: 'Tomates bio du marché',
          minimumStock: 5,
          quantity: undefined,
        });
        expect(result).toBe(mockStock);
      });
    });

    describe('when updating quantity only (backward compatibility)', () => {
      it('should call updateItem with quantity only', async () => {
        const item = new StockItem(1, 'Tomates', 25, 'Description', 2, 1);
        const mockStock = new Stock(1, 'Stock Cuisine', 'Description', 'alimentation', [item]);

        const mockRepository = createMockRepository({
          updateItem: jest.fn().mockResolvedValue(mockStock),
        });

        const handler = new UpdateItemCommandHandler(mockRepository);
        const command = new UpdateItemCommand(1, 1, undefined, undefined, undefined, 25);

        const result = await handler.handle(command);

        expect(mockRepository.updateItem).toHaveBeenCalledWith(1, 1, {
          label: undefined,
          description: undefined,
          minimumStock: undefined,
          quantity: 25,
        });
        expect(result).toBe(mockStock);
      });
    });

    describe('when updating all fields', () => {
      it('should call updateItem with all fields', async () => {
        const item = new StockItem(1, 'Tomates', 50, 'Tomates bio', 10, 1);
        const mockStock = new Stock(1, 'Stock Cuisine', 'Description', 'alimentation', [item]);

        const mockRepository = createMockRepository({
          updateItem: jest.fn().mockResolvedValue(mockStock),
        });

        const handler = new UpdateItemCommandHandler(mockRepository);
        const command = new UpdateItemCommand(1, 1, 'Tomates bio', 'Tomates bio du marché', 10, 50);

        await handler.handle(command);

        expect(mockRepository.updateItem).toHaveBeenCalledWith(1, 1, {
          label: 'Tomates bio',
          description: 'Tomates bio du marché',
          minimumStock: 10,
          quantity: 50,
        });
      });
    });

    describe('when updating with empty body', () => {
      it('should call updateItem with all undefined fields', async () => {
        const mockStock = new Stock(1, 'Stock Cuisine', 'Description', 'alimentation', []);

        const mockRepository = createMockRepository({
          updateItem: jest.fn().mockResolvedValue(mockStock),
        });

        const handler = new UpdateItemCommandHandler(mockRepository);
        const command = new UpdateItemCommand(1, 1);

        await handler.handle(command);

        expect(mockRepository.updateItem).toHaveBeenCalledWith(1, 1, {
          label: undefined,
          description: undefined,
          minimumStock: undefined,
          quantity: undefined,
        });
      });
    });
  });
});
