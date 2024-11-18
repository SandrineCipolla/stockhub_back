import {PoolConnection} from "mysql2/promise";
import {CustomError, DatabaseError, ErrorMessages} from "../errors";

export class WriteUserRepository {
    private connection: PoolConnection;

    constructor(connection: PoolConnection) {
        this.connection = connection;
    }

    async addUser(email: string) {
        //     await this.connection.query("INSERT INTO users (EMAIL) VALUES (?)", [email]);
        // }
        try {
            const sql = 'INSERT INTO users (EMAIL) VALUES (?)';
            await this.connection.query(sql, [email]);
            console.log(`User added successfully: ${email}`);
        } catch (error: any) {
            // Gérer l'erreur de doublon
            if (error.code === 'ER_DUP_ENTRY') {
                console.log(`User with email ${email} already exists in the database.`);
            } else {
                throw new DatabaseError("Error adding user to DB", ErrorMessages.AddUser);
            }
        }
    }
}