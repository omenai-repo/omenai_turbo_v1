import { storage } from "@omenai/appwrite-config/appwrite";

export const getImageFile = async (fileId: string) => {
  const fileData = await storage.getFile({

    bucketId:process.env.NEXT_PUBLIC_DOCUMENTATION_BUCKET_ID!,
    fileId
  }
  );

  return fileData;
};
