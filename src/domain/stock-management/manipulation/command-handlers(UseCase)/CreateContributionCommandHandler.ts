import { CreateContributionCommand } from '@domain/stock-management/manipulation/commands(Request)/CreateContributionCommand';
import { IContributionRepository } from '@domain/stock-management/manipulation/repositories/IContributionRepository';
import { ItemContribution } from '@domain/stock-management/common/entities/ItemContribution';

export class CreateContributionCommandHandler {
  constructor(private readonly contributionRepository: IContributionRepository) {}

  async handle(command: CreateContributionCommand): Promise<ItemContribution> {
    const contribution = ItemContribution.create({
      itemId: command.itemId,
      stockId: command.stockId,
      contributedBy: command.contributedBy,
      suggestedQuantity: command.suggestedQuantity,
    });

    return this.contributionRepository.save(contribution);
  }
}
