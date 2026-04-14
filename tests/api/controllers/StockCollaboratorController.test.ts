import { Response } from 'express';
import { StockCollaboratorController } from '@api/controllers/StockCollaboratorController';
import { ICollaboratorRepository } from '@domain/authorization/collaboration/repositories/ICollaboratorRepository';
import { AddCollaboratorCommandHandler } from '@domain/authorization/collaboration/command-handlers/AddCollaboratorCommandHandler';
import { UpdateCollaboratorRoleCommandHandler } from '@domain/authorization/collaboration/command-handlers/UpdateCollaboratorRoleCommandHandler';
import { RemoveCollaboratorCommandHandler } from '@domain/authorization/collaboration/command-handlers/RemoveCollaboratorCommandHandler';
import { HTTP_CODE_CREATED, HTTP_CODE_OK } from '@utils/httpCodes';
import { AuthorizedRequest } from '@authorization/authorizeMiddleware';
import {
  AddCollaboratorRequest,
  UpdateCollaboratorRequest,
  RemoveCollaboratorRequest,
} from '@api/types/StockRequestTypes';
import { makeCollaborator } from '../../fixtures/collaborator.fixtures';

jest.mock('@utils/logger', () => ({
  rootController: { getChildCategory: () => ({ info: jest.fn(), error: jest.fn() }) },
}));

