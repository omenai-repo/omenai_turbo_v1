import { rollbarServerInstance } from "@omenai/rollbar-config";

export async function testRollbar() {
  try {
    throw new Error("This is a test error for Rollbar");
  } catch (error) {
    console.log("Rollbar test error captured:", error);
    if (error instanceof Error) {
      rollbarServerInstance.error(error);
    } else {
      // Wrap non-Error objects in an Error
      rollbarServerInstance.error(new Error(String(error)));
    }
  }
}
