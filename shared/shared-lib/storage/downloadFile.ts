import { storage } from "@omenai/appwrite-config/appwrite";

export const downloadFile = async (fileId: string) => {
  const fileData = storage.getFileDownload({
    bucketId: process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!,
    fileId,
  });

  return fileData;
};
