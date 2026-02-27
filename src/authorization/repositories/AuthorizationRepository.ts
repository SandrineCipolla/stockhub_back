import { PrismaClient } from '@prisma/client';

export interface UserIdentity {
  id: number;
}

export interface StockIdentity {
  id: number;
  userId: number | null;
}

export interface CollaboratorRole {
  role: string;
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
   * @returns User identity (id) or null if not found
   */
  async findUserByEmail(email: string): Promise<UserIdentity | null> {
    return this.prisma.user.findUnique({
      where: { email: email },
      select: { id: true },
    });
  }

  /**
   * Find a stock by its ID
   * @param stockId - Stock ID
   * @returns Stock identity (id, userId) or null if not found
   */
  async findStockById(stockId: number): Promise<StockIdentity | null> {
    return this.prisma.stock.findUnique({
      where: { id: stockId },
      select: { id: true, userId: true },
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
