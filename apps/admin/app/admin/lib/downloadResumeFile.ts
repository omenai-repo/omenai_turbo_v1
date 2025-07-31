import { documentation_storage } from "@omenai/appwrite-config";
import { ID } from "appwrite";

export const download_artist_resume = (file: string) => {
  if (!file) return;
  const fileDownload = documentation_storage.getFileDownload(
    process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!,

    file
  );
  return fileDownload;
};
