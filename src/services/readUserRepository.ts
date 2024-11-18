import {FieldPacket, PoolConnection, RowDataPacket} from "mysql2/promise";
import {rootReadUserRepository} from "../Utils/logger";

export class ReadUserRepository {
    private connection: PoolConnection;

    constructor(connection: PoolConnection) {
        this.connection = connection;
    }

    async readUserByOID(oid: string) {
        // const userID = await this.connection.query("SELECT ID FROM users WHERE EMAIL = ?", [oid]) as [RowDataPacket[], FieldPacket[]];
        // return userID[0][0].ID;

        rootReadUserRepository.info('readUserByOID {oid}', {oid});

        const query = 'SELECT ID FROM users WHERE EMAIL = ?';
        const [rows]: [RowDataPacket[], FieldPacket[]] = await this.connection.execute(query, [oid]);

        if (!rows || rows.length === 0) {
            rootReadUserRepository.error(`User not found for OID: ${oid}`);
            return undefined;
        }

        const user = rows[0];
        if (!user || !user.ID) {
            rootReadUserRepository.error(`User ID not found for OID: ${oid}`);
            return undefined;
        }
        rootReadUserRepository.info(`User ID found: ${user.ID} for OID: ${oid}`)
        return user.ID;
    }

}