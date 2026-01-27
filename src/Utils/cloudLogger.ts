import { rootMain } from './logger';
import * as appInsights from 'applicationinsights';

// Disable Application Insights in test environment to avoid connection timeouts
const isTestEnvironment =
  process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

if (!isTestEnvironment && process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights
    .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .start();

  rootMain.info('Application Insights started.');
} else {
  rootMain.info('Application Insights disabled (test environment or no connection string).');
}

const client = appInsights.defaultClient;

export const rootCloudEvent = (eventName: string, eventData: unknown) => {
  if (!isTestEnvironment && client) {
    client.trackEvent({
      name: eventName,
      properties: { customProperty: eventData },
    });
  }
};

export const rootDependency = (depTelemetry: DependencyTelemetry) => {
  if (!isTestEnvironment && client) {
    client.trackDependency(depTelemetry);
  }
};

export const rootException = (error: Error) => {
  if (!isTestEnvironment && client) {
    client.trackException({ exception: error });
  }
};

export interface DependencyTelemetry {
  target: string;
  name: string;
  data: string;
  duration: number;
  resultCode: number;
  success: boolean;
  dependencyTypeName: string;
}
