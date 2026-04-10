import { StockControllerVisualization } from '@api/controllers/StockControllerVisualization';
import { CustomError, sendError } from '@api/errors';
import { StockVisualizationService } from '@domain/stock-management/visualization/services/StockVisualizationService';
import {
  StockSummaryDto,
  StockDetailDto,
} from '@domain/stock-management/visualization/models/StockSummary';
import { UserService } from '@domain/user/services/UserService';
import { HTTP_CODE_OK } from '@utils/httpCodes';
import { PrismaReadUserRepository } from '@infrastructure/user/repositories/PrismaReadUserRepository';
import { PrismaWriteUserRepository } from '@infrastructure/user/repositories/PrismaWriteUserRepository';
import { Request, Response } from 'express';

jest.mock('@domain/stock-management/visualization/services/StockVisualizationService');
jest.mock('@api/errors', () => ({
  sendError: jest.fn(),
}));

describe('StockControllerVisualization', () => {
  let controller: StockControllerVisualization;
  let req: Partial<Request>;
  let res: jest.Mocked<Response>;
  let mockStockService: jest.Mocked<StockVisualizationService>;
  let mockUserService: jest.Mocked<UserService>;
  let mockReadUserRepo: jest.Mocked<PrismaReadUserRepository>;
  let mockWriteUserRepo: jest.Mocked<PrismaWriteUserRepository>;

  beforeEach(() => {
    mockReadUserRepo = {
      readUserByOID: jest.fn().mockResolvedValue(1),
    } as unknown as jest.Mocked<PrismaReadUserRepository>;
    mockWriteUserRepo = {
      addUser: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PrismaWriteUserRepository>;
    mockStockService = new StockVisualizationService(
      {} as any
    ) as jest.Mocked<StockVisualizationService>;
    mockUserService = new UserService(
      mockReadUserRepo,
      mockWriteUserRepo
    ) as jest.Mocked<UserService>;
    controller = new StockControllerVisualization(mockStockService, mockUserService);

    req = { userID: 'test-oid' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as jest.Mocked<Response>;

    jest.clearAllMocks();
  });

  describe('getAllStocks', () => {
    describe('when the service call is successful', () => {
      it('should return 200 and the list of stocks', async () => {
        mockUserService.convertOIDtoUserID = jest.fn().mockResolvedValue({ value: 42 });
        const mockStocks: StockSummaryDto[] = [
          {
            id: 1,
            label: 'Stock 1',
            description: 'Description 1',
            category: 'alimentation',
            totalItems: 0,
            totalQuantity: 0,
            criticalItemsCount: 0,
            status: 'optimal',
          },
        ];
        mockStockService.getAllStocks.mockResolvedValue(mockStocks);

        await controller.getAllStocks(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith(mockStocks);
      });
    });

    describe('when the service call fails', () => {
      it('should call sendError', async () => {
        const error = new Error('fail');
        mockUserService.convertOIDtoUserID = jest.fn().mockRejectedValue(error);

        await controller.getAllStocks(req as Request, res as Response);

        expect(sendError).toHaveBeenCalledWith(res, error as CustomError);
      });
    });
  });

  describe('getStockDetails', () => {
    describe('when the service call is successful', () => {
      it('should return 200 and the stock details', async () => {
        req = { userID: 'test-oid', params: { stockId: '1' } };
        mockUserService.convertOIDtoUserID = jest.fn().mockResolvedValue({ value: 42 });
        const mockStock: StockDetailDto = {
          id: 1,
          label: 'Stock 1',
          description: 'Description 1',
          category: 'alimentation',
          totalItems: 0,
          totalQuantity: 0,
          criticalItemsCount: 0,
          status: 'optimal',
          items: [],
        };
        mockStockService.getStockDetails.mockResolvedValue(mockStock);

        await controller.getStockDetails(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith(mockStock);
      });
    });

    describe('when the service call fails', () => {
      it('should call sendError', async () => {
        req = { userID: 'test-oid', params: { stockId: '1' } };
        const error = new Error('not found');
        mockUserService.convertOIDtoUserID = jest.fn().mockRejectedValue(error);

        await controller.getStockDetails(req as Request, res as Response);

        expect(sendError).toHaveBeenCalledWith(res, error as CustomError);
      });
    });
  });

  describe('getStockItems', () => {
    describe('when the service call is successful', () => {
      it('should return 200 and the items of the stock', async () => {
        req = { userID: 'test-oid', params: { stockId: '1' } };
        mockUserService.convertOIDtoUserID = jest.fn().mockResolvedValue({ value: 42 });
        const mockItems = [
          { id: 1, label: 'Item 1', description: 'desc', category: 'alimentation' },
        ] as any;
        mockStockService.getStockItems.mockResolvedValue(mockItems);

        await controller.getStockItems(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith(mockItems);
      });
    });

    describe('when the service call fails', () => {
      it('should call sendError', async () => {
        req = { userID: 'test-oid', params: { stockId: '1' } };
        const error = new Error('fail items');
        mockUserService.convertOIDtoUserID = jest.fn().mockRejectedValue(error);

        await controller.getStockItems(req as Request, res as Response);

        expect(sendError).toHaveBeenCalledWith(res, error as CustomError);
      });
    });
  });
});
