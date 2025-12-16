import {WriteStockRepository} from "@repositories/writeStockRepository";
import {ReadStockRepository} from "@repositories/readStockRepository";
import {Stock, StockToCreate, UpdateStockRequest} from "@core/models";
import {BadRequestError, ErrorMessages, NotFoundError, ValidationError} from "@core/errors";
import {StockMapper} from "@core/stockMapper";

export class StockService {
    private writeStockRepository: WriteStockRepository;
    private readStockRepository: ReadStockRepository;

    constructor(
        readStock: ReadStockRepository,
        writeStock: WriteStockRepository
    ) {
        this.readStockRepository = readStock;
        this.writeStockRepository = writeStock;
    }

    async getAllStocks(userID:number): Promise<Stock[]> {
        const rows = await this.readStockRepository.readAllStocks(userID);
        if (!rows) {
            throw new Error("No rows returned from readAllStocks");
        }
        return StockMapper.mapRowDataPacketsToStocks(rows);
    }

    async createStock(stock: Partial<StockToCreate>,userID:number) {
        if (!stock.LABEL || !stock.DESCRIPTION) {
            throw new BadRequestError("LABEL and DESCRIPTION are required.", ErrorMessages.CreateStock);
        }
        await this.writeStockRepository.createStock(stock,userID);
    }

    async getStockDetails(ID: number,userID: number) {
        const stock = await this.readStockRepository.readStockDetails(ID,userID);
        if (!stock) {
            throw new NotFoundError("Stock not found.", ErrorMessages.GetStockDetails);
        }
        return stock;
    }

    async getStockItems(ID: number) {
        const items = await this.readStockRepository.readStockItems(ID);
        if (items.length === 0) {
            throw new NotFoundError("No items found for this stock.", ErrorMessages.GetStockItems);
        }
        return items;
    }

    async updateStockItemQuantity(itemID: number, QUANTITY: number, stockID: number) {
        const updateRequest = new UpdateStockRequest(itemID, QUANTITY, stockID);
        await this.writeStockRepository.updateStockItemQuantity(updateRequest);
    }

    async addStockItem(item: Partial<Stock>, stockID: number) {
        if (!item.label || !item.quantity) {
            throw new ValidationError("LABEL and QUANTITY must be provided.", ErrorMessages.AddStockItem);
        }
        await this.writeStockRepository.addStockItem(item, stockID);
    }

    async deleteStockItem(stockID: number, itemID: number) {
        const result = await this.writeStockRepository.deleteStockItem(stockID, itemID);
        if (result.affectedRows === 0) {
            throw new NotFoundError("Item not found or already deleted.", ErrorMessages.DeleteStockItem);
        }
    }

    async deleteStock(stockID: number, userID: number) {
        // // Vérifie si le stock existe
        // const exists = await this.writeStockRepository.existsById(stockID, userID);
        // if (!exists) {
        //     throw new NotFoundError("Stock not found or already deleted.", ErrorMessages.DeleteStock);
        // }

        // Supprime les éléments associés au stock
        await this.writeStockRepository.deleteStockItemsByStockID(stockID);

        // Si le stock existe, suppression
        const result = await this.writeStockRepository.deleteStock(stockID, userID);
        console.log('deleteStock result affectedRows:', result.affectedRows);
        if (result.affectedRows === 0) {
            throw new Error("Failed to delete the stock.");
        }
    }

    async getAllItems(userID:number) {
        return await this.readStockRepository.readAllItems(userID);
    }

    async getItemDetails(itemID: number) {
        const items = await this.readStockRepository.readItemDetails(itemID);
        if (items.length === 0) {
            throw new NotFoundError("Item not found.", ErrorMessages.GetItemDetails);
        }
        return items[0];
    }

    async getLowStockItems(UserID: number) {
        const lowStockItems = await this.readStockRepository.readLowStockItems(UserID);
        console.log('Items à faible stock récupérés:', lowStockItems);
        return lowStockItems;
    }
}
