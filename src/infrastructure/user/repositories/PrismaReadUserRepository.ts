import { PrismaClient } from '@prisma/client';
import { IReadUserRepository } from '@domain/user/repositories/IReadUserRepository';
import { rootReadUserRepository } from '@utils/logger';

export class PrismaReadUserRepository implements IReadUserRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async readUserByOID(oid: string): Promise<number | undefined> {
    rootReadUserRepository.info('readUserByOID {oid}', { oid });

    const user = await this.prisma.user.findUnique({
      where: { email: oid },
      select: { id: true },
    });

    if (!user) {
      rootReadUserRepository.error(`User not found for OID: ${oid}`);
      return undefined;
    }

    rootReadUserRepository.info(`User ID found: ${user.id} for OID: ${oid}`);
    return user.id;
  }
}
