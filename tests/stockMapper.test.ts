
import { RowDataPacket } from 'mysql2/promise';
import {StockMapper} from "../src/stockMapper";
import {exampleRow, expectedStock} from "./__mocks__/mockedData";
import {Stock} from "../src/models";

describe('StockMapper', () => {
    it('should map RowDataPacket to Stock', () => {
        const stock = StockMapper.mapRowDataPacketToStock(exampleRow);
        expect(stock).toEqual(expectedStock);
    });

    it('should map an array of RowDataPacket to an array of Stock', () => {
        const rows:RowDataPacket[] = [
            { ID: 1, LABEL: 'Label 1', DESCRIPTION: 'Desc 1', QUANTITY: 10 } as RowDataPacket,
            { ID: 2, LABEL: 'Label 2', DESCRIPTION: 'Desc 2', QUANTITY: 20 } as RowDataPacket,
        ];

        const stocks = StockMapper.mapRowDataPacketsToStocks(rows);
        const expectedStocks: Stock[] = [
            { id: 1, label: 'Label 1', description: 'Desc 1', quantity: 10 },
            { id: 2, label: 'Label 2', description: 'Desc 2', quantity: 20 },
        ];
        expect(stocks).toEqual(expectedStocks);
    });
});
