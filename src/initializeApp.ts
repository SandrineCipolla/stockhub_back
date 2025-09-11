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
import cors from "cors";
import configureStockRoutesV2 from "./api/routes/StockRoutesV2";

export async function initializeApp() {
    const app = express();

    app.use(
        cors({
            origin: "*",
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: false,
            optionsSuccessStatus: 204,
        })
    );

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
    //injection OID directement pour tester les routes v2 sans auth
    app.use("/api/v2", (req, res, next) => {
        (req as any).userID = "sandrine.cipolla@gmail.com";
        next();
    }, stockRoutesV2);
    rootMain.info('api/v2 routes (no auth required) configured');

    app.use(
        "/api",
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
