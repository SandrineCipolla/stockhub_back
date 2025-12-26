import { DatabaseError, ErrorMessages } from '@core/errors';
import { connectToDatabase } from '@core/dbUtils';
import { rootDatabase } from '@utils/logger';

export class WriteUserRepository {
  async addUser(email: string) {
    const connection = await connectToDatabase();

    try {
      const sql = 'INSERT INTO users (EMAIL) VALUES (?)';
      await connection.query(sql, [email]);
      rootDatabase.info(`User added successfully: ${email}`);
    } catch (error: unknown) {
      // Gérer l'erreur de doublon
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
        rootDatabase.info(`User with email ${email} already exists in the database.`);
      } else {
        throw new DatabaseError('Error adding user to DB', ErrorMessages.AddUser);
      }
    } finally {
      connection.release();
    }
  }
}
