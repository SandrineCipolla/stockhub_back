import { RowDataPacket } from 'mysql2/promise';

export interface CustomRowDataPacket extends RowDataPacket {
  ID: number;
  LABEL: string;
  DESCRIPTION: string;
  QUANTITY: number;
}

export class Stock {
  id: number;
  label: string;
  description: string;
  quantity: number;
  minimumStock?: number;

  constructor(id: number, label: string, description: string, quantity: number) {
    this.id = id;
    this.label = label;
    this.description = description;
    this.quantity = quantity;
  }
}

export interface StockToCreate {
  LABEL: string;
  DESCRIPTION: string;
}

export class UpdateStockRequest {
  itemID: number;
  quantity: number;
  stockID: number;

  constructor(itemID: number, quantity: number, stockID: number) {
    this.itemID = itemID;
    this.quantity = quantity;
    this.stockID = stockID;
  }
}

export class Item {
  id: number;
  label: string;
  description: string;
  quantity: number;
  stock_id: number;

  constructor(id: number, label: string, description: string, quantity: number, stock_id: number) {
    this.id = id;
    this.label = label;
    this.description = description;
    this.quantity = quantity;
    this.stock_id = stock_id;
  }
}
