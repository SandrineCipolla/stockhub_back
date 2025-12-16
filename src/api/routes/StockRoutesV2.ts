import {
    StockVisualizationService
} from "@domain/stock-management/visualization/services/StockVisualizationService";
import {UserService} from "@services/userService";
import {StockControllerVisualization} from "@api/controllers/StockControllerVisualization";
import {StockControllerManipulation} from "@api/controllers/StockControllerManipulation";
import {Router} from "express";
import {ReadUserRepository} from "@services/readUserRepository";
import {WriteUserRepository} from "@services/writeUserRepository";
import {
    PrismaStockVisualizationRepository
} from "@infrastructure/stock-management/visualization/repositories/PrismaStockVisualizationRepository";
import {
    PrismaStockCommandRepository
} from "@infrastructure/stock-management/manipulation/repositories/PrismaStockCommandRepository";
import {CreateStockCommandHandler} from "@domain/stock-management/manipulation/command-handlers(UseCase)/CreateStockCommandHandler";
import {AddItemToStockCommandHandler} from "@domain/stock-management/manipulation/command-handlers(UseCase)/AddItemToStockCommandHandler";
import {UpdateItemQuantityCommandHandler} from "@domain/stock-management/manipulation/command-handlers(UseCase)/UpdateItemQuantityCommandHandler";
import {rootController} from "@utils/logger";
import {PrismaClient} from "@prisma/client";

const configureStockRoutesV2 = async (prismaClient?: PrismaClient): Promise<Router> => {

    const prismaRepository = new PrismaStockVisualizationRepository(prismaClient);

    const stockVisualizationService = new StockVisualizationService(prismaRepository);

    const readUserRepo = new ReadUserRepository();
    const writeUserRepo = new WriteUserRepository();
    const userService = new UserService(readUserRepo, writeUserRepo);

    const stockController = new StockControllerVisualization(
        stockVisualizationService,
        userService
    );

    // Manipulation setup
    const commandRepository = new PrismaStockCommandRepository(prismaClient);
    const createStockHandler = new CreateStockCommandHandler(commandRepository);
    const addItemHandler = new AddItemToStockCommandHandler(commandRepository);
    const updateQuantityHandler = new UpdateItemQuantityCommandHandler(commandRepository);

    const manipulationController = new StockControllerManipulation(
        createStockHandler,
        addItemHandler,
        updateQuantityHandler,
        userService
    );

    const logger = rootController.getChildCategory("stockRoutesV2");

    const router = Router();

    router.get("/stocks", async (req, res) => {
        await stockController.getAllStocks(req, res);
    });

    logger.info("Routes for /stocks configured");

    router.get("/stocks/:stockId", async (req, res) => {
        await stockController.getStockDetails(req, res);
    });

    logger.info("Routes for /stocks/:stockId configured");

    router.get("/stocks/:stockId/items", async (req, res) => {
        await stockController.getStockItems(req, res);
    });

    logger.info("Routes for /stocks/:stockId/items configured");

    // Manipulation routes
    router.post("/stocks", async (req, res) => {
        await manipulationController.createStock(req as any, res);
    });

    logger.info("Routes for POST /stocks configured");

    router.post("/stocks/:stockId/items", async (req, res) => {
        await manipulationController.addItemToStock(req as any, res);
    });

    logger.info("Routes for POST /stocks/:stockId/items configured");

    router.patch("/stocks/:stockId/items/:itemId", async (req, res) => {
        await manipulationController.updateItemQuantity(req as any, res);
    });

    logger.info("Routes for PATCH /stocks/:stockId/items/:itemId configured");

    return router;
};

export default configureStockRoutesV2;