import { PrismaClient, StockRole as PrismaStockRole } from '@prisma/client';

export interface UserIdentity {
  ID: number;
}

export interface StockIdentity {
  ID: number;
  USER_ID: number | null;
}

export interface CollaboratorRole {
  role: PrismaStockRole;
}

/**
 * Repository for authorization-related database queries
 * Encapsulates Prisma queries to improve testability and maintainability
 */
export class AuthorizationRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find a user by their email address
   * @param email - User's email
   * @returns User identity (ID) or null if not found
   */
  async findUserByEmail(email: string): Promise<UserIdentity | null> {
    return this.prisma.users.findUnique({
      where: { EMAIL: email },
      select: { ID: true },
    });
  }

  /**
   * Find a stock by its ID
   * @param stockId - Stock ID
   * @returns Stock identity (ID, USER_ID) or null if not found
   */
  async findStockById(stockId: number): Promise<StockIdentity | null> {
    return this.prisma.stocks.findUnique({
      where: { ID: stockId },
      select: { ID: true, USER_ID: true },
    });
  }

  /**
   * Find a collaborator relationship between a user and a stock
   * @param stockId - Stock ID
   * @param userId - User ID
   * @returns Collaborator role or null if not found
   */
  async findCollaboratorByUserAndStock(
    stockId: number,
    userId: number
  ): Promise<CollaboratorRole | null> {
    return this.prisma.stockCollaborator.findUnique({
      where: {
        stockId_userId: {
          stockId,
          userId,
        },
      },
      select: { role: true },
    });
  }
}
