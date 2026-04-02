import { AddCollaboratorCommandHandler } from '@domain/authorization/collaboration/command-handlers/AddCollaboratorCommandHandler';
import { AddCollaboratorCommand } from '@domain/authorization/collaboration/commands/AddCollaboratorCommand';
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

const baseCollaborator = {
  id: 10,
  stockId: 1,
  userId: 2,
  userEmail: 'target@example.com',
  role: 'VIEWER',
  grantedAt: new Date(),
  grantedBy: 1,
};

describe('AddCollaboratorCommandHandler', () => {
  it('should add a collaborator when OWNER grants EDITOR', async () => {
    const repo = makeRepository({
      findUserByEmail: jest
        .fn()
        .mockResolvedValueOnce({ id: 1 }) // granter
        .mockResolvedValueOnce({ id: 2 }), // target
      isCollaborator: jest.fn().mockResolvedValue(false),
      add: jest.fn().mockResolvedValue(baseCollaborator),
    });
    const handler = new AddCollaboratorCommandHandler(repo);
    const command = new AddCollaboratorCommand(
      1,
      'owner@example.com',
      'OWNER',
      'target@example.com',
      'EDITOR'
    );

    const result = await handler.handle(command);

    expect(repo.add).toHaveBeenCalledWith(1, 2, 'EDITOR', 1);
    expect(result).toEqual(baseCollaborator);
  });

  it('should add a collaborator when EDITOR grants VIEWER', async () => {
    const repo = makeRepository({
      findUserByEmail: jest.fn().mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 2 }),
      isCollaborator: jest.fn().mockResolvedValue(false),
      add: jest.fn().mockResolvedValue(baseCollaborator),
    });
    const handler = new AddCollaboratorCommandHandler(repo);
    const command = new AddCollaboratorCommand(
      1,
      'editor@example.com',
      'EDITOR',
      'target@example.com',
      'VIEWER'
    );

    await handler.handle(command);

    expect(repo.add).toHaveBeenCalledWith(1, 2, 'VIEWER', 1);
  });

  it('should throw when EDITOR tries to grant EDITOR', async () => {
    const repo = makeRepository();
    const handler = new AddCollaboratorCommandHandler(repo);
    const command = new AddCollaboratorCommand(
      1,
      'editor@example.com',
      'EDITOR',
      'target@example.com',
      'EDITOR'
    );

    await expect(handler.handle(command)).rejects.toThrow('Forbidden');
    expect(repo.findUserByEmail).not.toHaveBeenCalled();
  });

  it('should throw when target user is not found', async () => {
    const repo = makeRepository({
      findUserByEmail: jest.fn().mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce(null),
      isCollaborator: jest.fn().mockResolvedValue(false),
    });
    const handler = new AddCollaboratorCommandHandler(repo);
    const command = new AddCollaboratorCommand(
      1,
      'owner@example.com',
      'OWNER',
      'unknown@example.com',
      'VIEWER'
    );

    await expect(handler.handle(command)).rejects.toThrow('User not found: unknown@example.com');
  });

  it('should throw when user is already a collaborator', async () => {
    const repo = makeRepository({
      findUserByEmail: jest.fn().mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 2 }),
      isCollaborator: jest.fn().mockResolvedValue(true),
    });
    const handler = new AddCollaboratorCommandHandler(repo);
    const command = new AddCollaboratorCommand(
      1,
      'owner@example.com',
      'OWNER',
      'target@example.com',
      'VIEWER'
    );

    await expect(handler.handle(command)).rejects.toThrow('already a collaborator');
  });
});
