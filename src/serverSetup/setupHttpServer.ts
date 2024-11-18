import express from "express";
import {HttpPort} from "../config/httpPortConfiguration";
import {rootServerSetup} from "../Utils/logger";

rootServerSetup.info('Setup HTTP Server {httpsPort}', HttpPort);

export function setupHttpServer(app: express.Application) {

    app.listen(HttpPort, () => {
        rootServerSetup.info('HTTP Server running on port {HttpPort}', HttpPort);
    });

}