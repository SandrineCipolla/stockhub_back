import { UpdateItemCommand } from '@domain/stock-management/manipulation/commands(Request)/UpdateItemCommand';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';
import { Stock } from '@domain/stock-management/common/entities/Stock';

export class UpdateItemCommandHandler {
  constructor(private readonly stockRepository: IStockCommandRepository) {}

  async handle(command: UpdateItemCommand): Promise<Stock> {
    return await this.stockRepository.updateItem(command.stockId, command.itemId, {
      label: command.label,
      description: command.description,
      minimumStock: command.minimumStock,
      quantity: command.quantity,
    });
  }
}
