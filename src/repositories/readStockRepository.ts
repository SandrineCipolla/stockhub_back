import { FieldPacket, RowDataPacket } from 'mysql2/promise';
import { rootDependency, rootException } from '@utils/cloudLogger';
import { connectToDatabase } from '@core/dbUtils';

const QUERY_ALL_STOCKS_BY_USER = 'SELECT * FROM stocks WHERE userId = ?';
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
      throw error;
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
      const [stock] = (await connection.query('SELECT * FROM stocks WHERE id = ? AND userId = ?', [
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
      const [items] = (await connection.query('SELECT * FROM items WHERE stockId = ?', [ID])) as [
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
        'SELECT items.* FROM items JOIN stocks ON items.stockId = stocks.id WHERE userId = ?',
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
          '         JOIN stocks ON items.stockId = stocks.id \n' +
          '         WHERE items.id = ?',
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
        'SELECT items.*, stocks.label AS stockLabel FROM items JOIN stocks ON items.stockId = stocks.id WHERE items.quantity <= items.minimumStock AND stocks.userId = ?',
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
