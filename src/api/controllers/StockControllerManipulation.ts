import {Response} from "express";
import {AuthenticatedRequest} from "@api/types/AuthenticatedRequest";
import {UserService} from "@services/userService";
import {CreateStockCommandHandler} from "@domain/stock-management/manipulation/command-handlers(UseCase)/CreateStockCommandHandler";
import {AddItemToStockCommandHandler} from "@domain/stock-management/manipulation/command-handlers(UseCase)/AddItemToStockCommandHandler";
import {UpdateItemQuantityCommandHandler} from "@domain/stock-management/manipulation/command-handlers(UseCase)/UpdateItemQuantityCommandHandler";
import {CreateStockCommand} from "@domain/stock-management/manipulation/commands(Request)/CreateStockCommand";
import {AddItemToStockCommand} from "@domain/stock-management/manipulation/commands(Request)/AddItemToStockCommand";
import {UpdateItemQuantityCommand} from "@domain/stock-management/manipulation/commands(Request)/UpdateItemQuantityCommand";
import {HTTP_CODE_CREATED, HTTP_CODE_OK} from "@utils/httpCodes";
import {CustomError, sendError} from "@core/errors";
import {rootMain} from "@utils/logger";
import {rootException} from "@utils/cloudLogger";

export class StockControllerManipulation {
    constructor(
        private readonly createStockHandler: CreateStockCommandHandler,
        private readonly addItemHandler: AddItemToStockCommandHandler,
        private readonly updateQuantityHandler: UpdateItemQuantityCommandHandler,
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

    public async createStock(req: AuthenticatedRequest, res: Response) {
        try {
            const OID = req.userID;

            if (!this.validateOID(OID, res)) {
                return;
            }

            const userID = await this.userService.convertOIDtoUserID(OID);
            const {label, description, category} = req.body;

            const command = new CreateStockCommand(
                label,
                description,
                category,
                userID.value
            );

            const stock = await this.createStockHandler.handle(command);

            const labelValue = typeof stock.label === 'string' ? stock.label : stock.label.getValue();
            rootMain.info(
                `createStock OID=${OID} stockId=${stock.id} label=${labelValue}`
            );

            res.status(HTTP_CODE_CREATED).json(stock);
        } catch (err) {
            rootException(err as Error);
            sendError(res, err as CustomError);
        }
    }

    public async addItemToStock(req: AuthenticatedRequest, res: Response) {
        try {
            const OID = req.userID;

            if (!this.validateOID(OID, res)) {
                return;
            }

            const stockId = Number(req.params.stockId);
            const {label, quantity, description, minimumStock} = req.body;

            const command = new AddItemToStockCommand(
                stockId,
                label,
                quantity,
                description,
                minimumStock
            );

            const stock = await this.addItemHandler.handle(command);

            rootMain.info(
                `addItemToStock OID=${OID} stockId=${stockId} itemLabel=${label}`
            );

            res.status(HTTP_CODE_CREATED).json(stock);
        } catch (err) {
            rootException(err as Error);
            sendError(res, err as CustomError);
        }
    }

    public async updateItemQuantity(req: AuthenticatedRequest, res: Response) {
        try {
            const OID = req.userID;

            if (!this.validateOID(OID, res)) {
                return;
            }

            const stockId = Number(req.params.stockId);
            const itemId = Number(req.params.itemId);
            const {quantity} = req.body;

            const command = new UpdateItemQuantityCommand(
                stockId,
                itemId,
                quantity
            );

            const stock = await this.updateQuantityHandler.handle(command);

            rootMain.info(
                `updateItemQuantity OID=${OID} stockId=${stockId} itemId=${itemId} newQuantity=${quantity}`
            );

            res.status(HTTP_CODE_OK).json(stock);
        } catch (err) {
            rootException(err as Error);
            sendError(res, err as CustomError);
        }
    }
}
