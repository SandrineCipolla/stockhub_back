import { DeleteStockCommand } from '@domain/stock-management/manipulation/commands(Request)/DeleteStockCommand';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';

export class DeleteStockCommandHandler {
  constructor(private readonly stockRepository: IStockCommandRepository) {}

  async handle(command: DeleteStockCommand): Promise<void> {
    // Verify stock exists
    const existingStock = await this.stockRepository.findById(command.stockId);

    if (!existingStock) {
      throw new Error(`Stock with ID ${command.stockId} not found`);
    }

    // Delete stock (cascade delete will remove items)
    await this.stockRepository.deleteStock(command.stockId);
  }
}
