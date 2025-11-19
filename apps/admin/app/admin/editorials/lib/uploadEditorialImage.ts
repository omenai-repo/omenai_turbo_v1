import { storage, identifier } from "@omenai/appwrite-config";
import logRollbarServerError from "@omenai/shared-lib/rollbar/logRollbarServerError";

export async function uploadEditorialImage(image: File) {
  try {
    const response = await storage.createFile({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_BUCKET_ID!,
      fileId: identifier.unique(),
      file: image,
    });
    return { isOk: true, data: response };
  } catch (error) {
    if (error instanceof Error) {
      logRollbarServerError(error);
    } else {
      logRollbarServerError(error);
    }
    return {
      isOk: false,
      message:
        "Something went wrong with editorial image upload, please contact IT team",
    };
  }
}
