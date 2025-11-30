export class AddItemToStockCommand {
    constructor(
        public readonly stockId: number,
        public readonly label: string,
        public readonly quantity: number,
        public readonly description?: string,
        public readonly minimumStock?: number
    ) {}
}
