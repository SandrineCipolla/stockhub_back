import {UpdateItemQuantityCommand} from "../commands(Request)/UpdateItemQuantityCommand";
import {IStockCommandRepository} from "../repositories/IStockCommandRepository";
import {Stock} from "../../common/entities/Stock";

export class UpdateItemQuantityCommandHandler {
    constructor(private readonly stockRepository: IStockCommandRepository) {
    }

    async handle(command: UpdateItemQuantityCommand): Promise<Stock> {
        return await this.stockRepository.updateItemQuantity(
            command.stockId,
            command.itemId,
            command.newQuantity
        );
    }
}
