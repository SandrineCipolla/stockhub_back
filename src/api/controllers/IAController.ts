import { IAAnalysisService } from '@domain/stock-management/visualization/services/IAAnalysisService';
import { HTTP_CODE_OK } from '@utils/httpCodes';
import { CustomError, sendError } from '@core/errors';
import express from 'express';
import { rootController } from '@utils/logger';
import { rootException } from '@utils/cloudLogger';

export class IAController {
  private readonly logger = rootController.getChildCategory('IAController');

  constructor(private readonly iaAnalysisService: IAAnalysisService) {}

  public async getConsumerProfile(_req: express.Request, res: express.Response) {
    try {
      this.logger.info('Generating consumer profile...');
      const profile = await this.iaAnalysisService.generateConsumerProfile();
      this.logger.info('Consumer profile generated successfully');
      res.status(HTTP_CODE_OK).json(profile);
    } catch (err: unknown) {
      rootException(err as Error);
      sendError(res, err as CustomError);
    }
  }
}
