import { storage } from "@omenai/appwrite-config";
import { ID } from "appwrite";

export const download_artist_resume = (file: string) => {
  if (!file) return;
  const fileDownload = storage.getFileDownload({
    bucketId:process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!,
    fileId:file
  }
  );
  return fileDownload;
};
