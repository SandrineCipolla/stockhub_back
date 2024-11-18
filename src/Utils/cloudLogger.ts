const appInsights = require("applicationinsights");

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
  .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
  .start();

const client = appInsights.defaultClient;

export const rootCloudEvent = (eventName: string, eventData: any) => {
  client.trackEvent({
    name: eventName,
    properties: { customProperty: eventData },
  });
};
