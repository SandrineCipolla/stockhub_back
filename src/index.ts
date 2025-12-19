import 'tsconfig-paths/register';
import { rootMain } from '@utils/logger';
import { initializeApp } from '@core/initializeApp';
import { selectedRuntimeMode } from '@config/runtimeMode';
import { rootCloudEvent } from '@utils/cloudLogger';
import dotenv from 'dotenv';

rootMain.info('Starting application ...');

dotenv.config();

rootMain.info('Selected runtime mode is {selectedRuntimeMode}', selectedRuntimeMode);

rootCloudEvent('Application started', {
  selectedRuntimeMode,
});

if (process.env.NODE_ENV !== 'test') {
  initializeApp();
}
