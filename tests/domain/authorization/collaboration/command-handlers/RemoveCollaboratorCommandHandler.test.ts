import { RemoveCollaboratorCommandHandler } from '@domain/authorization/collaboration/command-handlers/RemoveCollaboratorCommandHandler';
import { RemoveCollaboratorCommand } from '@domain/authorization/collaboration/commands/RemoveCollaboratorCommand';
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

const viewerCollaborator = {
  id: 10,
  stockId: 1,
  userId: 2,
  userEmail: 'viewer@example.com',
  role: 'VIEWER',
  grantedAt: new Date(),
  grantedBy: 1,
};

describe('RemoveCollaboratorCommandHandler', () => {
  it('should remove a collaborator when OWNER removes VIEWER', async () => {
    const repo = makeRepository({
      findById: jest.fn().mockResolvedValue(viewerCollaborator),
      remove: jest.fn().mockResolvedValue(undefined),
    });
    const handler = new RemoveCollaboratorCommandHandler(repo);
    const command = new RemoveCollaboratorCommand(1, 10, 'OWNER');

    await handler.handle(command);

    expect(repo.remove).toHaveBeenCalledWith(10);
  });

  it('should remove a collaborator when EDITOR removes VIEWER_CONTRIBUTOR', async () => {
    const contributor = { ...viewerCollaborator, role: 'VIEWER_CONTRIBUTOR' };
    const repo = makeRepository({
      findById: jest.fn().mockResolvedValue(contributor),
      remove: jest.fn().mockResolvedValue(undefined),
    });
    const handler = new RemoveCollaboratorCommandHandler(repo);
    const command = new RemoveCollaboratorCommand(1, 10, 'EDITOR');

    await handler.handle(command);

    expect(repo.remove).toHaveBeenCalledWith(10);
  });

  it('should throw when collaborator not found', async () => {
    const repo = makeRepository({ findById: jest.fn().mockResolvedValue(null) });
    const handler = new RemoveCollaboratorCommandHandler(repo);
    const command = new RemoveCollaboratorCommand(1, 999, 'OWNER');

    await expect(handler.handle(command)).rejects.toThrow('Collaborator not found');
  });

  it('should throw when EDITOR tries to remove another EDITOR', async () => {
    const editorCollaborator = { ...viewerCollaborator, role: 'EDITOR' };
    const repo = makeRepository({
      findById: jest.fn().mockResolvedValue(editorCollaborator),
    });
    const handler = new RemoveCollaboratorCommandHandler(repo);
    const command = new RemoveCollaboratorCommand(1, 10, 'EDITOR');

    await expect(handler.handle(command)).rejects.toThrow('Forbidden');
    expect(repo.remove).not.toHaveBeenCalled();
  });
});
