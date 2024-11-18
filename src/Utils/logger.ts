
import {LogLevel} from "typescript-logging";
import {CategoryProvider, Category} from "typescript-logging-category-style";

const provider = CategoryProvider.createProvider("ExampleProvider", {
    level: LogLevel.Info,
});

/* Create some root categories for this example, you can also expose getLogger() from the provider instead e.g. */
export const rootMain = provider.getCategory("main");
export const rootController = provider.getCategory("controller");
export const rootUtils = provider.getCategory("utils");

// Server setup
export const rootServerSetup = rootMain.getChildCategory("serverSetup");

// Security
export const rootSecurity = provider.getCategory("security");
export const rootSecurityAuthenticationMiddleware = rootSecurity.getChildCategory("authenticationMiddleware");

// Controller
export const rootStockController = rootController.getChildCategory("stockController");

// Database
export const rootDatabase = provider.getCategory("database");
export const rootReadUserRepository = rootDatabase.getChildCategory("readUserRepository");
