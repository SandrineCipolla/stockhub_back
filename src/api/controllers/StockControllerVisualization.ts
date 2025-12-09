import {
    StockVisualizationService
} from "../../domain/stock-management/visualization/services/StockVisualizationService";
import {UserService} from "../../services/userService";
import {HTTP_CODE_OK} from "../../Utils/httpCodes";
import {CustomError, sendError} from "../../errors";
import {Request, Response} from "express";
import {rootMain} from "../../Utils/logger";
import {rootException} from "../../Utils/cloudLogger";
import {StockMapper} from "../dto/mappers/StockMapper";


export class StockControllerVisualization {
    constructor(
        private readonly stockVisualizationService: StockVisualizationService,
        private readonly userService: UserService
    ) {
    }

    private validateOID(OID: string, res: Response): boolean {
        if (!OID || OID.trim() === '') {
            res.status(401).json({error: 'User not authenticated'});
            return false;
        }
        return true;
    }

    public async getAllStocks(req: Request, res: Response) {
        try {
            const OID = (req as any).userID as string;

            if (!this.validateOID(OID, res)) {
                return;
            }

            const userID = await this.userService.convertOIDtoUserID(OID);
            const stocks = await this.stockVisualizationService.getAllStocks(userID.value);

            // Transformer les entités Stock en DTOs pour l'API
            const stockDTOs = StockMapper.toDTOList(stocks);

            rootMain.info(
                `getAllStocks OID=${OID} stocksLength=${stocks.length}`
            );

            res.status(HTTP_CODE_OK).json(stockDTOs);
        } catch (err: any) {
            rootException(err);
            sendError(res, err as CustomError);
        }
    }

    public async getStockDetails(req: Request, res: Response) {
        try {
            const OID = (req as any).userID as string;

            if (!this.validateOID(OID, res)) {
                return;
            }

            const userID = await this.userService.convertOIDtoUserID(OID);
            const stockId = Number(req.params.stockId);
            const stock = await this.stockVisualizationService.getStockDetails(stockId, userID.value);

            // Transformer l'entité Stock en DTO pour l'API
            const stockDTO = StockMapper.toDTO(stock);

            rootMain.info(`getStockDetails OID=${OID} stockId=${stockId}`);
            res.status(HTTP_CODE_OK).json(stockDTO);
        } catch (err: any) {
            rootException(err);
            sendError(res, err as CustomError);
        }
    }

    public async getStockItems(req: Request, res: Response) {
        try {
            const OID = (req as any).userID as string;

            if (!this.validateOID(OID, res)) {
                return;
            }

            const userID = await this.userService.convertOIDtoUserID(OID);
            const stockId = Number(req.params.stockId);
            const items = await this.stockVisualizationService.getStockItems(stockId, userID.value);

            // Transformer les entités StockItem en DTOs pour l'API
            const itemDTOs = StockMapper.itemsToDTOList(items);

            rootMain.info(`getStockItems OID=${OID} stockId=${stockId} itemsLength=${items.length}`);
            res.status(HTTP_CODE_OK).json(itemDTOs);
        } catch (err: any) {
            rootException(err);
            sendError(res, err as CustomError);
        }
    }
}