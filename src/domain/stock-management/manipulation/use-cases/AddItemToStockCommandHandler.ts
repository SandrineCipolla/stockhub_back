import { AddItemToStockCommand } from '@domain/stock-management/manipulation/commands/AddItemToStockCommand';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';
import { IItemHistoryRepository } from '@domain/prediction/repositories/IItemHistoryRepository';
import { Stock } from '@domain/stock-management/common/entities/Stock';

export class AddItemToStockCommandHandler {
  constructor(
    private readonly stockRepository: IStockCommandRepository,
    private readonly historyRepository?: IItemHistoryRepository
  ) {}

  async handle(command: AddItemToStockCommand): Promise<Stock> {
    try {
      const stock = await this.stockRepository.addItemToStock(command.stockId, {
        label: command.label,
        quantity: command.quantity,
        description: command.description,
        minimumStock: command.minimumStock,
      });

      if (this.historyRepository && command.quantity > 0) {
        const newItem = stock.items
          .filter(i => i.label === command.label)
          .reduce((max, i) => (i.id > max.id ? i : max));

        await this.historyRepository.record({
          itemId: newItem.id,
          oldQuantity: 0,
          newQuantity: command.quantity,
          changeType: 'RESTOCK',
          changedBy: command.userId ?? null,
        });
      }

      return stock;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to add item to stock: ${error.message}`);
      }
      throw new Error('Failed to add item to stock: Unknown error');
    }
  }
}
