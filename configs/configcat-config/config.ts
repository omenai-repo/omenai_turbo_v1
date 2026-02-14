import * as configcat from "@configcat/sdk/node";

const highRiskSdkKey = process.env.CONFIGCAT_HIGH_RISK_SDK_KEY as string;

const lowRiskSdkKey = process.env.CONFIGCAT_LOW_RISK_SDK_KEY as string;

const highRiskconfigCatClient = configcat.getClient(
  highRiskSdkKey,
  configcat.PollingMode.AutoPoll,
);

const lowRiskConfigCatClient = configcat.getClient(
  lowRiskSdkKey,
  configcat.PollingMode.AutoPoll,
);
export { highRiskconfigCatClient, lowRiskConfigCatClient };
