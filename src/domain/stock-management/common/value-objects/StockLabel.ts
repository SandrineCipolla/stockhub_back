export class StockLabel {
    private readonly value: string;

    private static readonly MIN_LENGTH = 3;
    private static readonly MAX_LENGTH = 50;

    constructor(label: string) {
        if (typeof label !== "string") {
            throw new Error("Stock label must be a string.");
        }

        const normalized = label.trim();

        if (normalized.length < StockLabel.MIN_LENGTH) {
            throw new Error(
                `Stock label must be at least ${StockLabel.MIN_LENGTH} characters.`
            );
        }

        if (normalized.length > StockLabel.MAX_LENGTH) {
            throw new Error(
                `Stock label must not exceed ${StockLabel.MAX_LENGTH} characters.`
            );
        }

        this.value = normalized;
    }

    public getValue(): string {
        return this.value;
    }
}
