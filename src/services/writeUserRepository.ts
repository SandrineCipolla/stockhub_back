import { PrismaClient } from '@prisma/client';
import { rootDatabase } from '@utils/logger';

export class WriteUserRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async addUser(email: string): Promise<void> {
    await this.prisma.user.upsert({
      where: { email },
      create: { email },
      update: {},
    });
    rootDatabase.info(`User added successfully: ${email}`);
  }
}
