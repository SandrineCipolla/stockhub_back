import { ReviewContributionCommand } from '@domain/stock-management/manipulation/commands/ReviewContributionCommand';
import { IContributionRepository } from '@domain/stock-management/manipulation/repositories/IContributionRepository';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';
import { ItemContribution } from '@domain/stock-management/common/entities/ItemContribution';

export class ReviewContributionCommandHandler {
  constructor(
    private readonly contributionRepository: IContributionRepository,
    private readonly stockRepository: IStockCommandRepository
  ) {}

  async handle(command: ReviewContributionCommand): Promise<ItemContribution> {
    const contribution = await this.contributionRepository.findById(command.contributionId);

    if (!contribution) {
      throw new Error(`Contribution ${command.contributionId} not found`);
    }

    if (contribution.stockId !== command.stockId) {
      throw new Error('Contribution does not belong to this stock');
    }

    const reviewed =
      command.action === 'approve'
        ? contribution.approve(command.reviewedBy)
        : contribution.reject(command.reviewedBy);

    if (reviewed.status.isApproved()) {
      await this.stockRepository.updateItemQuantity(
        reviewed.stockId,
        reviewed.itemId,
        reviewed.suggestedQuantity
      );
    }

    return this.contributionRepository.update(reviewed);
  }
}
