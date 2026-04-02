import { AddCollaboratorCommand } from '../commands/AddCollaboratorCommand';
import { CollaboratorData, ICollaboratorRepository } from '../repositories/ICollaboratorRepository';
import { canActOnRole } from './CollaboratorPermissions';

export class AddCollaboratorCommandHandler {
  constructor(private readonly repository: ICollaboratorRepository) {}

  async handle(command: AddCollaboratorCommand): Promise<CollaboratorData> {
    if (!canActOnRole(command.granterRole, command.role)) {
      throw new Error(
        `Forbidden - Your role (${command.granterRole}) cannot grant the role ${command.role}`
      );
    }

    const granter = await this.repository.findUserByEmail(command.granterEmail);
    if (!granter) {
      throw new Error('Granter user not found');
    }

    const target = await this.repository.findUserByEmail(command.targetEmail);
    if (!target) {
      throw new Error(`User not found: ${command.targetEmail}`);
    }

    const alreadyCollaborator = await this.repository.isCollaborator(command.stockId, target.id);
    if (alreadyCollaborator) {
      throw new Error(`User ${command.targetEmail} is already a collaborator on this stock`);
    }

    return this.repository.add(command.stockId, target.id, command.role, granter.id);
  }
}
