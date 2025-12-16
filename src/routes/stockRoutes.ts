import {Router} from "express";
import {StockController} from "@controllers/stockController";
import {ReadStockRepository} from "@repositories/readStockRepository";
import {WriteStockRepository} from "@repositories/writeStockRepository";
import {HTTP_CODE_INTERNAL_SERVER_ERROR} from "@utils/httpCodes";
import {ReadUserRepository} from "@services/readUserRepository";
import {WriteUserRepository} from "@services/writeUserRepository";
import {rootController} from "@utils/logger";

const configureStockRoutes = async (): Promise<Router> => {
    const rootConfigureStockRoutes = rootController.getChildCategory(
        "configureStockRoutes"
    );

    rootConfigureStockRoutes.info("Configuring stock routes...");

    const router = Router();

    const readStockRepository = new ReadStockRepository();
    const writeStockRepository = new WriteStockRepository();
    const readUser = new ReadUserRepository();
    const writeUser = new WriteUserRepository();
    const stockController = new StockController(
        readStockRepository,
        writeStockRepository,
        readUser,
        writeUser
    );

    //Route pour récupération de la liste des stocks
    router.get("/stocks", async (req, res) => {
        try {
            await stockController.getAllStocks(req, res);
        } catch (error) {
            console.error("Error in GET /stocks:", error);
            res
                .status(HTTP_CODE_INTERNAL_SERVER_ERROR)
                .json({error: "Error while querying the database."});
        }
    });

    //Route pour récupérer le détail d'un stock via l'ID
    router.get("/stocks/:ID", async (req, res) => {
        const ID = Number(req.params.ID);
        try {
            await stockController.getStockDetails(req, res);
        } catch (error) {
            console.error(`Error in GET /stocks/${ID}:`, error);
            res
                .status(HTTP_CODE_INTERNAL_SERVER_ERROR)
                .json({error: "Error while querying the database."});
        }
    });

    //Route pour récupérer les items d'un stock via l'ID
    router.get("/stocks/:ID/items", async (req, res) => {
        const ID = Number(req.params.ID);
        try {
            await stockController.getStockItems(req, res);
        } catch (error) {
            console.error(`Error in GET /stocks/${ID}/items:`, error);
            res
                .status(HTTP_CODE_INTERNAL_SERVER_ERROR)
                .json({error: "Error while querying the database."});
        }
    });

    //Route pour créer un nouveau stock
    router.post("/stocks", async (req, res) => {
        try {
            await stockController.createStock(req, res);
        } catch (error) {
            rootController.error("Error in POST /stocks:", error);
            res
                .status(HTTP_CODE_INTERNAL_SERVER_ERROR)
                .json({error: "Error while querying the database."});
        }
    });

    //Route pour mettre à jour un stock (via l'id?)
    router.put("/stocks/:stockID/items/:itemID", async (req, res) => {
        const itemID = Number(req.params.itemID);
        const {QUANTITY} = req.body;
        const stockID = Number(req.params.stockID);
        console.info("New quantity:", QUANTITY);
        try {
            await stockController.updateStockItemQuantity(req, res);
        } catch (error) {
            console.error(`Error in PUT /stocks/${stockID}/items/${itemID}:`, error);
            res
                .status(HTTP_CODE_INTERNAL_SERVER_ERROR)
                .json({error: "Error while querying the database."});
        }
    });

    //Route pour créer un nouvel item
    router.post("/stocks/:stockID/items", async (req, res) => {
        try {
            const stockID = Number(req.params.stockID);
            await stockController.addStockItem(req, res);
        } catch (error) {
            console.error("Error in POST /stocks/:stockID/items", error);
            res
                .status(HTTP_CODE_INTERNAL_SERVER_ERROR)
                .json({error: "Error in adding stock item to database(POST)."});
        }
    });

    //Route pour supprimer un item
    router.delete("/stocks/:stockID/items/:itemID", async (req, res) => {
        const itemID = Number(req.params.itemID);
        const stockID = Number(req.params.stockID);
        try {
            await stockController.deleteStockItem(req, res);
        } catch (error) {
            console.error(
                `Error in DELETE /stocks/${stockID}/items/${itemID}:`,
                error
            );
            res.status(HTTP_CODE_INTERNAL_SERVER_ERROR).json({
                error: "Error while deleting the stock item from the database.",
            });
        }
    });

    //Route pour supprimer un stock
    router.delete("/stocks/:stockID", async (req, res) => {
        const stockID = Number(req.params.stockID);
        console.log(`Attempting to delete stock with ID: ${stockID}`);
        try {
            await stockController.deleteStock(req, res);
            console.log(`Stock with ID ${stockID} deleted successfully`);
        } catch (error) {
            console.error(`Error in DELETE /stocks/${stockID}:`, error);
            res
                .status(HTTP_CODE_INTERNAL_SERVER_ERROR)
                .json({error: "Error while deleting the stock from the database."});
        }
    });

    //Route pour récupérer la liste des items
    router.get("/items", async (req, res) => {
        try {
            await stockController.getAllItems(req, res);
        } catch (error) {
            console.error(`Error in GET /items:`, error);
            res
                .status(HTTP_CODE_INTERNAL_SERVER_ERROR)
                .json({error: "Error while querying the database for items list."});
        }
    });

    // Route pour afficher un item spécifique d'un stock
    router.get("/stocks/:stockID/items/:itemID", async (req, res) => {
        const {itemID} = req.params;
        try {
            await stockController.getItemDetails(req, res);
        } catch (error) {
            console.error(`Error in GET /items/${itemID}:`, error);
            res
                .status(HTTP_CODE_INTERNAL_SERVER_ERROR)
                .json({error: "Error while querying the database."});
        }
    });

    //Route pour afficher les stocks faibles
    router.get("/low-stock-items", async (req, res) => {
        try {
            await stockController.getLowStockItems(req, res);
        } catch (error) {
            console.error("Error in Get /low-stock-items:", error);
            res.status(HTTP_CODE_INTERNAL_SERVER_ERROR).json({
                error: "Error while quering the database for low stock items",
            });
        }
    });

    rootConfigureStockRoutes.info("Configuring stock routes DONE!");

    return router;
};

export default configureStockRoutes;
