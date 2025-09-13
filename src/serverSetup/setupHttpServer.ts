import express from "express";
import {HttpPort} from "../config/httpPortConfiguration";
import {rootServerSetup} from "../Utils/logger";
import swaggerUi from "swagger-ui-express";
import {swaggerSpec} from "../docs/swagger";

rootServerSetup.info('Setup HTTP Server {httpsPort}', HttpPort);

export function setupHttpServer(app: express.Application) {

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.listen(HttpPort, () => {
        rootServerSetup.info('HTTP Server running on port {HttpPort}', HttpPort);
    });

}