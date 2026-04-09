import { UpdateItemCommand } from '@domain/stock-management/manipulation/commands/UpdateItemCommand';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';
import { IItemHistoryRepository } from '@domain/prediction/repositories/IItemHistoryRepository';
import { Stock } from '@domain/stock-management/common/entities/Stock';

export class UpdateItemCommandHandler {
  constructor(
    private readonly stockRepository: IStockCommandRepository,
    private readonly historyRepository?: IItemHistoryRepository
  ) {}

  async handle(command: UpdateItemCommand): Promise<Stock> {
    if (this.historyRepository && command.quantity !== undefined) {
      const current = await this.stockRepository.findById(command.stockId);
      const currentItem = current?.items.find(i => i.id === command.itemId);

      if (currentItem && currentItem.quantity !== command.quantity) {
        const oldQty = currentItem.quantity ?? 0;
        const newQty = command.quantity;
        const changeType =
          newQty < oldQty ? 'CONSUMPTION' : newQty > oldQty ? 'RESTOCK' : 'ADJUSTMENT';

        await this.historyRepository.record({
          itemId: command.itemId,
          oldQuantity: oldQty,
          newQuantity: newQty,
          changeType,
          changedBy: command.userId ?? null,
        });
      }
    }

    return await this.stockRepository.updateItem(command.stockId, command.itemId, {
      label: command.label,
      description: command.description,
      minimumStock: command.minimumStock,
      quantity: command.quantity,
    });
  }
}
