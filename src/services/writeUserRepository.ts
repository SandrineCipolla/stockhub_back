import { PoolConnection } from "mysql2/promise";
import { CustomError, DatabaseError, ErrorMessages } from "../errors";
import { connectToDatabase } from "../dbUtils";

export class WriteUserRepository {
  async addUser(email: string) {
    let connection = await connectToDatabase();

    try {
      const sql = "INSERT INTO users (EMAIL) VALUES (?)";
      await connection.query(sql, [email]);
      console.log(`User added successfully: ${email}`);
    } catch (error: any) {
      // Gérer l'erreur de doublon
      if (error.code === "ER_DUP_ENTRY") {
        console.log(`User with email ${email} already exists in the database.`);
      } else {
        throw new DatabaseError(
          "Error adding user to DB",
          ErrorMessages.AddUser
        );
      }
    } finally {
      connection.release();
    }
  }
}
