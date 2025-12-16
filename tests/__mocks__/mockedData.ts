import {TableColumn} from "../_integration_old/dbUtils";
import {CustomRowDataPacket, Stock} from "@core/models";
import {RowDataPacket} from "mysql2/promise";
import {WriteStockRepository} from "@repositories/writeStockRepository";
import {ReadStockRepository} from "@repositories/readStockRepository";

export const exampleRow = {
    ID: 1,
    LABEL: "Example Label",
    DESCRIPTION: "Example Description",
    QUANTITY: 100,
} as CustomRowDataPacket;

export const expectedStock: Stock = {
    id: 1,
    label: "Example Label",
    description: "Example Description",
    quantity: 100,
};

export const fakeStocks: Stock[] = [
    {id: 1, label: "Stock1", description: "Description1", quantity: 10},
    {id: 2, label: "Stock2", description: "Description2", quantity: 20},
    {id: 3, label: "Stock3", description: "Description3", quantity: 30},
];

export const fakeStocksWithoutId = [
    {id: undefined, label: "Stock1"},
    {id: undefined, label: "Stock2"},
];

export const expectedTableStructure: TableColumn[] = [
    {column_name: "id", data_type: "int"},
    {column_name: "label", data_type: "varchar"},
];

export const newStocks: Stock[] = [
    {id: 4, label: "MyNewStock", description: "MyNewDescription", quantity: 40},
];

export const fakeStocksAsRowDataPacket: RowDataPacket[] = fakeStocks.map(
    (stock) =>
        ({
            ID: stock.id,
            LABEL: stock.label,
            DESCRIPTION: stock.description,
            QUANTITY: stock.quantity,
        } as RowDataPacket)
);

export const mockReadRepo =
    new ReadStockRepository() as jest.Mocked<ReadStockRepository>;

export const mockWriteRepo =
    new WriteStockRepository() as jest.Mocked<WriteStockRepository>;
