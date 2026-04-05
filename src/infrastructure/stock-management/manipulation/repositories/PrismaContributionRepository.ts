import {
  PrismaClient,
  ItemContribution as PrismaItemContribution,
  ContributionStatus as PrismaContributionStatus,
} from '@prisma/client';
import { IContributionRepository } from '@domain/stock-management/manipulation/repositories/IContributionRepository';
import { ItemContribution } from '@domain/stock-management/common/entities/ItemContribution';
import { ContributionStatus } from '@domain/stock-management/common/value-objects/ContributionStatus';
import { rootDependency, rootException } from '@utils/cloudLogger';

const DEPENDENCY_NAME = process.env.DB_DATABASE ?? 'stockhub';
const DEPENDENCY_TARGET = process.env.DB_HOST ?? 'localhost';
const DEPENDENCY_TYPE = 'MySQL';

export class PrismaContributionRepository implements IContributionRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async save(contribution: ItemContribution): Promise<ItemContribution> {
    let success = false;
    try {
      const created = await this.prisma.itemContribution.create({
        data: {
          itemId: contribution.itemId,
          stockId: contribution.stockId,
          contributedBy: contribution.contributedBy,
          suggestedQuantity: contribution.suggestedQuantity,
          status: contribution.status.toString() as PrismaContributionStatus,
        },
      });
      success = true;
      return this.toDomain(created);
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      rootDependency({
        name: DEPENDENCY_NAME,
        target: DEPENDENCY_TARGET,
        dependencyTypeName: DEPENDENCY_TYPE,
        data: '',
        duration: 0,
        resultCode: 0,
        success,
      });
    }
  }

  async findById(id: number): Promise<ItemContribution | null> {
    let success = false;
    try {
      const found = await this.prisma.itemContribution.findUnique({ where: { id } });
      success = true;
      return found ? this.toDomain(found) : null;
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      rootDependency({
        name: DEPENDENCY_NAME,
        target: DEPENDENCY_TARGET,
        dependencyTypeName: DEPENDENCY_TYPE,
        data: '',
        duration: 0,
        resultCode: 0,
        success,
      });
    }
  }

  async findPendingByStockId(stockId: number): Promise<ItemContribution[]> {
    let success = false;
    try {
      const rows = await this.prisma.itemContribution.findMany({
        where: { stockId, status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
      });
      success = true;
      return rows.map(r => this.toDomain(r));
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      rootDependency({
        name: DEPENDENCY_NAME,
        target: DEPENDENCY_TARGET,
        dependencyTypeName: DEPENDENCY_TYPE,
        data: '',
        duration: 0,
        resultCode: 0,
        success,
      });
    }
  }

  async update(contribution: ItemContribution): Promise<ItemContribution> {
    let success = false;
    try {
      const updated = await this.prisma.itemContribution.update({
        where: { id: contribution.id },
        data: {
          status: contribution.status.toString() as PrismaContributionStatus,
          reviewedBy: contribution.reviewedBy,
          reviewedAt: contribution.reviewedAt,
        },
      });
      success = true;
      return this.toDomain(updated);
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      rootDependency({
        name: DEPENDENCY_NAME,
        target: DEPENDENCY_TARGET,
        dependencyTypeName: DEPENDENCY_TYPE,
        data: '',
        duration: 0,
        resultCode: 0,
        success,
      });
    }
  }

  async countPendingByOwner(ownerUserId: number): Promise<number> {
    return this.prisma.itemContribution.count({
      where: {
        status: 'PENDING',
        stock: { userId: ownerUserId },
      },
    });
  }

  private toDomain(row: PrismaItemContribution): ItemContribution {
    return new ItemContribution(
      row.id,
      row.itemId,
      row.stockId,
      row.contributedBy,
      row.suggestedQuantity,
      new ContributionStatus(row.status),
      row.reviewedBy,
      row.reviewedAt,
      row.createdAt
    );
  }
}
