import {rootServerSetup} from "../Utils/logger";

export const selectedRuntimeMode = process.env.NODE_ENV;

export const developmentMode = "development";
export const productionMode = "production";
export const testMode = "test";

export function isDevelopmentMode() {
    return selectedRuntimeMode === developmentMode;
}

export function isProductionMode() {
    return selectedRuntimeMode === productionMode;
}