import { StockVisualizationService } from '@domain/stock-management/visualization/services/StockVisualizationService';
import { UserService } from '@services/userService';
import { StockControllerVisualization } from '@api/controllers/StockControllerVisualization';
import { StockControllerManipulation } from '@api/controllers/StockControllerManipulation';
import {
  AddItemToStockRequest,
  CreateStockRequest,
  DeleteItemRequest,
  DeleteStockRequest,
  UpdateItemRequest,
  UpdateStockRequest,
} from '@api/types/StockRequestTypes';
import express, { Router } from 'express';
import { ReadUserRepository } from '@services/readUserRepository';
import { WriteUserRepository } from '@services/writeUserRepository';
import { PrismaStockVisualizationRepository } from '@infrastructure/stock-management/visualization/repositories/PrismaStockVisualizationRepository';
import { PrismaStockCommandRepository } from '@infrastructure/stock-management/manipulation/repositories/PrismaStockCommandRepository';
import { CreateStockCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/CreateStockCommandHandler';
import { AddItemToStockCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/AddItemToStockCommandHandler';
import { UpdateItemCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/UpdateItemCommandHandler';
import { UpdateItemQuantityCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/UpdateItemQuantityCommandHandler';
import { UpdateStockCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/UpdateStockCommandHandler';
import { DeleteStockCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/DeleteStockCommandHandler';
import { DeleteItemCommandHandler } from '@domain/stock-management/manipulation/command-handlers(UseCase)/DeleteItemCommandHandler';
import { rootController } from '@utils/logger';
import { PrismaClient } from '@prisma/client';
import { authorizeStockRead, authorizeStockWrite } from '@authorization/authorizeMiddleware';
import { STOCK_ROUTES } from './constants/routePaths';
import { PrismaItemHistoryRepository } from '@infrastructure/prediction/repositories/PrismaItemHistoryRepository';
import { PrismaStockPredictionRepository } from '@infrastructure/prediction/repositories/PrismaStockPredictionRepository';
import { StockPredictionService } from '@domain/prediction/services/StockPredictionService';
import { StockPredictionController } from '@api/controllers/StockPredictionController';
import { StockSuggestionsController } from '@api/controllers/StockSuggestionsController';
import { AuthenticatedRequest } from '@api/types/AuthenticatedRequest';
import { OpenRouterAIService } from '@infrastructure/ai/OpenRouterAIService';

const configureStockRoutesV2 = async (prismaClient?: PrismaClient): Promise<Router> => {
  const prismaRepository = new PrismaStockVisualizationRepository(prismaClient);

  const stockVisualizationService = new StockVisualizationService(prismaRepository);

  const readUserRepo = new ReadUserRepository();
  const writeUserRepo = new WriteUserRepository();
  const userService = new UserService(readUserRepo, writeUserRepo);

  const stockController = new StockControllerVisualization(stockVisualizationService, userService);

  // Manipulation setup
  const commandRepository = new PrismaStockCommandRepository(prismaClient);
  const historyRepository = new PrismaItemHistoryRepository(prismaClient);
  const predictionRepository = new PrismaStockPredictionRepository(prismaClient);

  const createStockHandler = new CreateStockCommandHandler(commandRepository);
  const addItemHandler = new AddItemToStockCommandHandler(commandRepository, historyRepository);
  const updateQuantityHandler = new UpdateItemQuantityCommandHandler(
    commandRepository,
    historyRepository
  );
  const updateItemHandler = new UpdateItemCommandHandler(commandRepository, historyRepository);
  const updateStockHandler = new UpdateStockCommandHandler(commandRepository);
  const deleteStockHandler = new DeleteStockCommandHandler(commandRepository);
  const deleteItemHandler = new DeleteItemCommandHandler(commandRepository);

  const predictionService = new StockPredictionService(historyRepository, predictionRepository);
  const predictionController = new StockPredictionController(
    predictionService,
    historyRepository,
    predictionRepository
  );

  const aiService = new OpenRouterAIService();
  const suggestionsController = new StockSuggestionsController(
    prismaRepository,
    predictionRepository,
    aiService,
    userService,
    predictionService
  );

  const manipulationController = new StockControllerManipulation(
    createStockHandler,
    addItemHandler,
    updateQuantityHandler,
    updateItemHandler,
    updateStockHandler,
    deleteStockHandler,
    deleteItemHandler,
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
      await manipulationController.updateItem(req as UpdateItemRequest, res);
    }
  );

  logger.info('Routes for PATCH /stocks/:stockId/items/:itemId configured (with authorization)');

  router.patch('/stocks/:stockId', authorizeStockWrite, async (req, res: express.Response) => {
    await manipulationController.updateStock(req as UpdateStockRequest, res);
  });

  logger.info('Routes for PATCH /stocks/:stockId configured (with authorization)');

  router.delete(
    STOCK_ROUTES.DELETE_ITEM,
    authorizeStockWrite,
    async (req, res: express.Response) => {
      await manipulationController.deleteItem(req as DeleteItemRequest, res);
    }
  );

  logger.info('Routes for DELETE /stocks/:stockId/items/:itemId configured (with authorization)');

  router.delete('/stocks/:stockId', authorizeStockWrite, async (req, res: express.Response) => {
    await manipulationController.deleteStock(req as DeleteStockRequest, res);
  });

  logger.info('Routes for DELETE /stocks/:stockId configured (with authorization)');

  router.get(STOCK_ROUTES.ITEM_HISTORY, authorizeStockRead, async (req, res: express.Response) => {
    await predictionController.getItemHistory(req as AuthenticatedRequest, res);
  });

  logger.info('Routes for GET /stocks/:stockId/items/:itemId/history configured');

  router.get(
    STOCK_ROUTES.ITEM_PREDICTION,
    authorizeStockRead,
    async (req, res: express.Response) => {
      await predictionController.getItemPrediction(req as AuthenticatedRequest, res);
    }
  );

  logger.info('Routes for GET /stocks/:stockId/items/:itemId/prediction configured');

  router.get(
    STOCK_ROUTES.STOCK_SUGGESTIONS,
    authorizeStockRead,
    async (req, res: express.Response) => {
      await suggestionsController.getStockSuggestions(req as AuthenticatedRequest, res);
    }
  );

  logger.info('Routes for GET /stocks/:stockId/suggestions configured');

  return router;
};

export default configureStockRoutesV2;
