import { rootMain } from './logger';
import * as appInsights from 'applicationinsights';

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

const client = appInsights.defaultClient;

export const rootCloudEvent = (eventName: string, eventData: any) => {
  client.trackEvent({
    name: eventName,
    properties: { customProperty: eventData },
  });
};

export const rootDependency = (depTelemetry: DependencyTelemetry) => {
  client.trackDependency(depTelemetry);
};

export const rootException = (error: Error) => {
  client.trackException({ exception: error });
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
