import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";

export class ReadStockRepository {
  private connection: PoolConnection;

  constructor(connection: PoolConnection) {
    this.connection = connection;
  }

  async readAllStocks(userID: number) {
    const [stocks] = (await this.connection.query(
      "SELECT * FROM stocks WHERE USER_ID = ?",
      [userID]
    )) as [RowDataPacket[], FieldPacket[]];
    return stocks;
  }

  async readStockDetails(ID: number, userID: number) {
    const [stock] = (await this.connection.query(
      "SELECT * FROM stocks WHERE ID = ? AND USER_ID = ?",
      [ID, userID]
    )) as [RowDataPacket[], FieldPacket[]];
    return stock;
  }

  async readStockItems(ID: number) {
    const [items] = (await this.connection.query(
      "SELECT * FROM items WHERE STOCK_ID = ?",
      [ID]
    )) as [RowDataPacket[], FieldPacket[]];
    return items;
  }

  async readAllItems(userID: number) {
    const [items] = (await this.connection.query(
      "SELECT items.* FROM items JOIN stocks ON items.stock_ID = stocks.ID WHERE USER_ID = ?",
      [userID]
    )) as [RowDataPacket[], FieldPacket[]];
    return items;
  }

  async readItemDetails(itemID: number) {
    const [items] = (await this.connection.query(
      "SELECT items.*, stocks.label AS stockLabel \n" +
        "         FROM items \n" +
        "         JOIN stocks ON items.stock_id = stocks.id \n" +
        "         WHERE items.ID = ?",
      [itemID]
    )) as [RowDataPacket[], FieldPacket[]];
    return items;
  }

  async readLowStockItems(userId: number) {
    const [items] = (await this.connection.query(
      "SELECT items.*, stocks.LABEL AS stockLabel FROM items JOIN stocks ON items.STOCK_ID = stocks.id WHERE items.QUANTITY <= 1 AND stocks.USER_ID = ?",
      [userId]
    )) as [RowDataPacket[], FieldPacket[]];

    return items;
  }
}
