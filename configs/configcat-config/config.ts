import * as configcat from "@configcat/sdk/node";

const logger = configcat.createConsoleLogger(configcat.LogLevel.Info); // Set the log level to INFO to track how your feature flags were evaluated. When moving to production, you can remove this line to avoid too detailed logging.

const sdkKey =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_CONFIGCAT_STAGING_SDK_KEY! // TODO: Change to NEXT_PUBLIC_CONFIGCAT_SDK_KEY when going to production
    : process.env.NEXT_PUBLIC_CONFIGCAT_STAGING_SDK_KEY!;

const configCatClient = configcat.getClient(
  sdkKey,
  configcat.PollingMode.AutoPoll,
  {
    logger: logger,
  }
);

export default configCatClient;
