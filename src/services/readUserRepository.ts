import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import { rootReadUserRepository } from "../Utils/logger";
import { connectToDatabase } from "../dbUtils";

export class ReadUserRepository {
  async readUserByOID(oid: string) {
    rootReadUserRepository.info("readUserByOID {oid}", { oid });

    const query = "SELECT ID FROM users WHERE EMAIL = ?";

    let connection = await connectToDatabase();

    try {
      const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.execute(
        query,
        [oid]
      );

      if (!rows || rows.length === 0) {
        rootReadUserRepository.error(`User not found for OID: ${oid}`);
        return undefined;
      }

      const user = rows[0];
      if (!user || !user.ID) {
        rootReadUserRepository.error(`User ID not found for OID: ${oid}`);
        return undefined;
      }

      rootReadUserRepository.info(`User ID found: ${user.ID} for OID: ${oid}`);
      return user.ID;
    } finally {
      connection.release();
    }
  }
}
