import { IReadUserRepository } from '@domain/user/repositories/IReadUserRepository';
import { IWriteUserRepository } from '@domain/user/repositories/IWriteUserRepository';
import { rootUserService } from '@utils/logger';

class UserIdentifier {
  public readonly empty: boolean;
  public readonly value: number;

  constructor(id: number) {
    this.empty = !id;
    this.value = id;
  }
}

export class UserService {
  private readUserRepository: IReadUserRepository;
  private writeUserRepository: IWriteUserRepository;

  constructor(readUser: IReadUserRepository, writeUser: IWriteUserRepository) {
    this.readUserRepository = readUser;
    this.writeUserRepository = writeUser;
  }

  async convertOIDtoUserID(oid: string): Promise<UserIdentifier> {
    try {
      const userID = await this.readUserRepository.readUserByOID(oid);

      // If user doesn't exist, create it automatically (for E2E)
      if (!userID) {
        rootUserService.info('User with OID {oid} not found, creating new user...', oid);
        return await this.addUser(oid);
      }

      return new UserIdentifier(userID);
    } catch (error) {
      const err = error as Error;
      rootUserService.error('Error converting OID to UserID: {message}', err.message);
      throw err;
    }
  }

  async addUser(email: string): Promise<UserIdentifier> {
    const existingUser = await this.readUserRepository.readUserByOID(email);

    if (existingUser) {
      rootUserService.info('User with email {email} already exists.', email);
      return new UserIdentifier(existingUser);
    }

    await this.writeUserRepository.addUser(email);
    return await this.convertOIDtoUserID(email);
  }
}
