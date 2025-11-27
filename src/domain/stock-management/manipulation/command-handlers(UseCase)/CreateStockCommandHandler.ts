import {CreateStockCommand} from "../commands(Request)/CreateStockCommand";
import {IStockCommandRepository} from "../repositories/IStockCommandRepository";
import {Stock} from "../../common/entities/Stock";

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

        return await this.stockRepository.save(stock);
    }
}
