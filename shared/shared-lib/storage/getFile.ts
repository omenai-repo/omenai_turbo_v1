import { storage } from "@omenai/appwrite-config/appwrite";

export const getImageFile = async (fileId: string) => {
  const fileData = await storage.getFile(
    process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
    fileId
  );

  return fileData;
};
