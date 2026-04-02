import { PrismaClient } from '@prisma/client';
import {
  CollaboratorData,
  ICollaboratorRepository,
} from '@domain/authorization/collaboration/repositories/ICollaboratorRepository';
import { DependencyTelemetry, rootDependency, rootException } from '@utils/cloudLogger';

const DEPENDENCY_NAME = process.env.DB_DATABASE ?? 'stockhub';
const DEPENDENCY_TARGET = process.env.DB_HOST ?? 'localhost';
const DEPENDENCY_TYPE = 'MySQL';

export class PrismaCollaboratorRepository implements ICollaboratorRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient ?? new PrismaClient();
  }

  async findByStockId(stockId: number): Promise<CollaboratorData[]> {
    let success = false;
    const startTime = Date.now();

    try {
      const collaborators = await this.prisma.stockCollaborator.findMany({
        where: { stockId },
        include: {
          user: { select: { email: true } },
        },
        orderBy: { grantedAt: 'asc' },
      });
      success = true;
      return collaborators.map(c => this.toDomain(c));
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      const telemetry: DependencyTelemetry = {
        dependencyTypeName: DEPENDENCY_TYPE,
        data: 'findCollaboratorsByStockId',
        target: DEPENDENCY_TARGET,
        name: DEPENDENCY_NAME,
        duration: Date.now() - startTime,
        resultCode: success ? 200 : 500,
        success,
      };
      rootDependency(telemetry);
    }
  }

  async findById(collaboratorId: number): Promise<CollaboratorData | null> {
    let success = false;
    const startTime = Date.now();

    try {
      const collaborator = await this.prisma.stockCollaborator.findUnique({
        where: { id: collaboratorId },
        include: { user: { select: { email: true } } },
      });
      success = true;
      return collaborator ? this.toDomain(collaborator) : null;
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      const telemetry: DependencyTelemetry = {
        dependencyTypeName: DEPENDENCY_TYPE,
        data: 'findCollaboratorById',
        target: DEPENDENCY_TARGET,
        name: DEPENDENCY_NAME,
        duration: Date.now() - startTime,
        resultCode: success ? 200 : 500,
        success,
      };
      rootDependency(telemetry);
    }
  }

  async findUserByEmail(email: string): Promise<{ id: number } | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  async isCollaborator(stockId: number, userId: number): Promise<boolean> {
    const record = await this.prisma.stockCollaborator.findUnique({
      where: { stockId_userId: { stockId, userId } },
      select: { id: true },
    });
    return record !== null;
  }

  async add(
    stockId: number,
    userId: number,
    role: string,
    grantedBy: number
  ): Promise<CollaboratorData> {
    let success = false;
    const startTime = Date.now();

    try {
      const collaborator = await this.prisma.stockCollaborator.create({
        data: {
          stockId,
          userId,
          role: role as never,
          grantedBy,
        },
        include: { user: { select: { email: true } } },
      });
      success = true;
      return this.toDomain(collaborator);
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      const telemetry: DependencyTelemetry = {
        dependencyTypeName: DEPENDENCY_TYPE,
        data: 'addCollaborator',
        target: DEPENDENCY_TARGET,
        name: DEPENDENCY_NAME,
        duration: Date.now() - startTime,
        resultCode: success ? 201 : 500,
        success,
      };
      rootDependency(telemetry);
    }
  }

  async updateRole(collaboratorId: number, newRole: string): Promise<CollaboratorData> {
    let success = false;
    const startTime = Date.now();

    try {
      const collaborator = await this.prisma.stockCollaborator.update({
        where: { id: collaboratorId },
        data: { role: newRole as never },
        include: { user: { select: { email: true } } },
      });
      success = true;
      return this.toDomain(collaborator);
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      const telemetry: DependencyTelemetry = {
        dependencyTypeName: DEPENDENCY_TYPE,
        data: 'updateCollaboratorRole',
        target: DEPENDENCY_TARGET,
        name: DEPENDENCY_NAME,
        duration: Date.now() - startTime,
        resultCode: success ? 200 : 500,
        success,
      };
      rootDependency(telemetry);
    }
  }

  async remove(collaboratorId: number): Promise<void> {
    let success = false;
    const startTime = Date.now();

    try {
      await this.prisma.stockCollaborator.delete({ where: { id: collaboratorId } });
      success = true;
    } catch (error) {
      rootException(error as Error);
      throw error;
    } finally {
      const telemetry: DependencyTelemetry = {
        dependencyTypeName: DEPENDENCY_TYPE,
        data: 'removeCollaborator',
        target: DEPENDENCY_TARGET,
        name: DEPENDENCY_NAME,
        duration: Date.now() - startTime,
        resultCode: success ? 204 : 500,
        success,
      };
      rootDependency(telemetry);
    }
  }

  private toDomain(record: {
    id: number;
    stockId: number;
    userId: number;
    role: string;
    grantedAt: Date;
    grantedBy: number | null;
    user: { email: string };
  }): CollaboratorData {
    return {
      id: record.id,
      stockId: record.stockId,
      userId: record.userId,
      userEmail: record.user.email,
      role: record.role,
      grantedAt: record.grantedAt,
      grantedBy: record.grantedBy,
    };
  }
}
