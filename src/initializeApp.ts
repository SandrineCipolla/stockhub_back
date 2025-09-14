import authConfig from "./authConfig";
import {rootMain, rootSecurity} from "./Utils/logger";
import express from "express";
import cors from "cors";
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


    app.use((req, res, next) => {

        const origin = req.headers.origin;
        console.log('🔍 Origin received:', origin);
        console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

        const isProduction = process.env.NODE_ENV === 'production';
        const isProdOrigin = origin === 'https://brave-field-03611eb03.5.azurestaticapps.net';
        const isDevOrigin = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));

        if ((isProduction && isProdOrigin) || (!isProduction && isDevOrigin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }

        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
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


    const stockRoutesV2 = await configureStockRoutesV2();

    app.use("/api/v2",
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            authenticationMiddleware(req, res, next);
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
            authenticationMiddleware(req, res, next);
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