import {
  appwrite_image_format,
  appwrite_image_gravity,
  promotional_storage,
} from "@omenai/appwrite-config/appwrite";

export const getPromotionalFileView = (
  fileId: string,
  width: number,
  height?: number,
  format?: string
) => {
  const fileData = promotional_storage.getFileView(
    process.env.NEXT_PUBLIC_APPWRITE_PROMOTIONAL_BUCKET_ID!,
    fileId
  );

  return fileData;
};
