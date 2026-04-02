export class CreateContributionCommand {
  constructor(
    public readonly itemId: number,
    public readonly stockId: number,
    public readonly contributedBy: number,
    public readonly suggestedQuantity: number
  ) {}
}
