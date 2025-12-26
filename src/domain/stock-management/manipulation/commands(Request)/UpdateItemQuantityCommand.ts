export class UpdateItemQuantityCommand {
  constructor(
    public readonly stockId: number,
    public readonly itemId: number,
    public readonly newQuantity: number
  ) {}
}
