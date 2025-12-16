import fs from "fs";
import https from "https";
import express from "express";
import { HttpsPort } from "@config/httpPortConfiguration";
import { rootServerSetup } from "@utils/logger";
import { isDevelopmentMode } from "@config/runtimeMode";

const serverKeyPath = "/etc/ssl/private/selfsigned.key";
const serverCertPath = "/etc/ssl/certs/selfsigned.crt";

rootServerSetup.info("certificate key path {serverKeyPath}", serverKeyPath);
rootServerSetup.info("certificate key path {serverCertPath}", serverCertPath);

rootServerSetup.info("Setup HTTPS Server {httpsPort}", HttpsPort);

const readServerKey = () => {
  if (isDevelopmentMode()) {
    return fs.readFileSync(__dirname + "../../../server.key");
  }
  fs.readFileSync(serverKeyPath);
};

const readServerCert = () => {
  if (isDevelopmentMode()) {
    return fs.readFileSync(__dirname + "../../../server.cert");
  }
  fs.readFileSync(serverCertPath);
};

export function startHttpsServer(app: express.Application) {
  const options = {
    key: readServerKey(),
    cert: readServerCert(),
  };

  const httpsServer = https.createServer(options, app);

  rootServerSetup.info("HTTPS server created.");

  httpsServer.listen(HttpsPort, () => {
    rootServerSetup.info("HTTPS Server running on port {HttpsPort}", HttpsPort);
  });
}
