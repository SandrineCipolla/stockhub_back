import { FieldPacket, RowDataPacket } from 'mysql2/promise';
import { rootDependency, rootException } from '@utils/cloudLogger';
import { connectToDatabase } from '@core/dbUtils';

const QUERY_ALL_STOCKS_BY_USER = 'SELECT * FROM stocks WHERE USER_ID = ?';
export class ReadStockRepository {
  async readAllStocks(userID: number) {
    const depTelemetry = this.createDepTelemetry(
      'readAllStocks',
      QUERY_ALL_STOCKS_BY_USER + ' - ' + userID
    );

    const connection = await connectToDatabase();

    const startTime = Date.now();

    try {
      const [stocks] = (await connection.query(QUERY_ALL_STOCKS_BY_USER, [userID])) as [
        RowDataPacket[],
        FieldPacket[],
      ];

      depTelemetry.success = true;
      depTelemetry.duration = this.computeDuration(startTime);

      return stocks;
    } catch (error) {
      rootException(new Error('Error while reading all stocks'));
      depTelemetry.duration = this.computeDuration(startTime);
    } finally {
      connection.release();
      rootDependency(depTelemetry);
    }
  }

  private computeDuration(startTime: number) {
    return Date.now() - startTime;
  }

  async readStockDetails(ID: number, userID: number) {
    const connection = await connectToDatabase();

    try {
      const [stock] = (await connection.query('SELECT * FROM stocks WHERE ID = ? AND USER_ID = ?', [
        ID,
        userID,
      ])) as [RowDataPacket[], FieldPacket[]];

      return stock;
    } finally {
      connection.release();
    }
  }

  async readStockItems(ID: number) {
    const connection = await connectToDatabase();

    try {
      const [items] = (await connection.query('SELECT * FROM items WHERE STOCK_ID = ?', [ID])) as [
        RowDataPacket[],
        FieldPacket[],
      ];
      return items;
    } finally {
      connection.release();
    }
  }

  async readAllItems(userID: number) {
    const connection = await connectToDatabase();

    try {
      const [items] = (await connection.query(
        'SELECT items.* FROM items JOIN stocks ON items.stock_ID = stocks.ID WHERE USER_ID = ?',
        [userID]
      )) as [RowDataPacket[], FieldPacket[]];
      return items;
    } finally {
      connection.release();
    }
  }

  async readItemDetails(itemID: number) {
    const connection = await connectToDatabase();

    try {
      const [items] = (await connection.query(
        'SELECT items.*, stocks.label AS stockLabel \n' +
          '         FROM items \n' +
          '         JOIN stocks ON items.stock_id = stocks.id \n' +
          '         WHERE items.ID = ?',
        [itemID]
      )) as [RowDataPacket[], FieldPacket[]];
      return items;
    } finally {
      connection.release();
    }
  }

  async readLowStockItems(userId: number) {
    const connection = await connectToDatabase();

    try {
      const [items] = (await connection.query(
        'SELECT items.*, stocks.LABEL AS stockLabel FROM items JOIN stocks ON items.STOCK_ID = stocks.id WHERE items.QUANTITY <= items.MINIMUM_STOCK AND stocks.USER_ID = ?',
        [userId]
      )) as [RowDataPacket[], FieldPacket[]];

      return items;
    } finally {
      connection.release();
    }
  }

  private createDepTelemetry(name: string, data: string) {
    return {
      target: 'http://stockhub',
      name: name,
      data: data,
      duration: 0,
      resultCode: 0,
      success: false,
      dependencyTypeName: 'MySQL',
    };
  }
}
