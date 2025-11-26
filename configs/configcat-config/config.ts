import * as configcat from "@configcat/sdk/node";

const logger = configcat.createConsoleLogger(configcat.LogLevel.Info); // Set the log level to INFO to track how your feature flags were evaluated. When moving to production, you can remove this line to avoid too detailed logging.

const highRiskSdkKey =
  process.env.NODE_ENV === "production"
    ? process.env.CONFIGCAT_STAGING_HIGH_RISK_SDK_KEY! // TODO: Change to CONFIGCAT_HIGH_RISK_SDK_KEY when going to production
    : process.env.CONFIGCAT_STAGING_HIGH_RISK_SDK_KEY!;

const lowRiskSdkKey =
  process.env.NODE_ENV === "production"
    ? process.env.CONFIGCAT_STAGING_LOW_RISK_SDK_KEY! // TODO: Change to CONFIGCAT_LOW_RISK_SDK_KEY when going to production
    : process.env.CONFIGCAT_STAGING_LOW_RISK_SDK_KEY!;

const highRiskconfigCatClient = configcat.getClient(
  highRiskSdkKey,
  configcat.PollingMode.AutoPoll,
  {
    logger: logger,
  }
);

const lowRiskConfigCatClient = configcat.getClient(
  lowRiskSdkKey,
  configcat.PollingMode.AutoPoll,
  {
    logger: logger,
    pollIntervalSeconds: 60, // Poll for changes every 60 seconds
  }
);
export { highRiskconfigCatClient, lowRiskConfigCatClient };
