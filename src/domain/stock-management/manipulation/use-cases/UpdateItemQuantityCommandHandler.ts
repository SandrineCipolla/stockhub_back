import { UpdateItemQuantityCommand } from '@domain/stock-management/manipulation/commands/UpdateItemQuantityCommand';
import { IStockCommandRepository } from '@domain/stock-management/manipulation/repositories/IStockCommandRepository';
import { IItemHistoryRepository } from '@domain/prediction/repositories/IItemHistoryRepository';
import { Stock } from '@domain/stock-management/common/entities/Stock';

export class UpdateItemQuantityCommandHandler {
  constructor(
    private readonly stockRepository: IStockCommandRepository,
    private readonly historyRepository?: IItemHistoryRepository
  ) {}

  async handle(command: UpdateItemQuantityCommand): Promise<Stock> {
    if (this.historyRepository) {
      const current = await this.stockRepository.findById(command.stockId);
      const currentItem = current?.items.find(i => i.id === command.itemId);

      if (currentItem && currentItem.quantity !== command.newQuantity) {
        const oldQty = currentItem.quantity ?? 0;
        const newQty = command.newQuantity;
        const changeType = newQty < oldQty ? 'CONSUMPTION' : 'RESTOCK';

        await this.historyRepository.record({
          itemId: command.itemId,
          oldQuantity: oldQty,
          newQuantity: newQty,
          changeType,
          changedBy: command.userId ?? null,
        });
      }
    }

    return await this.stockRepository.updateItemQuantity(
      command.stockId,
      command.itemId,
      command.newQuantity
    );
  }
}
