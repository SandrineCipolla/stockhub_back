export class UpdateCollaboratorRoleCommand {
  constructor(
    public readonly stockId: number,
    public readonly collaboratorId: number,
    public readonly granterRole: string,
    public readonly newRole: string
  ) {}
}
