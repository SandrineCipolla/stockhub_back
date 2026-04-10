export interface IReadUserRepository {
  readUserByOID(oid: string): Promise<number | undefined>;
}
