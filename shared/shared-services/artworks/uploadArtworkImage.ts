import { storage, identifier } from "@omenai/appwrite-config";
import { rollbarServerInstance } from "@omenai/rollbar-config";

const uploadImage = async (file: File) => {
  if (!file) return;

  try {
    const fileUploaded = await storage.createFile({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      fileId: identifier.unique(),
      file,
    });
    return fileUploaded;
  } catch (error) {
    rollbarServerInstance.error({
      context: "Appwrite create file error",
      error,
    });
  }
};

export default uploadImage;
