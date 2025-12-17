import { rootServerSetup } from '@utils/logger';

export const selectedRuntimeMode = process.env.NODE_ENV;

const developmentMode = 'development';
const productionMode = 'production';
const testMode = 'test';

function isDevelopmentMode() {
  return selectedRuntimeMode === developmentMode;
}

function isProductionMode() {
  return selectedRuntimeMode === productionMode;
}
