export class CreateStockCommand {
    constructor(
        public readonly label: string,
        public readonly description: string,
        public readonly category: string,
        public readonly userId: number
    ) {}
}
