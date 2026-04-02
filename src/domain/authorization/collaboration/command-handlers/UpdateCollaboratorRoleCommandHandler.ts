import { UpdateCollaboratorRoleCommand } from '../commands/UpdateCollaboratorRoleCommand';
import { CollaboratorData, ICollaboratorRepository } from '../repositories/ICollaboratorRepository';
import { canActOnRole } from './CollaboratorPermissions';

export class UpdateCollaboratorRoleCommandHandler {
  constructor(private readonly repository: ICollaboratorRepository) {}

  async handle(command: UpdateCollaboratorRoleCommand): Promise<CollaboratorData> {
    const collaborator = await this.repository.findById(command.collaboratorId);
    if (!collaborator || collaborator.stockId !== command.stockId) {
      throw new Error('Collaborator not found');
    }

    if (!canActOnRole(command.granterRole, collaborator.role)) {
      throw new Error(
        `Forbidden - Your role (${command.granterRole}) cannot modify a collaborator with role ${collaborator.role}`
      );
    }

    if (!canActOnRole(command.granterRole, command.newRole)) {
      throw new Error(
        `Forbidden - Your role (${command.granterRole}) cannot assign the role ${command.newRole}`
      );
    }

    return this.repository.updateRole(command.collaboratorId, command.newRole);
  }
}
