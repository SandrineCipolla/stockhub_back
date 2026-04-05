import { ReviewContributionCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/ReviewContributionCommandHandler';
import { ReviewContributionCommand } from '@domain/stock-management/manipulation/commands(Request)/ReviewContributionCommand';
import { IContributionRepository } from '@domain/stock-management/manipulation/repositories/IContributionRepository';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';
import { ItemContribution } from '@domain/stock-management/common/entities/ItemContribution';
import { Stock } from '@domain/stock-management/common/entities/Stock';

const makePendingContribution = () =>
  ItemContribution.create({ itemId: 1, stockId: 10, contributedBy: 99, suggestedQuantity: 5 });

const makeStockRepository = (): IStockCommandRepository => ({
  save: jest.fn(),
  findById: jest.fn(),
  addItemToStock: jest.fn(),
  updateItemQuantity: jest
    .fn()
    .mockResolvedValue(new Stock(10, 'Test', 'desc', 'alimentation', [])),
  updateItem: jest.fn(),
  updateStock: jest.fn(),
  deleteStock: jest.fn(),
  deleteItem: jest.fn(),
});

describe('ReviewContributionCommandHandler', () => {
  describe('approve', () => {
    it('should approve the contribution and update item quantity', async () => {
      const pending = makePendingContribution();
      const approved = pending.approve(42);

      const mockContributionRepo: IContributionRepository = {
        save: jest.fn(),
        findById: jest.fn().mockResolvedValue(pending),
        findPendingByStockId: jest.fn(),
        countPendingForUser: jest.fn().mockResolvedValue(0),
        update: jest.fn().mockResolvedValue(approved),
      };
      const mockStockRepo = makeStockRepository();

      const handler = new ReviewContributionCommandHandler(mockContributionRepo, mockStockRepo);
      const command = new ReviewContributionCommand(pending.id, 10, 42, 'approve');

      const result = await handler.handle(command);

      expect(mockStockRepo.updateItemQuantity).toHaveBeenCalledWith(10, 1, 5);
      expect(mockContributionRepo.update).toHaveBeenCalledTimes(1);
      expect(result.status.isApproved()).toBe(true);
    });
  });

  describe('reject', () => {
    it('should reject the contribution without updating item quantity', async () => {
      const pending = makePendingContribution();
      const rejected = pending.reject(42);

      const mockContributionRepo: IContributionRepository = {
        save: jest.fn(),
        findById: jest.fn().mockResolvedValue(pending),
        findPendingByStockId: jest.fn(),
        countPendingForUser: jest.fn().mockResolvedValue(0),
        update: jest.fn().mockResolvedValue(rejected),
      };
      const mockStockRepo = makeStockRepository();

      const handler = new ReviewContributionCommandHandler(mockContributionRepo, mockStockRepo);
      const command = new ReviewContributionCommand(pending.id, 10, 42, 'reject');

      const result = await handler.handle(command);

      expect(mockStockRepo.updateItemQuantity).not.toHaveBeenCalled();
      expect(mockContributionRepo.update).toHaveBeenCalledTimes(1);
      expect(result.status.isRejected()).toBe(true);
    });
  });

  describe('error cases', () => {
    it('should throw when contribution is not found', async () => {
      const mockContributionRepo: IContributionRepository = {
        save: jest.fn(),
        findById: jest.fn().mockResolvedValue(null),
        findPendingByStockId: jest.fn(),
        countPendingForUser: jest.fn().mockResolvedValue(0),
        update: jest.fn(),
      };

      const handler = new ReviewContributionCommandHandler(
        mockContributionRepo,
        makeStockRepository()
      );
      const command = new ReviewContributionCommand(999, 10, 42, 'approve');

      await expect(handler.handle(command)).rejects.toThrow('Contribution 999 not found');
    });

    it('should throw when contribution belongs to a different stock', async () => {
      const pending = makePendingContribution(); // stockId = 10

      const mockContributionRepo: IContributionRepository = {
        save: jest.fn(),
        findById: jest.fn().mockResolvedValue(pending),
        findPendingByStockId: jest.fn(),
        countPendingForUser: jest.fn().mockResolvedValue(0),
        update: jest.fn(),
      };

      const handler = new ReviewContributionCommandHandler(
        mockContributionRepo,
        makeStockRepository()
      );
      const command = new ReviewContributionCommand(pending.id, 99, 42, 'approve'); // wrong stockId

      await expect(handler.handle(command)).rejects.toThrow(
        'Contribution does not belong to this stock'
      );
    });
  });
});