describe('StockCollaboratorController', () => {
  let controller: StockCollaboratorController;
  let req: Partial<AuthorizedRequest>;
  let res: jest.Mocked<Response>;
  let mockRepository: jest.Mocked<ICollaboratorRepository>;
  let mockAddHandler: jest.Mocked<Pick<AddCollaboratorCommandHandler, 'handle'>>;
  let mockUpdateHandler: jest.Mocked<Pick<UpdateCollaboratorRoleCommandHandler, 'handle'>>;
  let mockRemoveHandler: jest.Mocked<Pick<RemoveCollaboratorCommandHandler, 'handle'>>;

  beforeEach(() => {
    mockRepository = {
      findByStockId: jest.fn(),
      findById: jest.fn(),
      findUserByEmail: jest.fn(),
      isCollaborator: jest.fn(),
      add: jest.fn(),
      updateRole: jest.fn(),
      remove: jest.fn(),
    };

    mockAddHandler = { handle: jest.fn() };
    mockUpdateHandler = { handle: jest.fn() };
    mockRemoveHandler = { handle: jest.fn() };

    controller = new StockCollaboratorController(
      mockRepository,
      mockAddHandler as unknown as AddCollaboratorCommandHandler,
      mockUpdateHandler as unknown as UpdateCollaboratorRoleCommandHandler,
      mockRemoveHandler as unknown as RemoveCollaboratorCommandHandler
    );

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as jest.Mocked<Response>;

    jest.clearAllMocks();
  });

  describe('listCollaborators', () => {
    describe('nominal case', () => {
      it('should return 200 with the collaborators list', async () => {
        const collaborators = [
          makeCollaborator(),
          makeCollaborator({ id: 2, userEmail: 'other@test.com' }),
        ];
        mockRepository.findByStockId.mockResolvedValue(collaborators);

        req = { params: { stockId: '2' } };

        await controller.listCollaborators(req as AuthorizedRequest, res);

        expect(mockRepository.findByStockId).toHaveBeenCalledWith(2);
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith(collaborators);
      });
    });

    describe('error case', () => {
      it('should return 500 when the repository throws', async () => {
        mockRepository.findByStockId.mockRejectedValue(new Error('DB error'));

        req = { params: { stockId: '2' } };

        await controller.listCollaborators(req as AuthorizedRequest, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      });
    });
  });

  describe('addCollaborator', () => {
    describe('nominal case', () => {
      it('should return 201 with the added collaborator', async () => {
        const collaborator = makeCollaborator();
        mockAddHandler.handle.mockResolvedValue(collaborator);

        req = {
          params: { stockId: '2' },
          body: { email: 'collab@test.com', role: 'EDITOR' },
          userID: 'owner@test.com',
          stockRole: 'OWNER',
        };

        await controller.addCollaborator(req as AddCollaboratorRequest & AuthorizedRequest, res);

        expect(mockAddHandler.handle).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_CREATED);
        expect(res.json).toHaveBeenCalledWith(collaborator);
      });
    });

    describe('validation', () => {
      it('should return 400 when email is missing', async () => {
        req = {
          params: { stockId: '2' },
          body: { role: 'EDITOR' },
          userID: 'owner@test.com',
          stockRole: 'OWNER',
        };

        await controller.addCollaborator(req as AddCollaboratorRequest & AuthorizedRequest, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'email and role are required' });
        expect(mockAddHandler.handle).not.toHaveBeenCalled();
      });

      it('should return 400 when role is missing', async () => {
        req = {
          params: { stockId: '2' },
          body: { email: 'collab@test.com' },
          userID: 'owner@test.com',
          stockRole: 'OWNER',
        };

        await controller.addCollaborator(req as AddCollaboratorRequest & AuthorizedRequest, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'email and role are required' });
      });
    });

    describe('error cases', () => {
      it('should return 403 when the handler throws a Forbidden error', async () => {
        mockAddHandler.handle.mockRejectedValue(new Error('Forbidden: insufficient role'));

        req = {
          params: { stockId: '2' },
          body: { email: 'collab@test.com', role: 'EDITOR' },
          userID: 'viewer@test.com',
          stockRole: 'VIEWER',
        };

        await controller.addCollaborator(req as AddCollaboratorRequest & AuthorizedRequest, res);

        expect(res.status).toHaveBeenCalledWith(403);
      });

      it('should return 400 when the handler throws a not found error', async () => {
        mockAddHandler.handle.mockRejectedValue(new Error('User not found'));

        req = {
          params: { stockId: '2' },
          body: { email: 'unknown@test.com', role: 'EDITOR' },
          userID: 'owner@test.com',
          stockRole: 'OWNER',
        };

        await controller.addCollaborator(req as AddCollaboratorRequest & AuthorizedRequest, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return 500 for unexpected errors', async () => {
        mockAddHandler.handle.mockRejectedValue(new Error('Unexpected failure'));

        req = {
          params: { stockId: '2' },
          body: { email: 'collab@test.com', role: 'EDITOR' },
          userID: 'owner@test.com',
          stockRole: 'OWNER',
        };

        await controller.addCollaborator(req as AddCollaboratorRequest & AuthorizedRequest, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      });
    });
  });

  describe('updateCollaboratorRole', () => {
    describe('nominal case', () => {
      it('should return 200 with the updated collaborator', async () => {
        const updated = makeCollaborator({ role: 'VIEWER' });
        mockUpdateHandler.handle.mockResolvedValue(updated);

        req = {
          params: { stockId: '2', collaboratorId: '1' },
          body: { role: 'VIEWER' },
          stockRole: 'OWNER',
        };

        await controller.updateCollaboratorRole(
          req as UpdateCollaboratorRequest & AuthorizedRequest,
          res
        );

        expect(mockUpdateHandler.handle).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith(updated);
      });
    });

    describe('validation', () => {
      it('should return 400 when collaboratorId is not a number', async () => {
        req = {
          params: { stockId: '2', collaboratorId: 'abc' },
          body: { role: 'VIEWER' },
          stockRole: 'OWNER',
        };

        await controller.updateCollaboratorRole(
          req as UpdateCollaboratorRequest & AuthorizedRequest,
          res
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid collaborator ID' });
        expect(mockUpdateHandler.handle).not.toHaveBeenCalled();
      });

      it('should return 400 when role is missing', async () => {
        req = { params: { stockId: '2', collaboratorId: '1' }, body: {}, stockRole: 'OWNER' };

        await controller.updateCollaboratorRole(
          req as UpdateCollaboratorRequest & AuthorizedRequest,
          res
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'role is required' });
      });
    });

    describe('error cases', () => {
      it('should return 403 when the handler throws a Forbidden error', async () => {
        mockUpdateHandler.handle.mockRejectedValue(new Error('Forbidden: insufficient role'));

        req = {
          params: { stockId: '2', collaboratorId: '1' },
          body: { role: 'VIEWER' },
          stockRole: 'EDITOR',
        };

        await controller.updateCollaboratorRole(
          req as UpdateCollaboratorRequest & AuthorizedRequest,
          res
        );

        expect(res.status).toHaveBeenCalledWith(403);
      });

      it('should return 404 when the handler throws a not found error', async () => {
        mockUpdateHandler.handle.mockRejectedValue(new Error('Collaborator not found'));

        req = {
          params: { stockId: '2', collaboratorId: '99' },
          body: { role: 'VIEWER' },
          stockRole: 'OWNER',
        };

        await controller.updateCollaboratorRole(
          req as UpdateCollaboratorRequest & AuthorizedRequest,
          res
        );

        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should return 500 for unexpected errors', async () => {
        mockUpdateHandler.handle.mockRejectedValue(new Error('Unexpected failure'));

        req = {
          params: { stockId: '2', collaboratorId: '1' },
          body: { role: 'VIEWER' },
          stockRole: 'OWNER',
        };

        await controller.updateCollaboratorRole(
          req as UpdateCollaboratorRequest & AuthorizedRequest,
          res
        );

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      });
    });
  });

  describe('removeCollaborator', () => {
    describe('nominal case', () => {
      it('should return 204 on successful removal', async () => {
        mockRemoveHandler.handle.mockResolvedValue(undefined);

        req = { params: { stockId: '2', collaboratorId: '1' }, stockRole: 'OWNER' };

        await controller.removeCollaborator(
          req as RemoveCollaboratorRequest & AuthorizedRequest,
          res
        );

        expect(mockRemoveHandler.handle).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
      });
    });

    describe('validation', () => {
      it('should return 400 when collaboratorId is not a number', async () => {
        req = { params: { stockId: '2', collaboratorId: 'abc' }, stockRole: 'OWNER' };

        await controller.removeCollaborator(
          req as RemoveCollaboratorRequest & AuthorizedRequest,
          res
        );

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid collaborator ID' });
        expect(mockRemoveHandler.handle).not.toHaveBeenCalled();
      });
    });

    describe('error cases', () => {
      it('should return 403 when the handler throws a Forbidden error', async () => {
        mockRemoveHandler.handle.mockRejectedValue(new Error('Forbidden: insufficient role'));

        req = { params: { stockId: '2', collaboratorId: '1' }, stockRole: 'EDITOR' };

        await controller.removeCollaborator(
          req as RemoveCollaboratorRequest & AuthorizedRequest,
          res
        );

        expect(res.status).toHaveBeenCalledWith(403);
      });

      it('should return 404 when the handler throws a not found error', async () => {
        mockRemoveHandler.handle.mockRejectedValue(new Error('Collaborator not found'));

        req = { params: { stockId: '2', collaboratorId: '99' }, stockRole: 'OWNER' };

        await controller.removeCollaborator(
          req as RemoveCollaboratorRequest & AuthorizedRequest,
          res
        );

        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should return 500 for unexpected errors', async () => {
        mockRemoveHandler.handle.mockRejectedValue(new Error('Unexpected failure'));

        req = { params: { stockId: '2', collaboratorId: '1' }, stockRole: 'OWNER' };

        await controller.removeCollaborator(
          req as RemoveCollaboratorRequest & AuthorizedRequest,
          res
        );

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      });
    });
  });
});
