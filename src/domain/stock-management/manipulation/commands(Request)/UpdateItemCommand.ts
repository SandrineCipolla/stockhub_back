export class UpdateItemCommand {
  constructor(
    public readonly stockId: number,
    public readonly itemId: number,
    public readonly label?: string,
    public readonly description?: string,
    public readonly minimumStock?: number,
    public readonly quantity?: number,
    public readonly userId?: string
  ) {}
}
