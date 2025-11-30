import {AddItemToStockCommand} from "../commands(Request)/AddItemToStockCommand";
import {IStockCommandRepository} from "../repositories/IStockCommandRepository";
import {Stock} from "../../common/entities/Stock";

export class AddItemToStockCommandHandler {
    constructor(private readonly stockRepository: IStockCommandRepository) {
    }

    async handle(command: AddItemToStockCommand): Promise<Stock> {
        try {
            return await this.stockRepository.addItemToStock(command.stockId, {
                label: command.label,
                quantity: command.quantity,
                description: command.description,
                minimumStock: command.minimumStock
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to add item to stock: ${error.message}`);
            }
            throw new Error('Failed to add item to stock: Unknown error');
        }
    }
}
