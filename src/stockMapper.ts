import {RowDataPacket} from "mysql2/promise";
import {Stock} from "@core/models";

export class StockMapper {
    static mapRowDataPacketToStock(row: RowDataPacket): Stock {
        return {
            id: row.ID,
            label: row.LABEL,
            description: row.DESCRIPTION,
            quantity: row.QUANTITY
        } as Stock;
    }

    static mapRowDataPacketsToStocks(rows: RowDataPacket[]): Stock[] {
        return rows.map(this.mapRowDataPacketToStock);
    }
}