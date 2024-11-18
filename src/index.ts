import { rootMain } from "./Utils/logger";
import { initializeApp } from "./initializeApp";
import { selectedRuntimeMode } from "./config/runtimeMode";
import { rootCloudEvent } from "./Utils/cloudLogger";

rootMain.info("Application Insights started");

rootMain.info("Starting application ...");
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
