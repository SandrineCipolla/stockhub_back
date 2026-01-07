export class UpdateStockCommand {
  constructor(
    public readonly stockId: number,
    public readonly label?: string,
    public readonly description?: string,
    public readonly category?: string
  ) {}
}
