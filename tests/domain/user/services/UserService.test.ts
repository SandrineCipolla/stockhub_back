import { IReadUserRepository } from '@domain/user/repositories/IReadUserRepository';
import { IWriteUserRepository } from '@domain/user/repositories/IWriteUserRepository';
import { UserService } from '@domain/user/services/UserService';

jest.mock('@utils/logger', () => ({
  rootUserService: { info: jest.fn(), error: jest.fn() },
}));

// Note: no OID validation guard - empty OID creates a user with empty email.
// Input validation is a future improvement.

describe('UserService', () => {
  let mockReadUserRepository: jest.Mocked<IReadUserRepository>;
  let mockWriteUserRepository: jest.Mocked<IWriteUserRepository>;
  let userService: UserService;

  beforeEach(() => {
    mockReadUserRepository = { readUserByOID: jest.fn() };
    mockWriteUserRepository = { addUser: jest.fn() };
    userService = new UserService(mockReadUserRepository, mockWriteUserRepository);
    jest.clearAllMocks();
  });

  describe('convertOIDtoUserID', () => {
    describe('existing user', () => {
      it('should return the internal ID without calling the write repository', async () => {
        mockReadUserRepository.readUserByOID.mockResolvedValue(42);

        const result = await userService.convertOIDtoUserID('user@example.com');

        expect(mockReadUserRepository.readUserByOID).toHaveBeenCalledWith('user@example.com');
        expect(mockWriteUserRepository.addUser).not.toHaveBeenCalled();
        expect(result.value).toBe(42);
        expect(result.empty).toBe(false);
      });
    });

    describe('new user', () => {
      it('should create the user and return the new internal ID', async () => {
        mockReadUserRepository.readUserByOID
          .mockResolvedValueOnce(undefined) // first call: user not found
          .mockResolvedValueOnce(undefined) // addUser re-checks existence
          .mockResolvedValueOnce(99); // convertOIDtoUserID call inside addUser
        mockWriteUserRepository.addUser.mockResolvedValue(undefined);

        const result = await userService.convertOIDtoUserID('new@example.com');

        expect(mockWriteUserRepository.addUser).toHaveBeenCalledWith('new@example.com');
        expect(result.value).toBe(99);
        expect(result.empty).toBe(false);
      });
    });

    describe('error cases', () => {
      it('should propagate an error from the read repository', async () => {
        const error = new Error('DB connection failed');
        mockReadUserRepository.readUserByOID.mockRejectedValue(error);

        await expect(userService.convertOIDtoUserID('user@example.com')).rejects.toThrow(
          'DB connection failed'
        );
      });

      it('should propagate an error from the write repository', async () => {
        const error = new Error('Upsert failed');
        mockReadUserRepository.readUserByOID.mockResolvedValue(undefined);
        mockWriteUserRepository.addUser.mockRejectedValue(error);

        await expect(userService.convertOIDtoUserID('user@example.com')).rejects.toThrow(
          'Upsert failed'
        );
      });
    });
  });

  describe('addUser', () => {
    describe('idempotency', () => {
      it('should not call the write repository if the user already exists', async () => {
        mockReadUserRepository.readUserByOID.mockResolvedValue(7);

        const result = await userService.addUser('existing@example.com');

        expect(mockWriteUserRepository.addUser).not.toHaveBeenCalled();
        expect(result.value).toBe(7);
      });
    });

    describe('new user', () => {
      it('should write and return the created user ID', async () => {
        mockReadUserRepository.readUserByOID
          .mockResolvedValueOnce(undefined) // addUser existence check
          .mockResolvedValueOnce(undefined) // convertOIDtoUserID check
          .mockResolvedValueOnce(55); // convertOIDtoUserID -> addUser -> convertOIDtoUserID
        mockWriteUserRepository.addUser.mockResolvedValue(undefined);

        const result = await userService.addUser('brand-new@example.com');

        expect(mockWriteUserRepository.addUser).toHaveBeenCalledWith('brand-new@example.com');
        expect(result.value).toBe(55);
      });
    });
  });
});
