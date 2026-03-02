import { DeleteItemCommand } from '@domain/stock-management/manipulation/commands(Request)/DeleteItemCommand';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';

export class DeleteItemCommandHandler {
  constructor(private readonly stockRepository: IStockCommandRepository) {}

  async handle(command: DeleteItemCommand): Promise<void> {
    const stock = await this.stockRepository.findById(command.stockId);

    if (!stock) {
      throw new Error(`Stock with ID ${command.stockId} not found`);
    }

    const item = stock.getItemById(command.itemId);

    if (!item) {
      throw new Error(`Item with ID ${command.itemId} not found in stock ${command.stockId}`);
    }

    await this.stockRepository.deleteItem(command.stockId, command.itemId);
  }
}
