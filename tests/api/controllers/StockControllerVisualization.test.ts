import {StockControllerVisualization} from "@api/controllers/StockControllerVisualization";
import {CustomError, sendError} from "@core/errors";
import {
    StockVisualizationService
} from "@domain/stock-management/visualization/services/StockVisualizationService";
import {UserService} from "@services/userService";
import {HTTP_CODE_OK} from "@utils/httpCodes";
import {ReadUserRepository} from "@services/readUserRepository";
import {WriteUserRepository} from "@services/writeUserRepository";
import {PoolConnection} from "mysql2/promise";
import {Request, Response} from "express";

jest.mock("@domain/stock-management/visualization/services/StockVisualizationService");
jest.mock("@core/errors", () => ({
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

    describe("getStockDetails", () => {
        describe("when the service call is successful", () => {
            it("should return 200 and the stock details", async () => {
                req = {params: {stockId: "1"}};
                mockUserService.convertOIDtoUserID = jest.fn().mockResolvedValue({value: 42});
                const mockStock = {
                    ID: 1,
                    LABEL: "Stock 1",
                    DESCRIPTION: "Description 1",
                    category: "alimentation",
                };
                mockStockService.getStockDetails.mockResolvedValue(mockStock);

                await controller.getStockDetails(req as Request, res as Response);

                expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
                expect(res.json).toHaveBeenCalledWith(mockStock);
            });
        });

        describe("when the service call fails", () => {
            it("should call sendError", async () => {
                req = {params: {stockId: "1"}};
                const error = new Error("not found");
                mockUserService.convertOIDtoUserID = jest.fn().mockRejectedValue(error);

                await controller.getStockDetails(req as Request, res as Response);

                expect(sendError).toHaveBeenCalledWith(res, error as CustomError);
            });
        });
    });

    describe("getStockItems", () => {
        describe("when the service call is successful", () => {
            it("should return 200 and the items of the stock", async () => {
                req = {params: {stockId: "1"}};
                mockUserService.convertOIDtoUserID = jest.fn().mockResolvedValue({value: 42});
                const mockItems = [
                    {id: 1, label: "Item 1", description: "desc", category: "alimentation"},
                ] as any;
                mockStockService.getStockItems.mockResolvedValue(mockItems);

                await controller.getStockItems(req as Request, res as Response);

                expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);
                expect(res.json).toHaveBeenCalledWith(mockItems);
            });
        });

        describe("when the service call fails", () => {
            it("should call sendError", async () => {
                req = {params: {stockId: "1"}};
                const error = new Error("fail items");
                mockUserService.convertOIDtoUserID = jest.fn().mockRejectedValue(error);

                await controller.getStockItems(req as Request, res as Response);

                expect(sendError).toHaveBeenCalledWith(res, error as CustomError);
            });
        });
    });
});