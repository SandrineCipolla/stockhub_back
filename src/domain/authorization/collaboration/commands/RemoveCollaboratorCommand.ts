export class RemoveCollaboratorCommand {
  constructor(
    public readonly stockId: number,
    public readonly collaboratorId: number,
    public readonly granterRole: string
  ) {}
}
