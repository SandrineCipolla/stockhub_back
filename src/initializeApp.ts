import authConfig from '@core/authConfig';
import { rootMain, rootSecurity, rootServerSetup } from '@utils/logger';
import express from 'express';
import cors from 'cors';
import { CustomError } from '@core/errors';
import passport from 'passport';
import configureStockRoutes from '@routes/stockRoutes';
import configureUserRoutes from '@routes/userRoutes';
import { authConfigbearerStrategy } from '@authentication/authBearerStrategy';
import { authenticationMiddleware } from '@authentication/authenticateMiddleware';
import { setupHttpServer } from '@serverSetup/setupHttpServer';
import configureStockRoutesV2 from '@api/routes/StockRoutesV2';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, openApiYamlContent } from '@config/openapi.config';

export async function initializeApp() {
  const app = express();

  const allowedOrigins =
    process.env.ALLOWED_ORIGINS?.split(',')
      .map(o => o.trim())
      .filter(Boolean) || [];

  const vercelPreviewCors = process.env.VERCEL_PREVIEW_CORS === 'true';

  rootServerSetup
    .getChildCategory('cors')
    .info('Allowed origins: {allowedOrigins}', { allowedOrigins });

  rootServerSetup
    .getChildCategory('cors')
    .info('Vercel preview CORS enabled: {vercelPreviewCors}', { vercelPreviewCors });

  const originFn = (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Requêtes sans origin (same-origin, Postman, mobile)
    if (!origin) {
      callback(null, true);
      return;
    }
    // Origines explicitement autorisées
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    // Previews Vercel (activé par VERCEL_PREVIEW_CORS=true)
    if (vercelPreviewCors && origin.endsWith('.vercel.app')) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  };

  const corsOptions: cors.CorsOptions = {
    origin: originFn,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Credentials'],
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use(express.json());

  rootServerSetup.getChildCategory('cors').info('Cors configuration completed');

  const clientID = authConfig.credentials.clientID;
  const audience = authConfig.credentials.clientID;

  if (!clientID || !audience) {
    rootMain.error('clientID or audience is not defined in authConfig');
    throw new Error('clientID or audience is not defined in authConfig');
  }

  const bearerStrategy = authConfigbearerStrategy;

  // ----------- Passport setup -----------

  rootSecurity.info('initialization of authentication ...');

  app.use(passport.initialize());

  passport.use(bearerStrategy);

  rootSecurity.info('initialization of authentication DONE!');

  // ----------- Swagger/OpenAPI Documentation -----------

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'StockHub API Documentation',
    })
  );

  app.get('/api-docs.json', (_req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.get('/api-docs.yaml', (_req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'text/yaml');
    res.send(openApiYamlContent);
  });

  rootMain.info('Swagger UI available at /api-docs');
  rootMain.info('OpenAPI JSON spec available at /api-docs.json');
  rootMain.info('OpenAPI YAML spec available at /api-docs.yaml');

  // ----------- Routes setup -----------

  const stockRoutesV2 = await configureStockRoutesV2();

  app.use(
    '/api/v2',
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      authenticationMiddleware(req, res, next);
    },
    (_req: express.Request, _res: express.Response, next: express.NextFunction) => {
      next();
    },
    (
      err: CustomError,
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      res.status(err.status || 500).send(err);
    },
    stockRoutesV2
  );
  rootMain.info('api/v2 routes (auth required) configured');
  // Middleware d'authentification appliqué seulement après les routes V2
  app.use(
    '/api/v1',
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      authenticationMiddleware(req, res, next);
    },
    (_req: express.Request, _res: express.Response, next: express.NextFunction) => {
      next();
    },
    (
      err: CustomError,
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      res.status(err.status || 500).send(err);
    }
  );
  rootMain.info('api/v1 routes (auth required) configured');

  const stockRoutes = await configureStockRoutes();
  app.use('/api/v1', stockRoutes);

  const userRoutes = await configureUserRoutes();
  app.use('/api/v1', userRoutes);

  app.use((_req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(404).send('Route not found');
  });

  app.use(
    (
      err: CustomError,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error(err.stack);
      res.status(500).send('Internal Server Error');
    }
  );

  setupHttpServer(app);
}
