export interface IWriteUserRepository {
  addUser(email: string): Promise<void>;
}
