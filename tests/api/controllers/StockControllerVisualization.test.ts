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
import {createMockStock, createMockStockItem} from "../../helpers/stockMockFactory";
import {createMockRequest, createMockResponse, createMockUserIdentifier} from "../../helpers/requestMockFactory";

jest.mock("../../../src/domain/stock-management/visualization/services/StockVisualizationService");
jest.mock("../../../src/errors", () => ({
    sendError: jest.fn(),
}));
jest.mock("../../../src/Utils/cloudLogger", () => ({
    rootException: jest.fn(),
    rootDependency: jest.fn(),
    rootMain: {
        info: jest.fn()
    }
}));

describe("StockControllerVisualization", () => {
    let controller: StockControllerVisualization;
    let req: Request;
    let res: jest.Mocked<Response>;
    let mockStockService: jest.Mocked<StockVisualizationService>;
    let mockUserService: jest.Mocked<UserService>;
    let mockReadUserRepo: jest.Mocked<ReadUserRepository>;
    let mockWriteUserRepo: jest.Mocked<WriteUserRepository>;

    beforeEach(() => {
        // Create mock repositories
        mockReadUserRepo = {
            connection: {} as PoolConnection,
            readUserByOID: jest.fn().mockResolvedValue(1),
        } as jest.Mocked<ReadUserRepository>;

        mockWriteUserRepo = {
            connection: {} as PoolConnection,
            writeUser: jest.fn().mockResolvedValue(1),
            addUser: jest.fn().mockResolvedValue(undefined)
        } as jest.Mocked<WriteUserRepository>;

        // Create mock services
        mockStockService = {
            getAllStocks: jest.fn(),
            getStockDetails: jest.fn(),
            getStockItems: jest.fn()
        } as unknown as jest.Mocked<StockVisualizationService>;

        mockUserService = {
            convertOIDtoUserID: jest.fn()
        } as unknown as jest.Mocked<UserService>;

        controller = new StockControllerVisualization(mockStockService, mockUserService);

        req = createMockRequest();
        res = createMockResponse();

        jest.clearAllMocks();
    });

    describe("getAllStocks", () => {
        describe("when the service call is successful", () => {
            it("should return 200 and the list of stocks as DTOs", async () => {
                // Setup request with userID
                req = createMockRequest({userID: "test-oid"});
                mockUserService.convertOIDtoUserID.mockResolvedValue(createMockUserIdentifier());

                // Le service retourne maintenant des Stock entities complètes
                const mockStocks = [
                    createMockStock({
                        id: 1,
                        label: "Stock 1",
                        description: "Description 1",
                        category: "alimentation"
                    })
                ];
                mockStockService.getAllStocks.mockResolvedValue(mockStocks);

                await controller.getAllStocks(req, res);

                expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);

                // Le controller retourne des DTOs, pas les entités directement
                expect(res.json).toHaveBeenCalledWith([
                    expect.objectContaining({
                        id: 1,
                        label: "Stock 1", // DTO utilise 'label' (cohérent avec BDD)
                        description: "Description 1",
                        category: "alimentation",
                        quantity: 0, // Pas d'items
                        unit: "unités",
                        minimumStock: 1,
                        status: "out-of-stock"
                    })
                ]);
            });
        });

        describe("when the service call fails", () => {
            it("should call sendError", async () => {
                req = createMockRequest({userID: "test-oid"});
                const error = new Error("fail");
                mockUserService.convertOIDtoUserID.mockRejectedValue(error);

                await controller.getAllStocks(req, res);

                expect(sendError).toHaveBeenCalledWith(res, error);
            });
        });
    });

    describe("getStockDetails", () => {
        describe("when the service call is successful", () => {
            it("should return 200 and the stock details as DTO", async () => {
                req = createMockRequest({
                    params: {stockId: "1"},
                    userID: "test-oid"
                });
                mockUserService.convertOIDtoUserID.mockResolvedValue(createMockUserIdentifier());

                // Le service retourne maintenant une Stock entity complète
                const mockStock = createMockStock({
                    id: 1,
                    label: "Stock 1",
                    description: "Description 1",
                    category: "alimentation"
                });
                mockStockService.getStockDetails.mockResolvedValue(mockStock);

                await controller.getStockDetails(req, res);

                expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);

                // Le controller retourne un DTO, pas l'entité directement
                expect(res.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 1,
                        label: "Stock 1", // DTO utilise 'label' (cohérent avec BDD)
                        description: "Description 1",
                        category: "alimentation",
                        quantity: 0,
                        unit: "unités",
                        minimumStock: 1,
                        status: "out-of-stock"
                    })
                );
            });
        });

        describe("when the service call fails", () => {
            it("should call sendError", async () => {
                req = createMockRequest({
                    params: {stockId: "1"},
                    userID: "test-oid"
                });
                const error = new Error("not found");
                mockUserService.convertOIDtoUserID.mockRejectedValue(error);

                await controller.getStockDetails(req, res);

                expect(sendError).toHaveBeenCalledWith(res, error);
            });
        });
    });

    describe("getStockItems", () => {
        describe("when the service call is successful", () => {
            it("should return 200 and the items of the stock as DTOs", async () => {
                req = createMockRequest({
                    params: {stockId: "1"},
                    userID: "test-oid"
                });
                mockUserService.convertOIDtoUserID.mockResolvedValue(createMockUserIdentifier());

                // Le service retourne maintenant des StockItem entities
                const mockItems = [
                    createMockStockItem({
                        id: 1,
                        label: "Item 1",
                        description: "desc",
                        quantity: 10,
                        minimumStock: 5,
                        stockId: 1
                    })
                ];
                mockStockService.getStockItems.mockResolvedValue(mockItems);

                await controller.getStockItems(req, res);

                expect(res.status).toHaveBeenCalledWith(HTTP_CODE_OK);

                // Le controller retourne des DTOs
                expect(res.json).toHaveBeenCalledWith([
                    expect.objectContaining({
                        id: 1,
                        label: "Item 1",
                        description: "desc",
                        quantity: 10,
                        minimumStock: 5,
                        stockId: 1
                    })
                ]);
            });
        });

        describe("when the service call fails", () => {
            it("should call sendError", async () => {
                req = createMockRequest({
                    params: {stockId: "1"},
                    userID: "test-oid"
                });
                const error = new Error("fail items");
                mockUserService.convertOIDtoUserID.mockRejectedValue(error);

                await controller.getStockItems(req, res);

                expect(sendError).toHaveBeenCalledWith(res, error);
            });
        });
    });
});