import {StockControllerVisualization} from "../../../src/api/controllers/StockControllerVisualization";
import {CustomError, sendError} from "../../../src/errors";
import {
    StockVisualizationService
} from "../../../src/domain/stock-management/visualization/services/StockVisualizationService";
import {UserService} from "../../../src/services/userService";
import {HTTP_CODE_OK} from "../../../src/Utils/httpCodes";
import {ReadUserRepository} from "../../../src/services/readUserRepository";
import {WriteUserRepository} from "../../../src/services/writeUserRepository";
import {PoolConnection} from "mysql2/promise";
import {Request, Response} from "express";

jest.mock("../../../src/domain/stock-management/visualization/services/StockVisualizationService");
jest.mock("../../../src/errors", () => ({
    sendError: jest.fn(),
}));

describe("StockControllerVisualization", () => {
    let controller: StockControllerVisualization;
    let req: Partial<Request>;
    let res: jest.Mocked<Response>;
    let mockStockService: jest.Mocked<StockVisualizationService>;
    let mockUserService: jest.Mocked<UserService>;
    let mockReadUserRepo: jest.Mocked<ReadUserRepository>;
    let mockWriteUserRepo: jest.Mocked<WriteUserRepository>;

    beforeEach(() => {
        mockReadUserRepo = {
            connection: {} as PoolConnection,
            readUserByOID: jest.fn().mockResolvedValue(1),
        } as unknown as jest.Mocked<ReadUserRepository>;
        mockWriteUserRepo = {
            connection: {} as PoolConnection,
            writeUser: jest.fn().mockResolvedValue(1),
        } as unknown as jest.Mocked<WriteUserRepository>;
        mockStockService = new StockVisualizationService({} as any) as jest.Mocked<StockVisualizationService>;
        mockUserService = new UserService(mockReadUserRepo, mockWriteUserRepo) as jest.Mocked<UserService>;
        controller = new StockControllerVisualization(mockStockService, mockUserService);

        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as jest.Mocked<Response>;

        jest.clearAllMocks();
    });

    describe("getAllStocks", () => {
        describe("when the service call is successful", () => {
            it("should return 200 and the list of stocks", async () => {
                mockUserService.convertOIDtoUserID = jest.fn().mockResolvedValue({value: 42});
                const mockStocks = [{
                    id: 1,
                    label: "Stock 1",
                    description: "Description 1",
                    category: "alimentation",
                },];
                mockStockService.getAllStocks.mockResolvedValue(mockStocks);

                await controller.getAllStocks(req as Request, res as Response);

                expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
                expect(res.json).toHaveBeenCalledWith(mockStocks);
            });
        });

        describe("when the service call fails", () => {
            it("should call sendError", async () => {
                const error = new Error("fail");
                mockUserService.convertOIDtoUserID = jest.fn().mockRejectedValue(error);

                await controller.getAllStocks(req as Request, res as Response);

                expect(sendError).toHaveBeenCalledWith(res, error as CustomError);
            });
        });
    });
});