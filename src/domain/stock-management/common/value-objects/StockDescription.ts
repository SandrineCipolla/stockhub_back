export class StockDescription {
    private readonly value: string;

    private static readonly MAX_LENGTH = 200;

    constructor(description: string) {
        if (typeof description !== "string") {
            throw new Error("Stock description must be a string.");
        }

        const normalized = description.trim();

        if (normalized.length === 0) {
            throw new Error("Stock description cannot be empty.");
        }

        if (normalized.length > StockDescription.MAX_LENGTH) {
            throw new Error(
                `Stock description must not exceed ${StockDescription.MAX_LENGTH} characters.`
            );
        }

        this.value = normalized;
    }

    public getValue(): string {
        return this.value;
    }
}
