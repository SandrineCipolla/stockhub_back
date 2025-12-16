import {
    StockVisualizationService
} from "@domain/stock-management/visualization/services/StockVisualizationService";
import {UserService} from "@services/userService";
import {StockControllerVisualization} from "@api/controllers/StockControllerVisualization";
import {Router} from "express";
import {ReadUserRepository} from "@services/readUserRepository";
import {WriteUserRepository} from "@services/writeUserRepository";
import {
    PrismaStockVisualizationRepository
} from "@infrastructure/stock-management/visualization/repositories/PrismaStockVisualizationRepository";
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

    return router;
};

export default configureStockRoutesV2;