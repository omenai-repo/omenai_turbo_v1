import { storage } from "@omenai/appwrite-config";
import logRollbarServerError from "@omenai/shared-lib/rollbar/logRollbarServerError";

export async function deleteEditorialImage(fileId: string) {
  try {
    const response = await storage.deleteFile({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_BUCKET_ID!,
      fileId,
    });
    return { isOk: true };
  } catch (error) {
    if (error instanceof Error) {
      logRollbarServerError(error);
    } else {
      logRollbarServerError(error);
    }
    return {
      isOk: false,
      message:
        "Something went wrong with editorial image deletion, please contact IT team",
    };
  }
}
