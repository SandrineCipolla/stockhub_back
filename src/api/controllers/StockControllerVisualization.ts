import {
    StockVisualizationService
} from "../../domain/stock-management/visualization/services/StockVisualizationService";
import {UserService} from "../../services/userService";
import {HTTP_CODE_OK} from "../../Utils/httpCodes";
import {CustomError, sendError} from "../../errors";
import {Request, Response} from "express";
import {rootMain} from "../../Utils/logger";
import {PrismaRestockRequestRepository} from "../../db/repositories/PrismaRestockRequestRepository";
import {PrismaStockVisualizationRepository} from "../../db/repositories/PrismaStockVisualizationRepository";
import {RestockRequestService} from "../../domain/stock-management/restock/services/RestockRequestService";


export class StockControllerVisualization {
    private restockService: RestockRequestService;
    private readonly stockRepository: PrismaStockVisualizationRepository;

    constructor(
        private readonly stockVisualizationService: StockVisualizationService,
        private readonly userService: UserService
    ) {
        const restockRepository = new PrismaRestockRequestRepository();
        this.stockRepository = new PrismaStockVisualizationRepository();
        this.restockService = new RestockRequestService(restockRepository, this.stockRepository);
    }

    public async getAllStocks(req: Request, res: Response) {
        try {
            const OID = (req as any).userID as string;

            const userID = await this.userService.convertOIDtoUserID(OID);
            const stocks = await this.stockVisualizationService.getAllStocks(userID.value);

            rootMain.info(
                `getAllStocks OID=${OID} stocksLength=${stocks.length}`
            );

            res.status(HTTP_CODE_OK).json(stocks);
        } catch (err: any) {
            sendError(res, err as CustomError);
        }
    }

    public async getStockDetails(req: Request, res: Response) {
        try {
            const OID = (req as any).userID as string;
            const userID = await this.userService.convertOIDtoUserID(OID);
            const stockId = Number(req.params.stockId);
            const stock = await this.stockVisualizationService.getStockDetails(stockId, userID.value);

            rootMain.info(`getStockDetails OID=${OID} stockId=${stockId}`);
            res.status(HTTP_CODE_OK).json(stock);
        } catch (err: any) {
            sendError(res, err as CustomError);
        }
    }

    public async getStockItems(req: Request, res: Response) {
        try {
            const OID = (req as any).userID as string;
            const userID = await this.userService.convertOIDtoUserID(OID);
            const stockId = Number(req.params.stockId);
            const items = await this.stockVisualizationService.getStockItems(stockId, userID.value);

            rootMain.info(`getStockItems OID=${OID} stockId=${stockId} itemsLength=${items.length}`);
            res.status(HTTP_CODE_OK).json(items);
        } catch (err: any) {
            console.error("getStockItems error:", err);
            rootMain.error(`Error in getStockItems: ${err.message}`, err);
            sendError(res, err as CustomError);
        }
    }

