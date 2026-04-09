import { CreateContributionCommandHandler } from '@domain/stock-management/manipulation/use-cases/CreateContributionCommandHandler';
import { CreateContributionCommand } from '@domain/stock-management/manipulation/commands/CreateContributionCommand';
import { IContributionRepository } from '@domain/stock-management/manipulation/repositories/IContributionRepository';
import { ItemContribution } from '@domain/stock-management/common/entities/ItemContribution';

describe('CreateContributionCommandHandler', () => {
  describe('handle()', () => {
    it('should create and save a pending contribution', async () => {
      const savedContribution = ItemContribution.create({
        itemId: 1,
        stockId: 10,
        contributedBy: 99,
        suggestedQuantity: 5,
      });

      const mockRepository: IContributionRepository = {
        save: jest.fn().mockResolvedValue(savedContribution),
        findById: jest.fn(),
        findPendingByStockId: jest.fn(),
        countPendingForUser: jest.fn().mockResolvedValue(0),
        update: jest.fn(),
      };

      const handler = new CreateContributionCommandHandler(mockRepository);
      const command = new CreateContributionCommand(1, 10, 99, 5);

      const result = await handler.handle(command);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          itemId: 1,
          stockId: 10,
          contributedBy: 99,
          suggestedQuantity: 5,
        })
      );
      expect(result.status.isPending()).toBe(true);
    });
  });
});
