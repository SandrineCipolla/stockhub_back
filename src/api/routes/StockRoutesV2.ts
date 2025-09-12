import {
    StockVisualizationService
} from "../../domain/stock-management/visualization/services/StockVisualizationService";
import {UserService} from "../../services/userService";
import {StockControllerVisualization} from "../controllers/StockControllerVisualization";
import {Router} from "express";
import {ReadUserRepository} from "../../services/readUserRepository";
import {WriteUserRepository} from "../../services/writeUserRepository";
import {PrismaStockVisualizationRepository} from "../../db/repositories/PrismaStockVisualizationRepository";

const prismaRepository = new PrismaStockVisualizationRepository();

const stockVisualizationService = new StockVisualizationService(prismaRepository);

const readUserRepo = new ReadUserRepository();
const writeUserRepo = new WriteUserRepository();
const userService = new UserService(readUserRepo, writeUserRepo);

const stockController = new StockControllerVisualization(
    stockVisualizationService,
    userService
);

const configureStockRoutesV2 = async (): Promise<Router> => {
    const router = Router();

    router.get("/stocks", async (req, res) => {
        await stockController.getAllStocks(req, res);
    });

    router.get("/stocks/:stockId", async (req, res) => {
        await stockController.getStockDetails(req, res);
    });

    router.get("/stocks/:stockId/items", async (req, res) => {
        await stockController.getStockItems(req, res);
    });

    return router;
};

export default configureStockRoutesV2;