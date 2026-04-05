import express from 'express';
import { AuthenticatedRequest } from '@api/types/AuthenticatedRequest';
import { CreateContributionRequest, ReviewContributionRequest } from '@api/types/StockRequestTypes';
import { UserService } from '@services/userService';
import { CreateContributionCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/CreateContributionCommandHandler';
import { ReviewContributionCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/ReviewContributionCommandHandler';
import { CreateContributionCommand } from '@domain/stock-management/manipulation/commands(Request)/CreateContributionCommand';
import { ReviewContributionCommand } from '@domain/stock-management/manipulation/commands(Request)/ReviewContributionCommand';
import { IContributionRepository } from '@domain/stock-management/manipulation/repositories/IContributionRepository';
import { HTTP_CODE_CREATED, HTTP_CODE_OK } from '@utils/httpCodes';
import { CustomError, sendError } from '@core/errors';
import { rootMain } from '@utils/logger';
import { rootException } from '@utils/cloudLogger';

export class StockContributionController {
  constructor(
    private readonly createHandler: CreateContributionCommandHandler,
    private readonly reviewHandler: ReviewContributionCommandHandler,
    private readonly contributionRepository: IContributionRepository,
    private readonly userService: UserService
  ) {}

  private getValidatedOID(req: AuthenticatedRequest, res: express.Response): string | null {
    const OID = req.userID;
    if (!OID || OID.trim() === '') {
      res.status(401).json({ error: 'User not authenticated' });
      return null;
    }
    return OID;
  }

  public async createContribution(req: CreateContributionRequest, res: express.Response) {
    try {
      const OID = this.getValidatedOID(req, res);
      if (!OID) return;

      const stockId = Number(req.params.stockId);
      const itemId = Number(req.params.itemId);
      const { suggestedQuantity } = req.body;

      const userId = await this.userService.convertOIDtoUserID(OID);

      const command = new CreateContributionCommand(
        itemId,
        stockId,
        userId.value,
        suggestedQuantity
      );
      const contribution = await this.createHandler.handle(command);

      rootMain.info(
        `createContribution OID=${OID} stockId=${stockId} itemId=${itemId} quantity=${suggestedQuantity}`
      );

      res.status(HTTP_CODE_CREATED).json(contribution);
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  public async getPendingCount(req: AuthenticatedRequest, res: express.Response) {
    try {
      const OID = this.getValidatedOID(req, res);
      if (!OID) return;
      const userId = await this.userService.convertOIDtoUserID(OID);
      const count = await this.contributionRepository.countPendingByOwner(userId.value);
      rootMain.info(`getPendingCount OID=${OID} count=${count}`);
      res.status(HTTP_CODE_OK).json({ count });
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  public async listContributions(req: AuthenticatedRequest, res: express.Response) {
    try {
      const OID = this.getValidatedOID(req, res);
      if (!OID) return;

      const stockId = Number(req.params.stockId);
      const contributions = await this.contributionRepository.findPendingByStockId(stockId);

      rootMain.info(
        `listContributions OID=${OID} stockId=${stockId} count=${contributions.length}`
      );

      res.status(HTTP_CODE_OK).json(contributions);
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }

  public async reviewContribution(req: ReviewContributionRequest, res: express.Response) {
    try {
      const OID = this.getValidatedOID(req, res);
      if (!OID) return;

      const stockId = Number(req.params.stockId);
      const contributionId = Number(req.params.contributionId);
      const { action } = req.body;

      const userId = await this.userService.convertOIDtoUserID(OID);

      const command = new ReviewContributionCommand(contributionId, stockId, userId.value, action);
      const contribution = await this.reviewHandler.handle(command);

      rootMain.info(
        `reviewContribution OID=${OID} stockId=${stockId} contributionId=${contributionId} action=${action}`
      );

      res.status(HTTP_CODE_OK).json(contribution);
    } catch (err) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }
}
