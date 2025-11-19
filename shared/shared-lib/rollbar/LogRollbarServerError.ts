import { rollbarServerInstance } from "@omenai/rollbar-config";

export default function logRollbarServerError(error: any) {
  if (error instanceof Error) {
    rollbarServerInstance.error(error);
  } else {
    // Wrap non-Error objects in an Error
    rollbarServerInstance.error(new Error(String(error)));
  }
}
