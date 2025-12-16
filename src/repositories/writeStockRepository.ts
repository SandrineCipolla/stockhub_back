import {ResultSetHeader} from "mysql2/promise";
import {Stock, StockToCreate, UpdateStockRequest} from "@core/models";
import {ErrorMessages, ValidationError} from "@core/errors";
import {connectToDatabase} from "@core/dbUtils";
import {DependencyTelemetry, rootDependency, rootException} from "@utils/cloudLogger";
import {rootWriteStockRepository} from "@utils/logger";

const DEPENDENCY_NAME = process.env.DB_DATABASE;
const DEPENDENCY_TARGET = process.env.DB_HOST;
const DEPENDENCY_TYPE = "MySQL";
const DEFAULT_MINIMUM_STOCK = 1;

export class WriteStockRepository {
    async updateStockItemQuantity(updateRequest: UpdateStockRequest) {
        const {itemID, quantity, stockID} = updateRequest;

        let success = false;

        if (quantity === undefined) {
            throw new ValidationError(
                "Quantity is undefined.",
                ErrorMessages.UpdateStockItemQuantity,
                updateRequest
            );
        }

        let connection = await connectToDatabase();

        try {
            await connection.execute(
                "UPDATE items SET QUANTITY = ? WHERE ID = ? AND STOCK_ID = ?",
                [quantity, itemID, stockID]
            );

            success = true;
            return {itemID, quantity, stockID};
        } catch (error) {
            rootException(error as Error);
            success = false;
            throw error;
        } finally {
            rootDependency({
                name: DEPENDENCY_NAME,
                data: `UPDATE items
                       SET QUANTITY = ${quantity}
                       WHERE ID = ${itemID}
                         AND STOCK_ID = ${stockID}`,
                duration: 0,
                success: success,
                resultCode: 0,
                target: DEPENDENCY_TARGET,
                dependencyTypeName: DEPENDENCY_TYPE,
            } as DependencyTelemetry)

            connection.release();
        }
    }

    async addStockItem(item: Partial<Stock>, stockID: number) {
        if (!item.label || !item.description || item.quantity === undefined) {
            const validationError = new ValidationError(
                "Label, description and quantity must be provided.",
                ErrorMessages.AddStockItem,
                item
            );

            rootException(validationError);
        }
        let connection = await connectToDatabase();

        let success = false;

        try {
            await connection.query("INSERT INTO items(id, label, description, quantity, minimum_stock, stock_id) VALUES (?, ?, ?, ? ,?, ?)", [
                item.id,
                item.label,
                item.description,
                item.quantity,
                item.minimumStock || DEFAULT_MINIMUM_STOCK,
                stockID,
            ]);

            success = true;
        } catch (error) {
            rootException(error as Error);
            success = false;
            throw error;
        } finally {
            connection.release();

            rootDependency({
                name: DEPENDENCY_NAME,
                data: `INSERT INTO items(id, label, description, quantity, minimum_stock, stock_id)
                       VALUES (${item.id}, ${item.label}, ${item.description}, ${item.quantity}, ${item.minimumStock || DEFAULT_MINIMUM_STOCK}, ${stockID})`,
                duration: 0,
                success: success,
                resultCode: 0,
                target: DEPENDENCY_TARGET,
                dependencyTypeName: DEPENDENCY_TYPE,
            } as DependencyTelemetry);
        }
    }

    async createStock(stock: Partial<StockToCreate>, userID: number) {
        let connection = await connectToDatabase();

        let success = false;

        try {
            await connection.query(
                "INSERT INTO stocks(LABEL, DESCRIPTION,USER_ID) VALUES (?, ?,?)",
                [stock.LABEL, stock.DESCRIPTION, userID]
            );

            success = true;
        } catch (error) {
            rootException(error as Error);
            success = false;
            throw error;
        } finally {
            rootDependency({
                name: DEPENDENCY_NAME,
                data: `INSERT INTO stocks(LABEL, DESCRIPTION, USER_ID)
                       VALUES (${stock.LABEL}, ${stock.DESCRIPTION}, ${userID})`,
                duration: 0,
                success: success,
                resultCode: 0,
                target: DEPENDENCY_TARGET,
                dependencyTypeName: DEPENDENCY_TYPE,
            } as DependencyTelemetry)

            connection.release();
        }
    }

    async deleteStockItem(
        stockID: number,
        itemID: number
    ): Promise<ResultSetHeader> {
        let connection = await connectToDatabase();

        try {
            const [result] = await connection.execute<ResultSetHeader>(
                "DELETE FROM items WHERE ID = ? AND STOCK_ID = ?",
                [itemID, stockID]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    async deleteStock(stockID: number, userID: number): Promise<ResultSetHeader> {
        rootWriteStockRepository.info('Attempting to delete stock with ID {stockID}', stockID);

        let connection = await connectToDatabase();

        try {
            const [result] = await connection.execute<ResultSetHeader>(
                "DELETE FROM stocks WHERE ID = ? AND USER_ID = ?",
                [stockID, userID]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    async deleteStockItemsByStockID(stockID: number): Promise<void> {
        let connection = await connectToDatabase();

        try {
            await connection.execute("DELETE FROM items WHERE STOCK_ID = ?", [
                stockID,
            ]);
        } finally {
            connection.release();
        }
    }
}