    public async createRestockRequest(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const stockId = Number(req.params.stockId);
            const itemId = Number(req.params.itemId);
            const {requestedQuantity, reason} = req.body;

            if (!requestedQuantity || requestedQuantity <= 0) {
                return res.status(400).json({
                    error: "Requested quantity must be a positive number"
                });
            }

            const restockRequest = await this.restockService.createRestockRequest({
                stockId,
                itemId,
                requestedBy: user.email,
                requestedQuantity: Number(requestedQuantity),
                reason
            });

            rootMain.info(`createRestockRequest user=${user.email} stockId=${stockId} itemId=${itemId} quantity=${requestedQuantity}`);

            res.status(201).json({
                message: "Restock request created successfully",
                request: restockRequest
            });
        } catch (error: any) {
            console.error("Error creating restock request:", error);
            rootMain.error(`Error in createRestockRequest: ${error.message}`, error);
            sendError(res, error as CustomError);
        }
    }

    public async getMyRestockRequests(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const requests = await this.restockService.getRestockRequestsByUser(user.email);

            rootMain.info(`getMyRestockRequests user=${user.email} requestsLength=${requests.length}`);

            res.status(HTTP_CODE_OK).json({
                message: "User restock requests retrieved successfully",
                requests
            });
        } catch (error: any) {
            console.error("Error fetching user restock requests:", error);
            rootMain.error(`Error in getMyRestockRequests: ${error.message}`, error);
            sendError(res, error as CustomError);
        }
    }

    public async getAllRestockRequests(req: Request, res: Response) {
        try {
            const user = req.user as any;

            // Vérifier que l'utilisateur est admin
            if (!user.isAdmin) {
                return res.status(403).json({
                    error: "Admin access required"
                });
            }

            const requests = await this.restockService.getAllRestockRequests();

            rootMain.info(`getAllRestockRequests admin=${user.email} requestsLength=${requests.length}`);

            res.status(HTTP_CODE_OK).json({
                message: "All restock requests retrieved successfully",
                requests
            });
        } catch (error: any) {
            console.error("Error fetching all restock requests:", error);
            rootMain.error(`Error in getAllRestockRequests: ${error.message}`, error);
            sendError(res, error as CustomError);
        }
    }

    public async approveRestockRequest(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const requestId = Number(req.params.requestId);
            const {newQuantity} = req.body;

            if (!user.isAdmin) {
                return res.status(403).json({
                    error: "Admin access required"
                });
            }

            const result = await this.restockService.approveRestockRequest(
                requestId,
                user.email,
                newQuantity ? Number(newQuantity) : undefined
            );

            rootMain.info(`approveRestockRequest admin=${user.email} requestId=${requestId} newQuantity=${newQuantity} stockUpdated=${result.stockUpdated}`);

            res.status(HTTP_CODE_OK).json({
                message: "Restock request approved successfully",
                request: result.request,
                stockUpdated: result.stockUpdated
            });
        } catch (error: any) {
            console.error("Error approving restock request:", error);
            rootMain.error(`Error in approveRestockRequest: ${error.message}`, error);
            sendError(res, error as CustomError);
        }
    }

    public async rejectRestockRequest(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const requestId = Number(req.params.requestId);

            if (!user.isAdmin) {
                return res.status(403).json({
                    error: "Admin access required"
                });
            }

            const request = await this.restockService.rejectRestockRequest(
                requestId,
                user.email
            );

            rootMain.info(`rejectRestockRequest admin=${user.email} requestId=${requestId}`);

            res.status(HTTP_CODE_OK).json({
                message: "Restock request rejected successfully",
                request
            });
        } catch (error: any) {
            console.error("Error rejecting restock request:", error);
            rootMain.error(`Error in rejectRestockRequest: ${error.message}`, error);
            sendError(res, error as CustomError);
        }
    }

    public async updateStockItemQuantity(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const stockId = Number(req.params.stockId);
            const itemId = Number(req.params.itemId);
            const {quantity} = req.body;

            if (!user.isAdmin) {
                return res.status(403).json({
                    error: "Admin access required"
                });
            }

            if (quantity === undefined || quantity < 0) {
                return res.status(400).json({
                    error: "Quantity must be a positive number or zero"
                });
            }


            await this.stockRepository.updateStockItemQuantity(itemId, Number(quantity));

            rootMain.info(`updateStockItemQuantity admin=${user.email} stockId=${stockId} itemId=${itemId} newQuantity=${quantity}`);

            res.status(HTTP_CODE_OK).json({
                message: "Stock item quantity updated successfully",
                stockId,
                itemId,
                newQuantity: quantity
            });
        } catch (error: any) {
            console.error("Error updating stock item quantity:", error);
            rootMain.error(`Error in updateStockItemQuantity: ${error.message}`, error);
            sendError(res, error as CustomError);
        }
    }
}