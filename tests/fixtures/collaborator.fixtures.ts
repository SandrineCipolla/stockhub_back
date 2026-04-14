import { CollaboratorData } from '@domain/authorization/collaboration/repositories/ICollaboratorRepository';

export const makeCollaborator = (overrides: Partial<CollaboratorData> = {}): CollaboratorData => ({
  id: 1,
  stockId: 2,
  userId: 10,
  userEmail: 'collab@test.com',
  role: 'EDITOR',
  grantedAt: new Date('2026-04-10'),
  grantedBy: 5,
  ...overrides,
});
