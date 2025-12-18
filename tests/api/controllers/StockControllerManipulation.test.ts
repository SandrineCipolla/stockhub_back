import { StockControllerManipulation } from '@api/controllers/StockControllerManipulation';
import { sendError } from '@core/errors';
import { HTTP_CODE_CREATED, HTTP_CODE_OK } from '@utils/httpCodes';
import { AuthenticatedRequest } from '@api/types/AuthenticatedRequest';

jest.mock('@core/errors', () => ({
  sendError: jest.fn(),
}));

describe('StockControllerManipulation', () => {
  let controller: StockControllerManipulation;
  let req: Partial<AuthenticatedRequest>;
  let res: any;
  let mockCreateStockHandler: any;
  let mockAddItemHandler: any;
  let mockUpdateQuantityHandler: any;
  let mockUserService: any;

  beforeEach(() => {
    mockUserService = {
      convertOIDtoUserID: jest.fn(),
    };

    mockCreateStockHandler = {
      handle: jest.fn(),
    };

    mockAddItemHandler = {
      handle: jest.fn(),
    };

    mockUpdateQuantityHandler = {
      handle: jest.fn(),
    };

    controller = new StockControllerManipulation(
      mockCreateStockHandler,
      mockAddItemHandler,
      mockUpdateQuantityHandler,
      mockUserService
    );

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('createStock', () => {
    describe('when the handler call is successful', () => {
      it('should return 201 and the created stock', async () => {
        req = {
          userID: 'test-oid-123',
          body: {
            label: 'My Stock',
            description: 'Stock description',
            category: 'alimentation',
          },
        };
        mockUserService.convertOIDtoUserID = jest.fn().mockResolvedValue({ value: 42 });

        const mockStock = {
          id: 1,
          label: 'My Stock',
          description: 'Stock description',
          category: 'alimentation',
        };

        mockCreateStockHandler.handle = jest.fn().mockResolvedValue(mockStock);

        await controller.createStock(req as AuthenticatedRequest, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_CREATED);
        expect(res.json).toHaveBeenCalledWith(mockStock);
      });
    });

    describe('when the handler call fails', () => {
      it('should call sendError', async () => {
        req = {
          userID: 'test-oid-123',
          body: {
            label: 'My Stock',
            description: 'Stock description',
            category: 'alimentation',
          },
        };
        const error = new Error('fail');
        mockUserService.convertOIDtoUserID = jest.fn().mockRejectedValue(error);

        await controller.createStock(req as AuthenticatedRequest, res);

        expect(sendError).toHaveBeenCalled();
      });
    });
  });

  describe('addItemToStock', () => {
    describe('when the handler call is successful', () => {
      it('should return 201 and the updated stock', async () => {
        req = {
          userID: 'test-oid-123',
          params: { stockId: '1' },
          body: {
            label: 'Item 1',
            quantity: 10,
            description: 'Item description',
            minimumStock: 5,
          },
        };
        mockUserService.convertOIDtoUserID = jest.fn().mockResolvedValue({ value: 42 });

        const mockStock = {
          id: 1,
          label: 'My Stock',
        };

        mockAddItemHandler.handle = jest.fn().mockResolvedValue(mockStock);

        await controller.addItemToStock(req as AuthenticatedRequest, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_CREATED);
        expect(res.json).toHaveBeenCalledWith(mockStock);
      });
    });

    describe('when the handler call fails', () => {
      it('should call sendError', async () => {
        req = {
          userID: 'test-oid-123',
          params: { stockId: '1' },
          body: {
            label: 'Item 1',
            quantity: 10,
          },
        };
        const error = new Error('fail to add item');
        mockUserService.convertOIDtoUserID = jest.fn().mockRejectedValue(error);

        await controller.addItemToStock(req as AuthenticatedRequest, res);

        expect(sendError).toHaveBeenCalled();
      });
    });
  });

  describe('updateItemQuantity', () => {
    describe('when the handler call is successful', () => {
      it('should return 200 and the updated stock', async () => {
        req = {
          userID: 'test-oid-123',
          params: { stockId: '1', itemId: '5' },
          body: {
            quantity: 20,
          },
        };
        mockUserService.convertOIDtoUserID = jest.fn().mockResolvedValue({ value: 42 });

        const mockStock = {
          id: 1,
          label: 'My Stock',
        };

        mockUpdateQuantityHandler.handle = jest.fn().mockResolvedValue(mockStock);

        await controller.updateItemQuantity(req as AuthenticatedRequest, res);

        expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
        expect(res.json).toHaveBeenCalledWith(mockStock);
      });
    });

    describe('when the handler call fails', () => {
      it('should call sendError', async () => {
        req = {
          userID: 'test-oid-123',
          params: { stockId: '1', itemId: '5' },
          body: {
            quantity: 20,
          },
        };
        const error = new Error('fail to update quantity');
        mockUserService.convertOIDtoUserID = jest.fn().mockRejectedValue(error);

        await controller.updateItemQuantity(req as AuthenticatedRequest, res);

        expect(sendError).toHaveBeenCalled();
      });
    });
  });
});
