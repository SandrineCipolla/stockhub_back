import { RemoveCollaboratorCommand } from '../commands/RemoveCollaboratorCommand';
import { ICollaboratorRepository } from '../repositories/ICollaboratorRepository';
import { canActOnRole } from './CollaboratorPermissions';

export class RemoveCollaboratorCommandHandler {
  constructor(private readonly repository: ICollaboratorRepository) {}

  async handle(command: RemoveCollaboratorCommand): Promise<void> {
    const collaborator = await this.repository.findById(command.collaboratorId);
    if (!collaborator || collaborator.stockId !== command.stockId) {
      throw new Error('Collaborator not found');
    }

    if (!canActOnRole(command.granterRole, collaborator.role)) {
      throw new Error(
        `Forbidden - Your role (${command.granterRole}) cannot remove a collaborator with role ${collaborator.role}`
      );
    }

    await this.repository.remove(command.collaboratorId);
  }
}
