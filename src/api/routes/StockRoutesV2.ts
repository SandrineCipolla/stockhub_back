import {
    StockVisualizationService
} from "../../domain/stock-management/visualization/services/StockVisualizationService";
import {UserService} from "../../services/userService";
import {StockControllerVisualization} from "../controllers/StockControllerVisualization";
import {Router} from "express";
import {ReadUserRepository} from "../../services/readUserRepository";
import {WriteUserRepository} from "../../services/writeUserRepository";
import {PrismaStockVisualizationRepository} from "../../db/repositories/PrismaStockVisualizationRepository";
import {requireAdmin, requireAuth} from "../../authentication/authenticateMiddleware";


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

    // Route to get all stocks for the authenticated user
    router.get("/stocks", requireAuth, async (req, res) => {
        try {
            await stockController.getAllStocks(req, res);
        } catch (error) {
            console.error("Error in GET /stocks:", error);
            res.status(500).json({error: "Error while fetching stocks."});
        }
    });

    router.get("/stocks/:stockId", requireAuth, async (req, res) => {
        try {
            await stockController.getStockDetails(req, res);
        } catch (error) {
            console.error("Error in GET /stocks/:stockId:", error);
            res.status(500).json({error: "Error while fetching stock details."});
        }
    });

    router.get("/stocks/:stockId/items", requireAuth, async (req, res) => {
        try {
            await stockController.getStockItems(req, res);
        } catch (error) {
            console.error("Error in GET /stocks/:stockId/items:", error);
            res.status(500).json({error: "Error while fetching stock items."});
        }
    });

    router.post("/stocks/:stockId/items/:itemId/restock-request", requireAuth, async (req, res) => {
        await stockController.createRestockRequest(req, res);
    });

    // User normal : Voir ses propres demandes
    router.get("/restock-requests/my-requests", requireAuth, async (req, res) => {
        try {
            await stockController.getMyRestockRequests(req, res);
        } catch (error) {
            console.error("Error in GET my-requests:", error);
            res.status(500).json({error: "Error while fetching restock requests."});
        }
    });

    // Admin : Voir toutes les demandes de réappro pour ses stocks
    router.get("/restock-requests", requireAdmin, async (req, res) => {
        try {
            await stockController.getAllRestockRequests(req, res);
        } catch (error) {
            console.error("Error in GET restock-requests:", error);
            res.status(500).json({error: "Error while fetching restock requests."});
        }
    });

    // Admin : Approuver/Rejeter une demande et mettre à jour le stock
    router.put("/restock-requests/:requestId/approve", requireAdmin, async (req, res) => {
        try {
            await stockController.approveRestockRequest(req, res);
        } catch (error) {
            console.error("Error in PUT approve restock-request:", error);
            res.status(500).json({error: "Error while approving restock request."});
        }
    });

    router.put("/restock-requests/:requestId/reject", requireAdmin, async (req, res) => {
        try {
            await stockController.rejectRestockRequest(req, res);
        } catch (error) {
            console.error("Error in PUT reject restock-request:", error);
            res.status(500).json({error: "Error while rejecting restock request."});
        }
    });

    // ADMIN SEULEMENT : Mise à jour directe du stock (sans demande)
    router.put("/stocks/:stockId/items/:itemId/quantity", requireAdmin, async (req, res) => {
        try {
            await stockController.updateStockItemQuantity(req, res);
        } catch (error) {
            console.error("Error in PUT update quantity:", error);
            res.status(500).json({error: "Error while updating stock quantity."});
        }
    });

    return router;
};

export default configureStockRoutesV2;
