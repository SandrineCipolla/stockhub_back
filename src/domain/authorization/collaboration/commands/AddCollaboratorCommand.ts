export class AddCollaboratorCommand {
  constructor(
    public readonly stockId: number,
    public readonly granterEmail: string,
    public readonly granterRole: string,
    public readonly targetEmail: string,
    public readonly role: string
  ) {}
}
