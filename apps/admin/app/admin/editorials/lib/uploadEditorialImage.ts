import { storage, identifier } from "@omenai/appwrite-config";
import { logRollbarServerError } from "@omenai/rollbar-config";

export async function uploadEditorialImage(image: File) {
  try {
    const response = await storage.createFile({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_BUCKET_ID!,
      fileId: identifier.unique(),
      file: image,
    });
    return { isOk: true, data: response };
  } catch (error) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message:
        "Something went wrong with editorial image upload, please contact IT team",
    };
  }
}
