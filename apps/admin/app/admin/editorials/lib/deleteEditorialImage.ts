import { storage } from "@omenai/appwrite-config";

export async function deleteEditorialImage(fileId: string) {
  try {
    const response = await storage.deleteFile({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_BUCKET_ID!,
      fileId
    }

    );
    return { isOk: true };
  } catch (error) {
    return {
      isOk: false,
      message:
        "Something went wrong with editorial image deletion, please contact IT team",
    };
  }
}
