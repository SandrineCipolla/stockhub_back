export type ReviewAction = 'approve' | 'reject';

export class ReviewContributionCommand {
  constructor(
    public readonly contributionId: number,
    public readonly stockId: number,
    public readonly reviewedBy: number,
    public readonly action: ReviewAction
  ) {}
}
