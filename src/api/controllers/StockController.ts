import {
    StockVisualizationService
} from "../../domain/stock-management/visualization/services/StockVisualizationService";
import {UserService} from "../../services/userService";
import {HTTP_CODE_OK} from "../../Utils/httpCodes";
import {CustomError, sendError} from "../../errors";
import {Request, Response} from "express";


export class StockController {
    constructor(
        private readonly stockVisualizationService: StockVisualizationService,
        private readonly userService: UserService
    ) {
    }

    public async getAllStocks(req:Request, res:Response) {
        try {
            const OID = (req as any).userID as string;

            const userID = await this.userService.convertOIDtoUserID(OID);
            const stocks = await this.stockVisualizationService.getAllStocks(userID.value);

            console.info("getAllStocks {OID} - {stocks.length}", OID, stocks.length);

            res.status(HTTP_CODE_OK).json(stocks);
        } catch (err: any) {
            sendError(res, err as CustomError);
        }
    }

    public async getStockDetails(req:Request, res:Response) {
        try {
            const OID = (req as any).userID as string;
            const userID = await this.userService.convertOIDtoUserID(OID);
            const stockId = Number(req.params.stockId);
            const stock = await this.stockVisualizationService.getStockDetails(stockId, userID.value);

            console.info("getStockDetails {OID} - {stockId}", OID, stockId);
            res.status(HTTP_CODE_OK).json(stock);
        } catch (err: any) {
            sendError(res, err as CustomError);
        }
    }
}