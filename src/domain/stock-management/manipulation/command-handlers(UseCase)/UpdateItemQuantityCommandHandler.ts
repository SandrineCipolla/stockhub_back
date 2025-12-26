import { UpdateItemQuantityCommand } from '@domain/stock-management/manipulation/commands(Request)/UpdateItemQuantityCommand';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';
import { Stock } from '@domain/stock-management/common/entities/Stock';

export class UpdateItemQuantityCommandHandler {
  constructor(private readonly stockRepository: IStockCommandRepository) {}

  async handle(command: UpdateItemQuantityCommand): Promise<Stock> {
    return await this.stockRepository.updateItemQuantity(
      command.stockId,
      command.itemId,
      command.newQuantity
    );
  }
}
