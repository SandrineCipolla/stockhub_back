import authConfig from "./authConfig";
import { rootMain, rootSecurity, rootServerSetup } from "./Utils/logger";
import express from "express";
import { CustomError } from "./errors";
import passport from "passport";
import configureStockRoutes from "./routes/stockRoutes";
import configureUserRoutes from "./routes/userRoutes";
import { authConfigbearerStrategy } from "./authentication/authBearerStrategy";
import { authenticationMiddleware } from "./authentication/authenticateMiddleware";
import { startHttpsServer } from "./serverSetup/setupHttpsServer";
import { setupHttpServer } from "./serverSetup/setupHttpServer";
import { isProductionMode, selectedRuntimeMode } from "./config/runtimeMode";
import cors from "cors";
import { corsConfig } from "./config/corsConfig";
import { CorsOptions } from "cors";

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

  app.use(express.json());
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.use(passport.initialize());

  passport.use(bearerStrategy);

  rootSecurity.info("initialization of authentication DONE!");

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

  const stockRoutes = await configureStockRoutes();
  app.use("/api/v1", stockRoutes);

  const userRoutes = await configureUserRoutes();
  app.use("/api/v1", userRoutes);

  app.get("/hello", (req: express.Request, res: express.Response) => {
    res.status(200).send("Hello World");
  });

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

  startHttpsServer(app);

  setupHttpServer(app);
}
