import { Router } from 'express';
import express from 'express';
import { IAAnalysisService } from '@domain/stock-management/visualization/services/IAAnalysisService';
import { IAController } from '@api/controllers/IAController';
import { rootController } from '@utils/logger';
import { IA_ROUTES } from './constants/routePaths';

const configureIARoutesV2 = (): Router => {
  const iaAnalysisService = new IAAnalysisService();
  const iaController = new IAController(iaAnalysisService);

  const logger = rootController.getChildCategory('IARoutesV2');
  const router = Router();

  router.get(IA_ROUTES.CONSUMER_PROFILE, async (_req: express.Request, res: express.Response) => {
    await iaController.getConsumerProfile(_req, res);
  });

  logger.info('Routes for GET /ai/consumer-profile configured');

  return router;
};

export default configureIARoutesV2;
