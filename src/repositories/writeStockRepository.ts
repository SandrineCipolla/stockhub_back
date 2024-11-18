import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { Stock, StockToCreate, UpdateStockRequest } from "../models";
import { ErrorMessages, ValidationError } from "../errors";
import { connectToDatabase } from "../dbUtils";

export class WriteStockRepository {
  async updateStockItemQuantity(updateRequest: UpdateStockRequest) {
    const { itemID, quantity, stockID } = updateRequest;

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

      return { itemID, quantity, stockID };
    } finally {
      connection.release();
    }
  }

  async addStockItem(item: Partial<Stock>, stockID: number) {
    if (!item.label || !item.description || item.quantity === undefined) {
      throw new ValidationError(
        "Label, description and quantity must be provided.",
        ErrorMessages.AddStockItem,
        item
      );
    }
    let connection = await connectToDatabase();

    try {
      await connection.query("INSERT INTO items VALUES (?, ?, ?, ? ,?)", [
        item.id,
        item.label,
        item.description,
        item.quantity,
        stockID,
      ]);
    } finally {
      connection.release();
    }
  }

  async createStock(stock: Partial<StockToCreate>, userID: number) {
    let connection = await connectToDatabase();

    try {
      await connection.query(
        "INSERT INTO stocks(LABEL, DESCRIPTION,USER_ID) VALUES (?, ?,?)",
        [stock.LABEL, stock.DESCRIPTION, userID]
      );
    } finally {
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
    console.log("Attempting to delete stock with ID - repo:", stockID);

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
