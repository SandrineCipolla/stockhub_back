import { UpdateCollaboratorRoleCommandHandler } from '@domain/authorization/collaboration/command-handlers/UpdateCollaboratorRoleCommandHandler';
import { UpdateCollaboratorRoleCommand } from '@domain/authorization/collaboration/commands/UpdateCollaboratorRoleCommand';
import { ICollaboratorRepository } from '@domain/authorization/collaboration/repositories/ICollaboratorRepository';

const makeRepository = (
  overrides: Partial<ICollaboratorRepository> = {}
): ICollaboratorRepository => ({
  findByStockId: jest.fn(),
  findById: jest.fn(),
  findUserByEmail: jest.fn(),
  isCollaborator: jest.fn(),
  add: jest.fn(),
  updateRole: jest.fn(),
  remove: jest.fn(),
  ...overrides,
});

const existingCollaborator = {
  id: 10,
  stockId: 1,
  userId: 2,
  userEmail: 'viewer@example.com',
  role: 'VIEWER',
  grantedAt: new Date(),
  grantedBy: 1,
};

describe('UpdateCollaboratorRoleCommandHandler', () => {
  it('should update role when OWNER promotes VIEWER to EDITOR', async () => {
    const updated = { ...existingCollaborator, role: 'EDITOR' };
    const repo = makeRepository({
      findById: jest.fn().mockResolvedValue(existingCollaborator),
      updateRole: jest.fn().mockResolvedValue(updated),
    });
    const handler = new UpdateCollaboratorRoleCommandHandler(repo);
    const command = new UpdateCollaboratorRoleCommand(1, 10, 'OWNER', 'EDITOR');

    const result = await handler.handle(command);

    expect(repo.updateRole).toHaveBeenCalledWith(10, 'EDITOR');
    expect(result.role).toBe('EDITOR');
  });

  it('should throw when collaborator not found', async () => {
    const repo = makeRepository({ findById: jest.fn().mockResolvedValue(null) });
    const handler = new UpdateCollaboratorRoleCommandHandler(repo);
    const command = new UpdateCollaboratorRoleCommand(1, 999, 'OWNER', 'VIEWER');

    await expect(handler.handle(command)).rejects.toThrow('Collaborator not found');
  });

  it('should throw when collaborator belongs to different stock', async () => {
    const repo = makeRepository({
      findById: jest.fn().mockResolvedValue({ ...existingCollaborator, stockId: 99 }),
    });
    const handler = new UpdateCollaboratorRoleCommandHandler(repo);
    const command = new UpdateCollaboratorRoleCommand(1, 10, 'OWNER', 'VIEWER');

    await expect(handler.handle(command)).rejects.toThrow('Collaborator not found');
  });

  it('should throw when EDITOR tries to update another EDITOR', async () => {
    const editorCollaborator = { ...existingCollaborator, role: 'EDITOR' };
    const repo = makeRepository({
      findById: jest.fn().mockResolvedValue(editorCollaborator),
    });
    const handler = new UpdateCollaboratorRoleCommandHandler(repo);
    const command = new UpdateCollaboratorRoleCommand(1, 10, 'EDITOR', 'VIEWER');

    await expect(handler.handle(command)).rejects.toThrow('Forbidden');
  });

  it('should throw when OWNER tries to assign OWNER role', async () => {
    const repo = makeRepository({
      findById: jest.fn().mockResolvedValue(existingCollaborator),
    });
    const handler = new UpdateCollaboratorRoleCommandHandler(repo);
    const command = new UpdateCollaboratorRoleCommand(1, 10, 'OWNER', 'OWNER');

    await expect(handler.handle(command)).rejects.toThrow('Forbidden');
  });
});
