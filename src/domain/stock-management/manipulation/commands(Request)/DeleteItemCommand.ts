export class DeleteItemCommand {
  constructor(
    public readonly stockId: number,
    public readonly itemId: number
  ) {}
}
