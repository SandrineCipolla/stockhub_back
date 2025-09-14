import {
    StockVisualizationService
} from "../../domain/stock-management/visualization/services/StockVisualizationService";
import {UserService} from "../../services/userService";
import {HTTP_CODE_OK} from "../../Utils/httpCodes";
import {CustomError, sendError} from "../../errors";
import {Request, Response} from "express";
import {rootMain} from "../../Utils/logger";
import {rootException} from "../../Utils/cloudLogger";


export class StockControllerVisualization {
    constructor(
        private readonly stockVisualizationService: StockVisualizationService,
        private readonly userService: UserService
    ) {
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
            rootException(err);
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
            res.status(HTTP_CODE_OK).json([stock]);
        } catch (err: any) {
            rootException(err);
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
            rootException(err);
            sendError(res, err as CustomError);
        }
    }
}