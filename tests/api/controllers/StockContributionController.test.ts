import { Response } from 'express';
import { StockContributionController } from '@api/controllers/StockContributionController';
import { sendError } from '@api/errors';
import { CreateContributionCommandHandler } from '@domain/stock-management/manipulation/use-cases/CreateContributionCommandHandler';
import { ReviewContributionCommandHandler } from '@domain/stock-management/manipulation/use-cases/ReviewContributionCommandHandler';
import { IContributionRepository } from '@domain/stock-management/manipulation/repositories/IContributionRepository';
import { UserService } from '@domain/user/services/UserService';
import { HTTP_CODE_CREATED, HTTP_CODE_OK } from '@utils/httpCodes';
import { AuthenticatedRequest } from '@api/types/AuthenticatedRequest';
import { CreateContributionRequest, ReviewContributionRequest } from '@api/types/StockRequestTypes';
import { ContributionStatus } from '@domain/stock-management/common/value-objects/ContributionStatus';
import { makeContribution } from '../../fixtures/contribution.fixtures';

jest.mock('@api/errors', () => ({ sendError: jest.fn() }));
jest.mock('@utils/cloudLogger', () => ({ rootException: jest.fn() }));
jest.mock('@utils/logger', () => ({
  rootMain: { info: jest.fn(), error: jest.fn() },
}));

describe('StockContributionController', () => {
  let controller: StockContributionController;
  let req: Partial<AuthenticatedRequest>;
  let res: jest.Mocked<Response>;
  let mockCreateHandler: jest.Mocked<Pick<CreateContributionCommandHandler, 'handle'>>;
  let mockReviewHandler: jest.Mocked<Pick<ReviewContributionCommandHandler, 'handle'>>;
  let mockContributionRepository: jest.Mocked<IContributionRepository>;
  let mockUserService: jest.Mocked<Pick<UserService, 'convertOIDtoUserID' | 'addUser'>>;

  beforeEach(() => {
    mockCreateHandler = { handle: jest.fn() };
    mockReviewHandler = { handle: jest.fn() };

    mockContributionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findPendingByStockId: jest.fn(),
      update: jest.fn(),
      countPendingForUser: jest.fn(),
    };

    mockUserService = {
      convertOIDtoUserID: jest.fn(),
      addUser: jest.fn(),
    };

    controller = new StockContributionController(
      mockCreateHandler as unknown as CreateContributionCommandHandler,
      mockReviewHandler as unknown as ReviewContributionCommandHandler,
      mockContributionRepository,
      mockUserService as unknown as UserService
    );

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as jest.Mocked<Response>;

    jest.clearAllMocks();
  });

  describe('createContribution', () => {
    describe('nominal case', () => {
      it('should return 201 with the created contribution', async () => {
        const contribution = makeContribution();
        mockUserService.convertOIDtoUserID.mockResolvedValue({ value: 42, empty: false } as never);
        mockCreateHandler.handle.mockResolvedValue(contribution);

        req = {
          userID: 'user@test.com',
          params: { stockId: '2', itemId: '10' },
          body: { suggestedQuantity: 5 },
        };

        await controller.createContribution(req as CreateContributionRequest, res);

        expect(mockUserService.convertOIDtoUserID).toHaveBeenCalledWith('user@test.com');
        expect(mockCreateHandler.handle).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_CREATED);
        expect(res.json).toHaveBeenCalledWith(contribution);
      });
    });

    describe('missing OID', () => {
      it('should return 401 when userID is absent', async () => {
        req = { params: { stockId: '2', itemId: '10' }, body: { suggestedQuantity: 5 } };

        await controller.createContribution(req as CreateContributionRequest, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
        expect(mockCreateHandler.handle).not.toHaveBeenCalled();
      });
    });

    describe('error case', () => {
      it('should call sendError when the handler throws', async () => {
        const error = new Error('DB error');
        mockUserService.convertOIDtoUserID.mockResolvedValue({ value: 42, empty: false } as never);
        mockCreateHandler.handle.mockRejectedValue(error);

        req = {
          userID: 'user@test.com',
          params: { stockId: '2', itemId: '10' },
          body: { suggestedQuantity: 5 },
        };

        await controller.createContribution(req as CreateContributionRequest, res);

        expect(sendError).toHaveBeenCalledWith(res, error);
      });
    });
  });

  describe('getPendingCount', () => {
    describe('nominal case', () => {
      it('should return 200 with the pending count', async () => {
        mockUserService.convertOIDtoUserID.mockResolvedValue({ value: 42, empty: false } as never);
        mockContributionRepository.countPendingForUser.mockResolvedValue(3);

        req = { userID: 'user@test.com' };

        await controller.getPendingCount(req as AuthenticatedRequest, res);

        expect(mockContributionRepository.countPendingForUser).toHaveBeenCalledWith(42);
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith({ count: 3 });
      });
    });

    describe('missing OID', () => {
      it('should return 401 when userID is absent', async () => {
        req = {};

        await controller.getPendingCount(req as AuthenticatedRequest, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
        expect(mockContributionRepository.countPendingForUser).not.toHaveBeenCalled();
      });
    });
  });

  describe('listContributions', () => {
    describe('nominal case', () => {
      it('should return 200 with the contributions list', async () => {
        const contributions = [makeContribution(), makeContribution({ id: 2 })];
        mockContributionRepository.findPendingByStockId.mockResolvedValue(contributions);

        req = { userID: 'user@test.com', params: { stockId: '2' } };

        await controller.listContributions(req as AuthenticatedRequest, res);

        expect(mockContributionRepository.findPendingByStockId).toHaveBeenCalledWith(2);
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith(contributions);
      });
    });

    describe('missing OID', () => {
      it('should return 401 when userID is absent', async () => {
        req = { params: { stockId: '2' } };

        await controller.listContributions(req as AuthenticatedRequest, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
        expect(mockContributionRepository.findPendingByStockId).not.toHaveBeenCalled();
      });
    });
  });

  describe('reviewContribution', () => {
    describe('nominal case', () => {
      it('should return 200 with the reviewed contribution', async () => {
        const contribution = makeContribution({ status: new ContributionStatus('APPROVED') });
        mockUserService.convertOIDtoUserID.mockResolvedValue({ value: 42, empty: false } as never);
        mockReviewHandler.handle.mockResolvedValue(contribution);

        req = {
          userID: 'user@test.com',
          params: { stockId: '2', contributionId: '1' },
          body: { action: 'approve' },
        };

        await controller.reviewContribution(req as ReviewContributionRequest, res);

        expect(mockReviewHandler.handle).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith(contribution);
      });
    });

    describe('missing OID', () => {
      it('should return 401 when userID is absent', async () => {
        req = { params: { stockId: '2', contributionId: '1' }, body: { action: 'approve' } };

        await controller.reviewContribution(req as ReviewContributionRequest, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(mockReviewHandler.handle).not.toHaveBeenCalled();
      });
    });
  });
});
