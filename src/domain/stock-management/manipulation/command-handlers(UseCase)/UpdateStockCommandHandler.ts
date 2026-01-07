import { UpdateStockCommand } from '@domain/stock-management/manipulation/commands(Request)/UpdateStockCommand';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';
import { Stock } from '@domain/stock-management/common/entities/Stock';

export class UpdateStockCommandHandler {
  constructor(private readonly stockRepository: IStockCommandRepository) {}

  async handle(command: UpdateStockCommand): Promise<Stock> {
    // Verify stock exists
    const existingStock = await this.stockRepository.findById(command.stockId);

    if (!existingStock) {
      throw new Error(`Stock with ID ${command.stockId} not found`);
    }

    // Update stock with provided fields
    const updatedStock = await this.stockRepository.updateStock(command.stockId, {
      label: command.label,
      description: command.description,
      category: command.category,
    });

    return updatedStock;
  }
}
