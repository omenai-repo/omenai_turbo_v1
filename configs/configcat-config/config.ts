import * as configcat from "@configcat/sdk/node";

const highRiskSdkKey =
  process.env.APP_ENV === "production"
    ? (process.env.CONFIGCAT_HIGH_RISK_SDK_KEY as string)
    : (process.env.CONFIGCAT_STAGING_HIGH_RISK_SDK_KEY as string);

const lowRiskSdkKey =
  process.env.APP_ENV === "production"
    ? (process.env.CONFIGCAT_LOW_RISK_SDK_KEY as string)
    : (process.env.CONFIGCAT_STAGING_LOW_RISK_SDK_KEY as string);

const highRiskconfigCatClient = configcat.getClient(
  highRiskSdkKey,
  configcat.PollingMode.AutoPoll,
);

const lowRiskConfigCatClient = configcat.getClient(
  lowRiskSdkKey,
  configcat.PollingMode.AutoPoll,
);
export { highRiskconfigCatClient, lowRiskConfigCatClient };
