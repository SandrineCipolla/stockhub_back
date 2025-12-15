import 'tsconfig-paths/register';
import { rootMain } from "./Utils/logger";
import { initializeApp } from "./initializeApp";
import { selectedRuntimeMode } from "./config/runtimeMode";
import { rootCloudEvent } from "./Utils/cloudLogger";
import dotenv from "dotenv";

rootMain.info("Starting application ...");

dotenv.config();

rootMain.info(
  "Selected runtime mode is {selectedRuntimeMode}",
  selectedRuntimeMode
);

rootCloudEvent("Application started", {
  selectedRuntimeMode,
});

if (process.env.NODE_ENV !== "test") {
  initializeApp();
}
