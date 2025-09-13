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

    /**
     * @swagger
     * /api/v2/stocks:
     *   get:
     *     summary: Liste des stocks de l'utilisateur
     *     description: Récupère tous les stocks associés à l'utilisateur authentifié
     *     tags:
     *       - Stocks V2
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Liste des stocks récupérée avec succès
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *       401:
     *         description: Non autorisé - Token manquant ou invalide
     *       500:
     *         description: Erreur serveur interne
     */
    router.get("/stocks", async (req, res) => {
        await stockController.getAllStocks(req, res);
    });

    /**
     * @swagger
     * /api/v2/stocks/{stockId}:
     *   get:
     *     summary: Détails d'un stock spécifique
     *     description: Récupère les détails complets d'un stock par son ID
     *     tags:
     *       - Stocks V2
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: stockId
     *         required: true
     *         description: Identifiant unique du stock
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Détails du stock récupérés avec succès
     *       401:
     *         description: Non autorisé
     *       404:
     *         description: Stock non trouvé
     *       500:
     *         description: Erreur serveur interne
     */
    router.get("/stocks/:stockId", async (req, res) => {
        await stockController.getStockDetails(req, res);
    });

    /**
     * @swagger
     * /api/v2/stocks/{stockId}/items:
     *   get:
     *     summary: Articles d'un stock
     *     description: Récupère tous les articles contenus dans un stock spécifique
     *     tags:
     *       - Stocks V2
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: stockId
     *         required: true
     *         description: Identifiant unique du stock
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Liste des articles du stock
     *       401:
     *         description: Non autorisé
     *       404:
     *         description: Stock non trouvé
     *       500:
     *         description: Erreur serveur interne
     */
    router.get("/stocks/:stockId/items", async (req, res) => {
        await stockController.getStockItems(req, res);
    });

    return router;
};

export default configureStockRoutesV2;