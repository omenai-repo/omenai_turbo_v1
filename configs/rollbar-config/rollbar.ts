import Rollbar from "rollbar";

const baseConfig = {
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.NODE_ENV,
  // replay: {
  //   enabled: true,
  // },
};

export const clientConfig = {
  accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
  ...baseConfig,
};

export const rollbarServerInstance = new Rollbar({
  accessToken: process.env.ROLLBAR_SERVER_TOKEN,
  ...baseConfig,
});

export function logRollbarServerError(error: any) {
  if (error instanceof Error) {
    rollbarServerInstance.error(error);
  } else {
    // Wrap non-Error objects in an Error
    rollbarServerInstance.error(new Error(String(error)));
  }
}
