import {CreateStockCommand} from "@domain/stock-management/manipulation/commands(Request)/CreateStockCommand";
import {IStockCommandRepository} from "@domain/stock-management/manipulation/repositories/IStockCommandRepository";
import {Stock} from "@domain/stock-management/common/entities/Stock";

export class CreateStockCommandHandler {
    constructor(private readonly stockRepository: IStockCommandRepository) {
    }

    async handle(command: CreateStockCommand): Promise<Stock> {
        const stock = Stock.create({
            label: command.label,
            description: command.description,
            category: command.category,
            userId: command.userId
        });

        return await this.stockRepository.save(stock, command.userId);
    }
}
