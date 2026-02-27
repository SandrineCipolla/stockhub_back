import { StockVisualizationService } from '@domain/stock-management/visualization/services/StockVisualizationService';
import { UserService } from '@services/userService';
import { StockControllerVisualization } from '@api/controllers/StockControllerVisualization';
import { StockControllerManipulation } from '@api/controllers/StockControllerManipulation';
import {
  AddItemToStockRequest,
  CreateStockRequest,
  DeleteStockRequest,
  UpdateItemQuantityRequest,
  UpdateStockRequest,
} from '@api/types/StockRequestTypes';
import express, { Router } from 'express';
import { ReadUserRepository } from '@services/readUserRepository';
import { WriteUserRepository } from '@services/writeUserRepository';
import { PrismaStockVisualizationRepository } from '@infrastructure/stock-management/visualization/repositories/PrismaStockVisualizationRepository';
import { PrismaStockCommandRepository } from '@infrastructure/stock-management/manipulation/repositories/PrismaStockCommandRepository';
import { CreateStockCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/CreateStockCommandHandler';
import { AddItemToStockCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/AddItemToStockCommandHandler';
import { UpdateItemQuantityCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/UpdateItemQuantityCommandHandler';
import { UpdateStockCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/UpdateStockCommandHandler';
import { DeleteStockCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/DeleteStockCommandHandler';
import { rootController } from '@utils/logger';
import { PrismaClient } from '@prisma/client';
import { authorizeStockRead, authorizeStockWrite } from '@authorization/authorizeMiddleware';
import { STOCK_ROUTES } from './constants/routePaths';

const configureStockRoutesV2 = async (prismaClient?: PrismaClient): Promise<Router> => {
  const prismaRepository = new PrismaStockVisualizationRepository(prismaClient);

  const stockVisualizationService = new StockVisualizationService(prismaRepository);

  const readUserRepo = new ReadUserRepository();
  const writeUserRepo = new WriteUserRepository();
  const userService = new UserService(readUserRepo, writeUserRepo);

  const stockController = new StockControllerVisualization(stockVisualizationService, userService);

  // Manipulation setup
  const commandRepository = new PrismaStockCommandRepository(prismaClient);
  const createStockHandler = new CreateStockCommandHandler(commandRepository);
  const addItemHandler = new AddItemToStockCommandHandler(commandRepository);
  const updateQuantityHandler = new UpdateItemQuantityCommandHandler(commandRepository);
  const updateStockHandler = new UpdateStockCommandHandler(commandRepository);
  const deleteStockHandler = new DeleteStockCommandHandler(commandRepository);

  const manipulationController = new StockControllerManipulation(
    createStockHandler,
    addItemHandler,
    updateQuantityHandler,
    updateStockHandler,
    deleteStockHandler,
    userService
  );

  const logger = rootController.getChildCategory('stockRoutesV2');

  const router = Router();

  router.get(STOCK_ROUTES.LIST, async (req: express.Request, res: express.Response) => {
    await stockController.getAllStocks(req, res);
  });

  logger.info('Routes for /stocks configured');

  router.get(
    STOCK_ROUTES.DETAILS,
    authorizeStockRead,
    async (req: express.Request, res: express.Response) => {
      await stockController.getStockDetails(req, res);
    }
  );

  logger.info('Routes for /stocks/:stockId configured (with authorization)');

  router.get(
    STOCK_ROUTES.ITEMS,
    authorizeStockRead,
    async (req: express.Request, res: express.Response) => {
      await stockController.getStockItems(req, res);
    }
  );

  logger.info('Routes for /stocks/:stockId/items configured');

  // Manipulation routes
  router.post(STOCK_ROUTES.CREATE, async (req, res: express.Response) => {
    await manipulationController.createStock(req as CreateStockRequest, res);
  });

  logger.info('Routes for POST /stocks configured');

  router.post(STOCK_ROUTES.ADD_ITEM, authorizeStockWrite, async (req, res: express.Response) => {
    await manipulationController.addItemToStock(req as AddItemToStockRequest, res);
  });

  logger.info('Routes for POST /stocks/:stockId/items configured (with authorization)');

  router.patch(
    STOCK_ROUTES.UPDATE_ITEM_QUANTITY,
    authorizeStockWrite,
    async (req, res: express.Response) => {
      await manipulationController.updateItemQuantity(req as UpdateItemQuantityRequest, res);
    }
  );

  logger.info('Routes for PATCH /stocks/:stockId/items/:itemId configured (with authorization)');

  router.patch('/stocks/:stockId', async (req, res: express.Response) => {
    await manipulationController.updateStock(req as UpdateStockRequest, res);
  });

  logger.info('Routes for PATCH /stocks/:stockId configured');

  router.delete('/stocks/:stockId', async (req, res: express.Response) => {
    await manipulationController.deleteStock(req as DeleteStockRequest, res);
  });

  logger.info('Routes for DELETE /stocks/:stockId configured');

  return router;
};

export default configureStockRoutesV2;
