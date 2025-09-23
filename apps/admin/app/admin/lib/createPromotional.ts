import { storage } from "@omenai/appwrite-config";
import { ID } from "appwrite";

export const upload_promotional_image = async (file: File) => {
  if (!file) return;
  const fileUploaded = await storage.createFile({
    bucketId:process.env.NEXT_PUBLIC_APPWRITE_PROMOTIONAL_BUCKET_ID!,
    fileId:ID.unique(),
    file
  }

  );
  return fileUploaded;
};
