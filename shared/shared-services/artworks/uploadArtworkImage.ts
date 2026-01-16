import { storage, identifier } from "@omenai/appwrite-config";
import { rollbarServerInstance } from "@omenai/rollbar-config";

const uploadImage = async (file: File, timeout = 60000) => {
  if (!file) return;

  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Upload timed out")), timeout)
  );

  try {
    // Race between actual upload and timeout
    const fileUploaded = await Promise.race([
      storage.createFile({
        bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        fileId: identifier.unique(),
        file,
      }),
      timeoutPromise,
    ]);

    return fileUploaded;
  } catch (error) {
    rollbarServerInstance.error({
      context: "Appwrite create file error",
      error,
    });

    // Bubble the error so the caller knows
    throw error;
  }
};

export default uploadImage;
