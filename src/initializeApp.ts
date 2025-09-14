import authConfig from "./authConfig";
import {rootMain, rootSecurity} from "./Utils/logger";
import express from "express";
import {CustomError} from "./errors";
import passport from "passport";
import configureStockRoutes from "./routes/stockRoutes";
import configureUserRoutes from "./routes/userRoutes";
import {authConfigbearerStrategy} from "./authentication/authBearerStrategy";
import {authenticationMiddleware} from "./authentication/authenticateMiddleware";
import {setupHttpServer} from "./serverSetup/setupHttpServer";
import configureStockRoutesV2 from "./api/routes/StockRoutesV2";

export async function initializeApp() {
    const app = express();

    app.use(express.json());

    // // Configuration CORS globale améliorée
    // app.use(cors(corsConfig));
    //
    // // Middleware pour gérer explicitement les requêtes OPTIONS (preflight)
    // app.options('*', cors(corsConfig));
    app.use((req, res, next) => {
        const allowedOrigin = 'https://brave-field-03611eb03.5.azurestaticapps.net';
        const origin = req.headers.origin;

        // Permettre l'origine spécifique ou * en développement
        if (origin === allowedOrigin || process.env.NODE_ENV === 'development') {
            res.setHeader('Access-Control-Allow-Origin', origin || '*');
        }

        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        res.setHeader('Access-Control-Max-Age', '86400');

        // Gérer les requêtes preflight OPTIONS
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        next();
    });

    const clientID = authConfig.credentials.clientID;
    const audience = authConfig.credentials.clientID;

    if (!clientID || !audience) {
        rootMain.error("clientID or audience is not defined in authConfig");
        throw new Error("clientID or audience is not defined in authConfig");
    }

    const bearerStrategy = authConfigbearerStrategy;

    rootSecurity.info("initialization of authentication ...");

    app.use(passport.initialize());

    passport.use(bearerStrategy);

    rootSecurity.info("initialization of authentication DONE!");

    // IMPORTANT: Routes V2 configurées avec authentification
    const stockRoutesV2 = await configureStockRoutesV2();

    // // Middleware spécifique pour V2 avec CORS renforcé ET authentification
    // app.use("/api/v2",
    //     cors(corsV2Config),
    //     (req: any, res: any, next: any) => {
    //         // Ajout d'headers CORS supplémentaires si nécessaire
    //         res.header('Access-Control-Allow-Origin', '*');
    //         res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    //         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    //         next();
    //     },
    //     (
    //         req: express.Request,
    //         res: express.Response,
    //         next: express.NextFunction
    //     ) => {
    //         authenticationMiddleware(res, req, next);
    //     },
    //     (
    //         req: express.Request,
    //         res: express.Response,
    //         next: express.NextFunction
    //     ) => {
    //         next();
    //     },
    //     (
    //         err: CustomError,
    //         req: express.Request,
    //         res: express.Response,
    //         next: express.NextFunction
    //     ) => {
    //         res.locals.message = err.message;
    //         res.locals.error = req.app.get("env") === "development" ? err : {};
    //         res.status(err.status || 500).send(err);
    //     },
    //     stockRoutesV2
    // );
    // rootMain.info('api/v2 routes (auth required) configured');
// Middleware spécifique pour V2 SANS redéfinir CORS (déjà géré au niveau global)
    app.use("/api/v2",
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            authenticationMiddleware(res, req, next);
        },
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            next();
        },
        (
            err: CustomError,
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            res.locals.message = err.message;
            res.locals.error = req.app.get("env") === "development" ? err : {};
            res.status(err.status || 500).send(err);
        },
        stockRoutesV2
    );
    rootMain.info('api/v2 routes (auth required) configured');
    // Middleware d'authentification appliqué seulement après les routes V2
    app.use(
        "/api/v1",
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            authenticationMiddleware(res, req, next);
        },
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            next();
        },
        (
            err: CustomError,
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            res.locals.message = err.message;
            res.locals.error = req.app.get("env") === "development" ? err : {};
            res.status(err.status || 500).send(err);
        }
    );
    rootMain.info('api/v1 routes (auth required) configured');

    const stockRoutes = await configureStockRoutes();
    app.use("/api/v1", stockRoutes);

    const userRoutes = await configureUserRoutes();
    app.use("/api/v1", userRoutes);

    app.use(
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            res.status(404).send("Route not found");
        }
    );

    app.use(
        (
            err: CustomError,
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            console.error(err.stack);
            res.status(500).send("Internal Server Error");
        }
    );

    setupHttpServer(app);
}
