import {PoolConnection} from "mysql2/promise";
import {Stock} from "../../src/models";


export interface TableColumn {
    column_name: string;
    data_type: string;
}


export async function getTableStructure(
    connection: PoolConnection,
    tableName: string
): Promise<TableColumn[]> {
    try {
        console.log("Fetching table structure for table:", tableName);

        const query = `
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = ?
        `;

        const [rows] = await connection.query(query, [tableName]);
        if (!rows) {
            throw new Error(`No data returned for table ${tableName}`);
        }
        return rows as TableColumn[];
    } catch (error: any) {
        throw new Error(
            //Erreur lors de la récupération de la structure de la table
            `Error retrieving table structure : ${error.message}`
        );
    }
}

export async function insertStock(
    connection: PoolConnection,
    stocks: Stock[]
): Promise<void> {
    try {
        console.info("Inserting stocks:", stocks);
        const values = stocks.map((stock) => ({
            id:stock.id,
            label:stock.label,
            description:stock.description,
            quantity:stock.quantity
        }));
        console.info("Formatted values:", values);
        const query = "INSERT INTO stocks (id,label,description) VALUES ?";
        console.info("query", query);
        await connection.query(query, [values]);
        console.info("Stocks inserted successfully!");
    } catch (error: any) {
        console.error(`Error inserting stocks: ${error.message}`);
        throw new Error(`Error inserting stocks : ${error.message}`);
    }
}
